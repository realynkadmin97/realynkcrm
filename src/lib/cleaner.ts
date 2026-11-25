export const ROW_ID = "__id";
export const MAX_ROWS = 500;
export const MAX_COLUMNS = 40;
export const MAX_CELL = 4000;
export const MAX_CSV_CHARS = 1_500_000;

export const CANONICAL = [
  { label: "First Name", aliases: ["first name", "firstname", "first"] },
  { label: "Last Name", aliases: ["last name", "lastname", "last", "surname"] },
  { label: "Full Name", aliases: ["full name", "name", "contact", "contact name"] },
  { label: "Company", aliases: ["company", "company name", "organization", "organisation", "account"] },
  { label: "Title", aliases: ["title", "job title", "position", "role"] },
  { label: "Email", aliases: ["email", "email address", "work email", "e-mail"] },
  { label: "Industry", aliases: ["industry", "sector"] },
  { label: "LinkedIn URL", aliases: ["linkedin", "linkedin url", "person linkedin url", "linkedin profile", "profile url"] },
  { label: "Location", aliases: ["location", "city", "country", "region"] },
  { label: "Phone", aliases: ["phone", "phone number", "mobile", "direct phone"] },
] as const;

export type CleanerRow = Record<string, string>;

const CANONICAL_LABELS = new Set<string>(CANONICAL.map((field) => field.label));

export function parseCsv(text: string) {
  const source = text.replace(/^\uFEFF/, "");
  if (source.length > MAX_CSV_CHARS) throw new Error("CRM:sheet_too_large");
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    if (quoted) {
      if (char === '"') {
        if (source[index + 1] === '"') {
          cell += '"';
          index += 1;
        } else quoted = false;
      } else cell += char;
    } else if (char === '"') quoted = true;
    else if (char === ",") {
      row.push(cell);
      cell = "";
    } else if (char === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else if (char !== "\r") cell += char;
  }
  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((record) => record.some((value) => value.trim() !== ""));
}

export function suggestColumn(header: string) {
  const key = header.trim().toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ");
  const match = CANONICAL.find((field) => (field.aliases as readonly string[]).includes(key) || field.label.toLowerCase() === key);
  return match?.label ?? "extra";
}

function uniqueHeader(headers: string[], label: string) {
  if (!headers.includes(label)) return label;
  throw new Error("CRM:duplicate_column");
}

export function applyMapping(sourceHeaders: string[], records: string[][], choices: string[]) {
  if (sourceHeaders.length > MAX_COLUMNS) throw new Error("CRM:sheet_too_large");
  if (records.length > MAX_ROWS) throw new Error("CRM:sheet_too_large");
  const headers: string[] = [];
  const indexes: number[] = [];
  sourceHeaders.forEach((header, index) => {
    const choice = choices[index] ?? "skip";
    if (choice === "skip") return;
    const label = choice === "extra" ? header.trim() || `Column ${index + 1}` : choice;
    if (!CANONICAL_LABELS.has(label) && choice !== "extra") throw new Error("CRM:invalid");
    headers.push(uniqueHeader(headers, label.slice(0, 80)));
    indexes.push(index);
  });
  const rows = records.map((record) => {
    const row: CleanerRow = { [ROW_ID]: crypto.randomUUID() };
    indexes.forEach((sourceIndex, targetIndex) => {
      row[headers[targetIndex]] = (record[sourceIndex] ?? "").replace(/\s+/g, " ").trim().slice(0, MAX_CELL);
    });
    return row;
  });
  return { headers, rows };
}

function looseTitle(value: string) {
  if (value !== value.toLowerCase() && value !== value.toUpperCase()) return value;
  return value
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

const LEGAL_SUFFIX = /(?:,|\s)+(incorporated|corporation|limited|company|inc|llc|ltd|corp|gmbh|plc)\.?$/i;

export function normalizeCompany(value: string) {
  let text = value.replace(/\s+/g, " ").trim().replace(/[,\s]+$/, "");
  const next = text.replace(LEGAL_SUFFIX, "").replace(/[,\s]+$/, "").trim();
  text = next || text;
  return looseTitle(text);
}

export function normalizeTitle(value: string) {
  const text = value
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\bsvp\b\.?/gi, "Senior Vice President")
    .replace(/\bvp\b\.?/gi, "Vice President")
    .replace(/\bdir\b\.?/gi, "Director")
    .replace(/\bmgr\b\.?/gi, "Manager");
  return looseTitle(text);
}

export function normalizeColumn(rows: CleanerRow[], header: "Company" | "Title", onlyIds?: string[]) {
  const selected = new Set(onlyIds ?? []);
  const format = header === "Company" ? normalizeCompany : normalizeTitle;
  return rows.map((row) => {
    if (selected.size > 0 && !selected.has(row[ROW_ID] ?? "")) return row;
    if (!(header in row)) return row;
    return { ...row, [header]: format(row[header] ?? "") };
  });
}

export function renameHeader(headers: string[], rows: CleanerRow[], from: string, to: string) {
  const next = to.trim().slice(0, 80);
  if (!next || next === ROW_ID) throw new Error("CRM:invalid");
  if (next !== from && headers.includes(next)) throw new Error("CRM:duplicate_column");
  return {
    headers: headers.map((header) => (header === from ? next : header)),
    rows: rows.map((row) => {
      if (!(from in row)) return row;
      const copy = { ...row, [next]: row[from] ?? "" };
      if (next !== from) delete copy[from];
      return copy;
    }),
  };
}

export function removeHeader(headers: string[], rows: CleanerRow[], header: string) {
  return {
    headers: headers.filter((item) => item !== header),
    rows: rows.map((row) => {
      const copy = { ...row };
      delete copy[header];
      return copy;
    }),
  };
}

export function toCsv(headers: string[], rows: CleanerRow[]) {
  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
  const lines = [headers.map(escape).join(",")];
  for (const row of rows) lines.push(headers.map((header) => escape(row[header] ?? "")).join(","));
  return lines.join("\n");
}

export function sanitizeSheet(headers: unknown, rows: unknown) {
  if (!Array.isArray(headers) || !Array.isArray(rows)) throw new Error("CRM:invalid");
  if (headers.length > MAX_COLUMNS || rows.length > MAX_ROWS) throw new Error("CRM:sheet_too_large");
  const cleanHeaders: string[] = [];
  for (const header of headers) {
    if (typeof header !== "string") throw new Error("CRM:invalid");
    const label = header.trim().slice(0, 80);
    if (!label || label === ROW_ID || cleanHeaders.includes(label)) throw new Error("CRM:invalid");
    cleanHeaders.push(label);
  }
  const cleanRows = rows.map((row) => {
    if (!row || typeof row !== "object" || Array.isArray(row)) throw new Error("CRM:invalid");
    const source = row as Record<string, unknown>;
    const id = typeof source[ROW_ID] === "string" && source[ROW_ID].length >= 8 ? source[ROW_ID].slice(0, 80) : crypto.randomUUID();
    const clean: CleanerRow = { [ROW_ID]: id };
    for (const header of cleanHeaders) {
      const value = source[header];
      clean[header] = typeof value === "string" ? value.slice(0, MAX_CELL) : value == null ? "" : String(value).slice(0, MAX_CELL);
    }
    return clean;
  });
  return { headers: cleanHeaders, rows: cleanRows };
}
