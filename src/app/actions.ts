"use server";

import { redirect, unstable_rethrow } from "next/navigation";
import { can, destroySession, openPasswordSession, openSampleSession, permissionsFor, requireUser, safeNext } from "@/lib/auth";
import { hashPassword, hashToken, newToken } from "@/lib/crypto";
import { queryAuth, withUser } from "@/lib/db";
import { crmError } from "@/lib/errors";
import { isRole, isStage } from "@/lib/labels";
import { allow } from "@/lib/throttle";

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function signInSample(formData: FormData) {
  const userId = String(formData.get("userId") ?? "");
  if (!isUuid(userId) || !allow("sample")) redirect("/login?error=sample");
  try {
    await openSampleSession(userId);
  } catch {
    redirect("/login?error=sample");
  }
  redirect("/");
}

export async function signIn(_previous: { error: string } | null, formData: FormData): Promise<{ error: string }> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = safeNext(String(formData.get("next") ?? ""));
  if (!email || email.length > 254 || !email.includes("@") || password.length < 1 || password.length > 128) {
    return { error: "That email and password could not be signed in. Use a verified company account." };
  }
  if (!allow("login")) return { error: "Sign-in is busy. Wait a minute and try again." };
  const ok = await openPasswordSession(email, password).catch(() => false);
  if (!ok) return { error: "That email and password could not be signed in. Use a verified company account." };
  redirect(next);
}

export async function logout() {
  await destroySession();
  redirect("/login");
}

async function guard(permission: string) {
  const user = await requireUser();
  const permissions = await permissionsFor(user);
  if (!can(permissions, permission)) redirect("/?error=forbidden");
  return user;
}

export async function updateLead(formData: FormData) {
  const user = await guard("leads.manage_assigned");
  const id = String(formData.get("id") ?? "");
  const stage = String(formData.get("stage") ?? "");
  const notes = String(formData.get("notes") ?? "").slice(0, 2000);
  if (!isUuid(id) || !isStage(stage)) redirect("/leads?error=invalid");
  try {
    const rows = await withUser(user.id, (query) =>
      query("update leads set stage = $2, notes = $3, updated_at = now() where id = $1 returning id", [id, stage, notes]),
    );
    if (!rows.length) redirect(`/leads/${id}?error=forbidden`);
  } catch (error) {
    unstable_rethrow(error);
    redirect(`/leads/${id}?error=forbidden`);
  }
  redirect(`/leads/${id}?notice=saved`);
}

export async function assignLead(formData: FormData) {
  const user = await guard("leads.assign");
  const id = String(formData.get("id") ?? "");
  const owner = String(formData.get("ownerId") ?? "");
  const ownerId = owner === "" ? null : owner;
  if (!isUuid(id) || (ownerId !== null && !isUuid(ownerId))) redirect("/team?error=invalid");
  try {
    const rows = await withUser(user.id, (query) =>
      query("update leads set owner_id = $2, updated_at = now() where id = $1 returning id", [id, ownerId]),
    );
    if (!rows.length) redirect("/team?error=forbidden");
  } catch (error) {
    unstable_rethrow(error);
    redirect("/team?error=forbidden");
  }
  redirect("/team?notice=assigned");
}

