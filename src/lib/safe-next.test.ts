import assert from "node:assert/strict";
import { test } from "node:test";
import { safeNext } from "./safe-next";

test("safeNext keeps same-origin paths and drops whitespace tricks", () => {
  assert.equal(safeNext("/leads"), "/leads");
  assert.equal(safeNext("/leads/271a3975-f61b-4504-b6b9-d36fdc59573b"), "/leads/271a3975-f61b-4504-b6b9-d36fdc59573b");
  assert.equal(safeNext("/\t/evil.example"), "/");
  assert.equal(safeNext("/ /evil.example"), "/");
  assert.equal(safeNext("/\n/evil.example"), "/");
  assert.equal(safeNext("//evil.example"), "/");
  assert.equal(safeNext("/\\evil.example"), "/");
  assert.equal(safeNext("/%09/evil.example"), "/");
  assert.equal(safeNext("/%2F%09%2Fevil.example"), "/");
  assert.equal(safeNext("https://evil.example"), "/");
  assert.equal(safeNext("/login"), "/");
});
