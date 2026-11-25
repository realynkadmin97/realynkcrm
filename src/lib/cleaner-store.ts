import { withUser } from "@/lib/db";
import { sanitizeSheet, type CleanerRow } from "@/lib/cleaner";
import { emptyMeta, readMeta, type CleanerMeta } from "@/lib/sheet-meta";

export type { CleanerMeta };
export { emptyMeta, readMeta };

export type CleanerList = {
  id: string;
  name: string;
  headers: string[];
  rows: CleanerRow[];
  meta: CleanerMeta;
  updatedAt: string;
};

function text(value: unknown) {
  return value == null ? "" : String(value);
}

function readSheet(headers: unknown, rows: unknown) {
  try {
    return sanitizeSheet(headers, rows);
  } catch {
    return { headers: [] as string[], rows: [] as CleanerRow[] };
  }
}

export async function listCleanerLists(userId: string) {
  return withUser(userId, async (query) => {
    const found = await query(
      "select id, name, headers, rows, meta, updated_at from cleaner_lists order by updated_at desc",
    );
    return found.map((row) => {
      const sheet = readSheet(row.headers, row.rows);
      return {
        id: text(row.id),
        name: text(row.name),
        headers: sheet.headers,
        rows: sheet.rows,
        meta: readMeta(row.meta, sheet.headers),
        updatedAt: text(row.updated_at),
      } satisfies CleanerList;
    });
  });
}

export async function insertCleanerList(userId: string, name: string, isSample: boolean) {
  const label = name.trim().slice(0, 80);
  if (label.length < 1) throw new Error("CRM:invalid");
  return withUser(userId, async (query) => {
    const found = await query(
      `insert into cleaner_lists (name, headers, rows, created_by, is_sample)
       values ($1, '[]'::jsonb, '[]'::jsonb, $2, $3)
       returning id, name, headers, rows, meta, updated_at`,
      [label, userId, isSample],
    );
    const row = found[0];
    if (!row) throw new Error("CRM:forbidden");
    const sheet = readSheet(row.headers, row.rows);
    return {
      id: text(row.id),
      name: text(row.name),
      headers: sheet.headers,
      rows: sheet.rows,
      meta: readMeta(row.meta, sheet.headers),
      updatedAt: text(row.updated_at),
    } satisfies CleanerList;
  });
}

export async function updateCleanerList(
  userId: string,
  id: string,
  name: string,
  headers: string[],
  rows: CleanerRow[],
  meta: CleanerMeta = emptyMeta(),
) {
  const label = name.trim().slice(0, 80);
  const sheet = sanitizeSheet(headers, rows);
  const saved = readMeta(meta, sheet.headers);
  if (label.length < 1) throw new Error("CRM:invalid");
  return withUser(userId, async (query) => {
    const found = await query(
      `update cleaner_lists
       set name = $2, headers = $3::jsonb, rows = $4::jsonb, meta = $5::jsonb
       where id = $1
       returning id`,
      [id, label, JSON.stringify(sheet.headers), JSON.stringify(sheet.rows), JSON.stringify(saved)],
    );
    if (!found.length) throw new Error("CRM:forbidden");
  });
}

export async function deleteCleanerList(userId: string, id: string) {
  return withUser(userId, async (query) => {
    const found = await query("delete from cleaner_lists where id = $1 returning id", [id]);
    if (!found.length) throw new Error("CRM:forbidden");
  });
}

export async function promoteCleanerRows(
  userId: string,
  isSample: boolean,
  rows: { fullName: string; company: string; email: string }[],
) {
  return withUser(userId, async (query) => {
    let added = 0;
    for (const row of rows) {
      const found = await query(
        `insert into leads (full_name, company, email, source, owner_id, is_sample)
         select $1, $2, $3, 'Cleaner', null, $4
         where not exists (
           select 1 from leads existing
           where lower(existing.email) = lower($3)
         )
         returning id`,
        [row.fullName, row.company, row.email, isSample],
      );
      if (found.length) added += 1;
    }
    return added;
  });
}
