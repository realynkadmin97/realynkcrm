"use server";

import { can, permissionsFor, requireUser } from "@/lib/auth";
import { deleteCleanerList, insertCleanerList, promoteCleanerRows, updateCleanerList } from "@/lib/cleaner-store";
import { crmError } from "@/lib/errors";
import { allow } from "@/lib/throttle";

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function busy() {
  return { error: "The cleaner is busy. Wait a minute and try again." };
}

export async function createCleanerList(name: string) {
  const user = await requireUser();
  if (!allow("sheet")) return busy();
  try {
    const list = await insertCleanerList(user.id, name, user.sampleMode);
    return { list };
  } catch (error) {
    return { error: crmError(error, "That list could not be created.") };
  }
}

export async function saveCleanerList(input: { id: string; name: string; headers: string[]; rows: Record<string, string>[] }) {
  const user = await requireUser();
  if (!isUuid(input.id) || !allow("sheet")) return busy();
  try {
    await updateCleanerList(user.id, input.id, input.name, input.headers, input.rows);
    return { ok: true as const };
  } catch (error) {
    return { error: crmError(error, "That sheet could not be saved.") };
  }
}

export async function removeCleanerList(id: string) {
  const user = await requireUser();
  if (!isUuid(id) || !allow("sheet")) return busy();
  try {
    await deleteCleanerList(user.id, id);
    return { ok: true as const };
  } catch (error) {
    return { error: crmError(error, "That list could not be removed.") };
  }
}

export async function addCleanedLeads(rows: { fullName: string; company: string; email: string }[]) {
  const user = await requireUser();
  const permissions = await permissionsFor(user);
  if (!can(permissions, "leads.create")) return { error: "You do not have permission to add leads." };
  if (!allow("sheet")) return busy();
  const clean = rows
    .map((row) => ({
      fullName: row.fullName.trim().slice(0, 120),
      company: row.company.trim().slice(0, 160),
      email: row.email.trim().toLowerCase().slice(0, 200),
    }))
    .filter((row) => row.fullName.length >= 2 && row.company.length >= 2 && row.email.includes("@"))
    .slice(0, 500);
  if (!clean.length) return { error: "Each row needs a name, a company, and an email before it can enter the pipeline." };
  try {
    const added = await promoteCleanerRows(user.id, user.sampleMode, clean);
    return { added, skipped: clean.length - added };
  } catch (error) {
    return { error: crmError(error, "Those rows could not be added to the pipeline.") };
  }
}
