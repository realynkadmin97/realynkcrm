import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";
import pg from "pg";
import { hashPassword } from "@/lib/crypto";
import { bootstrapAdmin, configuredEmailDomain } from "@/lib/env";

export type SqlRow = Record<string, unknown>;
export type QueryFn = (text: string, params?: unknown[]) => Promise<SqlRow[]>;

type Holder = {
  ready?: Promise<void>;
  pglite?: PGlite;
  pool?: pg.Pool;
  configError: string | null;
};

const globalStore = globalThis as unknown as { __realynkCrm?: Holder };

function holder() {
  globalStore.__realynkCrm ??= { configError: null };
  return globalStore.__realynkCrm;
}

function databaseUrl() {
  return process.env.DATABASE_URL?.trim() ?? "";
}

async function execRaw<T extends SqlRow>(text: string, params: unknown[] = []) {
  const current = holder();
  if (current.pool) {
    const result = await current.pool.query<T>(text, params);
    return result.rows;
  }
  if (!current.pglite) throw new Error("CRM:database_unavailable");
  const result = await current.pglite.query<T>(text, params);
  return result.rows;
}

async function applyRuntimeConfig() {
  const current = holder();
  current.configError = null;
  try {
    await execRaw("select private.apply_runtime_config($1)", [configuredEmailDomain()]);
  } catch (error) {
    current.configError = error instanceof Error ? error.message : "CRM:invalid_domain";
    return;
  }
  const admin = bootstrapAdmin();
  if (!admin) return;
  try {
    const passwordHash = await hashPassword(admin.password);
    await execRaw("select private.ensure_bootstrap_admin($1, $2, $3)", [admin.email, admin.name, passwordHash]);
  } catch (error) {
    current.configError = error instanceof Error ? error.message : "CRM:bootstrap_domain";
  }
}

async function start() {
  const current = holder();
  if (databaseUrl()) {
    current.pool = new pg.Pool({ connectionString: databaseUrl(), max: 5 });
  } else {
    const db = new PGlite();
    current.pglite = db;
    const directory = path.join(process.cwd(), "migrations");
    const files = (await readdir(directory).catch(() => [])).filter((file) => file.endsWith(".sql")).sort();
    for (const file of files) {
      await db.exec(await readFile(path.join(directory, file), "utf8"));
    }
  }
  await applyRuntimeConfig();
}

export async function ready() {
  const current = holder();
  if (!current.ready) {
    current.ready = start().catch((error: unknown) => {
      current.ready = undefined;
      current.pglite = undefined;
      throw error;
    });
  }
  await current.ready;
}

export function configError() {
  return holder().configError;
}

export async function queryAuth<T extends SqlRow = SqlRow>(text: string, params: unknown[] = []) {
  await ready();
  return execRaw<T>(text, params);
}

export async function withUser<T>(userId: string, fn: (query: QueryFn) => Promise<T>) {
  await ready();
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userId)) {
    throw new Error("CRM:invalid_user");
  }
  const current = holder();
  if (current.pool) {
    const client = await current.pool.connect();
    try {
      await client.query("begin");
      try {
        await client.query("set local role crm_app");
        await client.query("select set_config('app.user_id', $1, true)", [userId]);
        const who = await client.query<{ current_user: string }>("select current_user");
        if (who.rows[0]?.current_user !== "crm_app") throw new Error("CRM:role_not_applied");
        const result = await fn(async (text, params = []) => (await client.query(text, params)).rows as SqlRow[]);
        await client.query("commit");
        return result;
      } catch (error) {
        await client.query("rollback");
        throw error;
      }
    } finally {
      client.release();
    }
  }
  if (!current.pglite) throw new Error("CRM:database_unavailable");
  return current.pglite.transaction(async (tx) => {
    await tx.exec("set local role crm_app");
    await tx.query("select set_config('app.user_id', $1, true)", [userId]);
    const who = await tx.query<{ current_user: string }>("select current_user");
    if (who.rows[0]?.current_user !== "crm_app") throw new Error("CRM:role_not_applied");
    return fn(async (text, params = []) => (await tx.query<SqlRow>(text, params)).rows);
  });
}

export async function resetLocalDatabase() {
  const current = holder();
  if (current.pool) throw new Error("Refusing to reset a configured Postgres database.");
  if (current.pglite) await current.pglite.close();
  delete globalStore.__realynkCrm;
}