export async function createLead(formData: FormData) {
  const user = await guard("leads.create");
  const fullName = String(formData.get("fullName") ?? "").trim();
  const company = String(formData.get("company") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const source = String(formData.get("source") ?? "Inbound").trim().slice(0, 80) || "Inbound";
  const owner = String(formData.get("ownerId") ?? "");
  const ownerId = owner === "" ? null : owner;
  if (fullName.length < 2 || company.length < 2 || !email.includes("@") || (ownerId !== null && !isUuid(ownerId))) {
    redirect("/leads?error=invalid");
  }
  try {
    const rows = await withUser(user.id, (query) =>
      query(
        `insert into leads (full_name, company, email, source, owner_id, is_sample)
         values ($1, $2, $3, $4, $5, $6) returning id`,
        [fullName, company, email, source, ownerId, user.sampleMode],
      ),
    );
    const id = rows[0]?.id;
    if (!id) redirect("/leads?error=forbidden");
    redirect(`/leads/${id}?notice=created`);
  } catch (error) {
    unstable_rethrow(error);
    redirect("/leads?error=forbidden");
  }
}

export async function updateOpportunityStage(formData: FormData) {
  const user = await requireUser();
  const permissions = await permissionsFor(user);
  if (!can(permissions, "pipeline.update_assigned") && !can(permissions, "opportunities.manage_all")) {
    redirect("/opportunities?error=forbidden");
  }
  const id = String(formData.get("id") ?? "");
  const stage = String(formData.get("stage") ?? "");
  if (!isUuid(id) || !isStage(stage)) redirect("/opportunities?error=invalid");
  try {
    const rows = await withUser(user.id, (query) =>
      query("update opportunities set stage = $2, updated_at = now() where id = $1 returning id", [id, stage]),
    );
    if (!rows.length) redirect("/opportunities?error=forbidden");
  } catch (error) {
    unstable_rethrow(error);
    redirect("/opportunities?error=forbidden");
  }
  redirect("/opportunities?notice=saved");
}

export async function createOpportunity(formData: FormData) {
  const user = await guard("opportunities.create");
  const leadId = String(formData.get("leadId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const amount = Number(formData.get("amount") ?? 0);
  if (!isUuid(leadId) || title.length < 2 || !Number.isFinite(amount) || amount < 0 || amount > 100000000) {
    redirect(`/leads/${leadId}?error=invalid`);
  }
  try {
    const rows = await withUser(user.id, (query) =>
      query(
        `insert into opportunities (lead_id, title, amount, stage, owner_id, is_sample)
         values ($1, $2, $3, 'qualified', $4, $5) returning id`,
        [leadId, title, amount, user.id, user.sampleMode],
      ),
    );
    if (!rows.length) redirect(`/leads/${leadId}?error=forbidden`);
  } catch (error) {
    unstable_rethrow(error);
    redirect(`/leads/${leadId}?error=forbidden`);
  }
  redirect(`/leads/${leadId}?notice=opportunity`);
}

export async function createActivity(formData: FormData) {
  const user = await guard("activities.create");
  const leadId = String(formData.get("leadId") ?? "");
  const kind = String(formData.get("kind") ?? "task");
  const summary = String(formData.get("summary") ?? "").trim();
  const dueOn = String(formData.get("dueOn") ?? "");
  if (!isUuid(leadId) || !["task", "call", "note", "meeting"].includes(kind) || summary.length < 2) {
    redirect(`/leads/${leadId}?error=invalid`);
  }
  const due = /^\d{4}-\d{2}-\d{2}$/.test(dueOn) ? dueOn : null;
  try {
    const rows = await withUser(user.id, (query) =>
      query(
        `insert into activities (lead_id, owner_id, kind, summary, due_on, is_sample)
         values ($1, $2, $3, $4, $5, $6) returning id`,
        [leadId, user.id, kind, summary.slice(0, 280), due, user.sampleMode],
      ),
    );
    if (!rows.length) redirect(`/leads/${leadId}?error=forbidden`);
  } catch (error) {
    unstable_rethrow(error);
    redirect(`/leads/${leadId}?error=forbidden`);
  }
  redirect(`/leads/${leadId}?notice=activity`);
}

export async function completeActivity(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!isUuid(id)) redirect("/activities?error=invalid");
  try {
    const rows = await withUser(user.id, (query) =>
      query("update activities set completed_at = now() where id = $1 and completed_at is null returning id", [id]),
    );
    if (!rows.length) redirect("/activities?error=forbidden");
  } catch (error) {
    unstable_rethrow(error);
    redirect("/activities?error=forbidden");
  }
  redirect("/activities?notice=completed");
}

export async function inviteUser(
  _previous: { error?: string; link?: string } | null,
  formData: FormData,
): Promise<{ error?: string; link?: string }> {
  const user = await requireUser();
  const permissions = await permissionsFor(user);
  if (!can(permissions, "users.manage")) return { error: "You do not have permission to invite people." };
  if (!allow("invite")) return { error: "Too many invites. Wait a few minutes." };
  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const role = String(formData.get("role") ?? "");
  if (!isRole(role)) return { error: "Choose Admin, Sales, or Manager." };
  const token = newToken();
  const expires = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
  try {
    await queryAuth("select private.create_invite($1, $2, $3, $4, $5, $6)", [
      user.id,
      email,
      fullName,
      role,
      hashToken(token),
      expires,
    ]);
  } catch (error) {
    return { error: crmError(error) };
  }
  return { link: `/verify?token=${encodeURIComponent(token)}` };
}

export async function updateMember(formData: FormData) {
  const user = await guard("users.manage");
  const id = String(formData.get("id") ?? "");
  const role = String(formData.get("role") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!isUuid(id) || !isRole(role) || !["active", "disabled", "invited"].includes(status)) {
    redirect("/people?error=invalid");
  }
  try {
    const rows = await withUser(user.id, (query) =>
      query("update users set role = $2, status = $3 where id = $1 returning id", [id, role, status]),
    );
    if (!rows.length) redirect("/people?error=forbidden");
  } catch (error) {
    unstable_rethrow(error);
    const message = error instanceof Error ? error.message : "";
    redirect(`/people?error=${/CRM:last_admin/.test(message) ? "last_admin" : "forbidden"}`);
  }
  redirect("/people?notice=saved");
}

export async function updateSettings(formData: FormData) {
  const user = await guard("settings.manage");
  const days = Number(formData.get("staleAfterDays"));
  if (!Number.isInteger(days) || days < 1 || days > 90) redirect("/settings?error=invalid");
  try {
    const rows = await withUser(user.id, (query) =>
      query("update crm_settings set stale_after_days = $1 where id = 1 returning stale_after_days", [days]),
    );
    if (!rows.length) redirect("/settings?error=forbidden");
  } catch (error) {
    unstable_rethrow(error);
    redirect("/settings?error=forbidden");
  }
  redirect("/settings?notice=saved");
}

export async function acceptInvite(
  _previous: { error?: string; done?: boolean } | null,
  formData: FormData,
): Promise<{ error?: string; done?: boolean }> {
  if (!allow("verify")) {
    return { error: "Too many attempts. Wait a few minutes and open the link again." };
  }
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  if (token.length < 20 || password.length < 10) return { error: "Use at least 10 characters." };
  try {
    const passwordHash = await hashPassword(password);
    await queryAuth("select private.accept_invite($1, $2)", [hashToken(token), passwordHash]);
  } catch (error) {
    return { error: crmError(error, "This verification link is invalid or has expired.") };
  }
  return { done: true };
}
