import assert from "node:assert/strict";
import { test } from "node:test";
import { allow, resetThrottle } from "./throttle";

test("login work is capped for the whole app and old buckets expire", () => {
  resetThrottle();
  for (let attempt = 0; attempt < 20; attempt += 1) assert.equal(allow("login", 1_000), true);
  assert.equal(allow("login", 1_000), false);
  assert.equal(allow("sample", 1_000), true);
  assert.equal(allow("login", 61_001), true);
});
