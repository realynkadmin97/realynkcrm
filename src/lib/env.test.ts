import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { allowedHosts, hostIsAllowed } from "@/lib/env";

afterEach(() => {
  delete process.env.REALYNK_ALLOWED_HOSTS;
});

test("empty allowed hosts means any host is fine", () => {
  assert.equal(allowedHosts(), null);
  assert.equal(hostIsAllowed("anything.example"), true);
});

test("allowed hosts only accept listed company CRM hosts", () => {
  process.env.REALYNK_ALLOWED_HOSTS = "crm.realynk.com, 127.0.0.1, localhost";
  assert.deepEqual(allowedHosts(), ["crm.realynk.com", "127.0.0.1", "localhost"]);
  assert.equal(hostIsAllowed("crm.realynk.com"), true);
  assert.equal(hostIsAllowed("crm.realynk.com:443"), true);
  assert.equal(hostIsAllowed("preview.example.com"), false);
  assert.equal(hostIsAllowed(null), false);
});
