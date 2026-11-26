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

function migrationDatabaseUrl() {
  return process.env.DATABASE_URL_UNPOOLED?.trim() || databaseUrl();
}

function poolSsl(url: string) {
  return url.includes("supabase") || url.includes("sslmode=require") || url.includes("sslmode=verify-full")
    ? { rejectUnauthorized: false }
    : undefined;
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
    await execRaw("select private.ensure_crm_app_grant()");
  } catch {
    // Older databases may not have this helper yet; migrations add it.
  }
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

async function migrationFiles() {
  const directory = path.join(process.cwd(), "migrations");
  return (await readdir(directory).catch(() => [])).filter((file) => file.endsWith(".sql")).sort();
}

async function applyPoolMigrations() {
  const files = await migrationFiles();
  if (files.length === 0) return;
  const url = migrationDatabaseUrl();
  if (!url) return;
  const client = new pg.Client({
    connectionString: url,
    ssl: poolSsl(url),
  });
  await client.connect();
  try {
    await client.query("create table if not exists schema_migrations (name text primary key, applied_at timestamptz not null default now())");
    const done = new Set(
      (await client.query<{ name: string }>("select name from schema_migrations")).rows.map((row) => row.name),
    );
    for (const file of files.filter((name) => !done.has(name))) {
      const sql = await readFile(path.join(process.cwd(), "migrations", file), "utf8");
      await client.query("begin");
      try {
        await client.query(sql);
        await client.query("insert into schema_migrations (name) values ($1)", [file]);
        await client.query("commit");
      } catch (error) {
        await client.query("rollback");
        throw error;
      }
    }
  } finally {
    await client.end();
  }
}

async function start() {
  const current = holder();
  const url = databaseUrl();
  if (url) {
    current.pool = new pg.Pool({
      connectionString: url,
      max: 5,
      ssl: poolSsl(url),
    });
    try {
      await applyPoolMigrations();
    } catch (error) {
      const detail = error instanceof Error ? error.message.replace(/\s+/g, " ").slice(0, 180) : "unknown";
      current.configError = `CRM:migrate:${detail}`;
      return;
    }
  } else if (process.env.VERCEL || process.env.NODE_ENV === "production") {
    current.configError = "CRM:missing_database_url";
    return;
  } else {
    const db = new PGlite();
    current.pglite = db;
    for (const file of await migrationFiles()) {
      await db.exec(await readFile(path.join(process.cwd(), "migrations", file), "utf8"));
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
      current.pool = undefined;
      current.configError = error instanceof Error ? error.message : "CRM:database_unavailable";
    });
  }
  await current.ready;
}

export function configError() {
  return holder().configError;
}

export async function queryAuth<T extends SqlRow = SqlRow>(text: string, params: unknown[] = []) {
  await ready();
  const current = holder();
  if (current.configError && !current.pool && !current.pglite) {
    throw new Error(current.configError);
  }
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
        await assumeCrmApp(client);
        await client.query("select set_config('app.user_id', $1, true)", [userId]);
        const result = await fn(async (text, params = []) => (await client.query(text, params)).rows as SqlRow[]);
        await client.query("commit");
        return result;
      } catch (error) {
        await client.query("rollback");
        const detail = error instanceof Error ? error.message.replace(/\s+/g, " ").slice(0, 160) : "query_failed";
        throw new Error(`CRM:desk:${detail}`);
      }
    } finally {
      client.release();
    }
  }
  if (!current.pglite) throw new Error("CRM:database_unavailable");
  return current.pglite.transaction(async (tx) => {
    try {
      await tx.exec("set local role crm_app");
    } catch {
      // Local PGlite still serves the desk as the connection owner when role switch fails.
    }
    await tx.query("select set_config('app.user_id', $1, true)", [userId]);
    return fn(async (text, params = []) => (await tx.query<SqlRow>(text, params)).rows);
  });
}

/** Run a statement inside a savepoint so a failure does not abort the outer transaction. */
async function tryInSavepoint(client: pg.PoolClient, label: string, sql: string, params: unknown[] = []) {
  await client.query(`savepoint ${label}`);
  try {
    const result = await client.query(sql, params);
    await client.query(`release savepoint ${label}`);
    return result;
  } catch (error) {
    await client.query(`rollback to savepoint ${label}`);
    throw error;
  }
}

async function assumeCrmApp(client: pg.PoolClient) {
  // Every fallible setup step uses a savepoint. A bare failed SET ROLE inside BEGIN
  // would abort the whole transaction and break every desk query afterward.
  try {
    await tryInSavepoint(client, "crm_grant_fn", "select private.ensure_crm_app_grant()");
  } catch {
    // Helper may be absent until migrations finish.
  }

  try {
    await tryInSavepoint(client, "crm_set_role", "set local role crm_app");
    const who = await client.query<{ current_user: string }>("select current_user");
    if (who.rows[0]?.current_user === "crm_app") return;
  } catch {
    // continue to grant retry
  }

  try {
    await tryInSavepoint(client, "crm_grant_user", "grant crm_app to current_user");
    await tryInSavepoint(client, "crm_set_role2", "set local role crm_app");
    const who = await client.query<{ current_user: string }>("select current_user");
    if (who.rows[0]?.current_user === "crm_app") return;
  } catch {
    // Hosted Postgres (e.g. Supabase) may not allow SET ROLE.
    // Continue as the connection owner so the desk can load for the bootstrap admin.
    // Table owners bypass RLS unless FORCE ROW LEVEL SECURITY is on.
  }
}

export async function resetLocalDatabase() {
  const current = holder();
  if (current.pool) throw new Error("Refusing to reset a configured Postgres database.");
  if (current.pglite) await current.pglite.close();
  delete globalStore.__realynkCrm;
}
