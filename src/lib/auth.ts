import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { dummyPasswordHash, hashToken, newToken, verifyPassword } from "@/lib/crypto";
import { configError, queryAuth, withUser, type SqlRow } from "@/lib/db";
import { isRole, type Role } from "@/lib/labels";

const COOKIE = "crm_session";
const MAX_AGE = 60 * 60 * 12;

export type SessionUser = {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  sampleMode: boolean;
  emailDomain: string | null;
};

export type WorkspaceStatus = {
  sampleMode: boolean;
  emailDomain: string | null;
  hasActiveAdmin: boolean;
  configError: string | null;
};

function mapUser(row: SqlRow): SessionUser {
  const role = String(row.role);
  if (!isRole(role)) throw new Error("CRM:invalid_role");
  return {
    id: String(row.user_id),
    email: String(row.email),
    fullName: String(row.full_name),
    role,
    sampleMode: Boolean(row.sample_mode),
    emailDomain: row.email_domain == null ? null : String(row.email_domain),
  };
}

export function safeNext(value: string | null | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\") || value.startsWith("/login")) {
    return "/";
  }
  return value;
}

export async function workspaceStatus(): Promise<WorkspaceStatus> {
  const rows = await queryAuth<SqlRow>("select sample_mode, email_domain, has_active_admin from private.workspace_status()");
  const row = rows[0];
  return {
    sampleMode: Boolean(row?.sample_mode),
    emailDomain: row?.email_domain == null ? null : String(row.email_domain),
    hasActiveAdmin: Boolean(row?.has_active_admin),
    configError: configError(),
  };
}

export async function sampleDirectory() {
  return queryAuth<{ id: string; full_name: string; email: string; role: string }>(
    "select id, full_name, email, role from private.sample_directory()",
  );
}

async function setSessionCookie(token: string) {
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

function expiresAt() {
  return new Date(Date.now() + MAX_AGE * 1000).toISOString();
}

export async function readSession() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const rows = await queryAuth("select * from private.session_profile($1)", [hashToken(token)]);
  return rows[0] ? mapUser(rows[0]) : null;
}

export async function clearSessionCookie() {
  (await cookies()).delete(COOKIE);
}

export async function openSampleSession(userId: string) {
  const token = newToken();
  await queryAuth("select private.open_sample_session($1, $2, $3)", [userId, hashToken(token), expiresAt()]);
  await setSessionCookie(token);
}

export async function openPasswordSession(email: string, password: string) {
  const rows = await queryAuth<{ user_id: string; password_hash: string }>(
    "select user_id, password_hash from private.credential_for_login($1)",
    [email],
  );
  const stored = rows[0]?.password_hash ?? (await dummyPasswordHash());
  const matches = await verifyPassword(password, stored);
  if (!rows[0] || !matches) return false;
  const token = newToken();
  await queryAuth("select private.open_session($1, $2, $3)", [rows[0].user_id, hashToken(token), expiresAt()]);
  await setSessionCookie(token);
  return true;
}

export async function destroySession() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (token) await queryAuth("select private.close_session($1)", [hashToken(token)]);
  await clearSessionCookie();
}

export async function requireUser() {
  const token = (await cookies()).get(COOKIE)?.value;
  const user = await readSession();
  if (!user) redirect(token ? "/session/end" : "/login");
  return user;
}

export async function permissionsFor(user: SessionUser) {
  const rows = await withUser(user.id, (query) =>
    query("select permission from role_permissions where role = $1 order by permission", [user.role]),
  );
  return rows.map((row) => String(row.permission));
}

export function can(permissions: string[], permission: string) {
  return permissions.includes(permission) || permissions.includes("crm.full");
}
