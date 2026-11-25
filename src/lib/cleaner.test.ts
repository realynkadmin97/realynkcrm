import assert from "node:assert/strict";
import { test } from "node:test";
import {
  applyMapping,
  normalizeColumn,
  normalizeCompany,
  normalizeTitle,
  parseCsv,
  removeHeader,
  renameHeader,
  suggestColumn,
} from "./cleaner";

test("csv mapping keeps canonical columns and skips blanks", () => {
  const table = parseCsv('Company,Job Title,Email\n"Northwind, LLC",vp ops,ada@northwind.example\n');
  assert.deepEqual(table[0], ["Company", "Job Title", "Email"]);
  const choices = table[0].map((header) => suggestColumn(header));
  assert.deepEqual(choices, ["Company", "Title", "Email"]);
  const sheet = applyMapping(table[0], table.slice(1), choices);
  assert.deepEqual(sheet.headers, ["Company", "Title", "Email"]);
  assert.equal(sheet.rows[0]?.Company, "Northwind, LLC");
  assert.equal(normalizeCompany(sheet.rows[0]?.Company ?? ""), "Northwind");
  assert.equal(normalizeTitle("dir. of recruiting"), "Director of recruiting");
});

test("editing a column keeps its name and removal stays removed", () => {
  const headers = ["Company", "Title"];
  const rows = [{ __id: "row-1", Company: "Northwind", Title: "VP" }];
  const renamed = renameHeader(headers, rows, "Title", "Title");
  assert.deepEqual(renamed.headers, ["Company", "Title"]);
  assert.equal(renamed.rows[0]?.Title, "VP");
  assert.throws(() => renameHeader(headers, rows, "Title", "Company"), /CRM:duplicate_column/);
  const removed = removeHeader(headers, rows, "Title");
  assert.deepEqual(removed.headers, ["Company"]);
  assert.equal(removed.rows[0]?.Title, undefined);
  const normalized = normalizeColumn(rows, "Title", ["row-1"]);
  assert.equal(normalized[0]?.Title, "Vice President");
});
