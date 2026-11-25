import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { hashPassword, hashToken, newToken } from "./crypto";
import { queryAuth, resetLocalDatabase, withUser } from "./db";

type UserRow = { id: string; email: string; role: string };

async function usersByEmail() {
  const rows = await queryAuth<UserRow>("select id, email, role from users order by email");
  return new Map(rows.map((row) => [row.email, row]));
}

before(async () => {
  delete process.env.REALYNK_EMAIL_DOMAIN;
  delete process.env.REALYNK_BOOTSTRAP_ADMIN_EMAIL;
  delete process.env.REALYNK_BOOTSTRAP_ADMIN_NAME;
  delete process.env.REALYNK_BOOTSTRAP_ADMIN_PASSWORD;
  delete process.env.DATABASE_URL;
  await resetLocalDatabase();
});

after(async () => {
  await resetLocalDatabase();
});

test("sample sales only sees assigned leads and cannot reassign them", async () => {
  const directory = await usersByEmail();
  const priya = directory.get("priya.shah@sample.invalid");
  const luis = directory.get("luis.ortega@sample.invalid");
  const morgan = directory.get("morgan.ellis@sample.invalid");
  const avery = directory.get("avery.chen@sample.invalid");
  assert.ok(priya && luis && morgan && avery);

  await assert.rejects(
    () =>
      queryAuth("select private.open_sample_session($1, $2, now() + interval '1 hour')", [
        avery.id,
        hashToken(newToken()),
      ]),
    /CRM:not_allowed/,
  );

  const priyaLeads = await withUser(priya.id, (query) => query("select company from leads order by company"));
  assert.deepEqual(
    priyaLeads.map((row) => row.company),
    ["Lumen Dental Group", "Northwind Clinics"],
  );

  const morganLeads = await withUser(morgan.id, (query) => query("select company from leads order by company"));
  assert.equal(morganLeads.length, 4);

  await assert.rejects(
    () =>
      withUser(priya.id, (query) =>
        query("update leads set owner_id = $1 where company = 'Northwind Clinics' returning id", [luis.id]),
      ),
    /row-level security/i,
  );

  const stage = await withUser(priya.id, (query) =>
    query("update leads set stage = 'proposal' where company = 'Northwind Clinics' returning stage"),
  );
  assert.equal(stage[0]?.stage, "proposal");

  await assert.rejects(
    () => withUser(priya.id, (query) => query("select password_hash from user_credentials")),
    /permission denied/i,
  );

  for (let attempt = 0; attempt < 5; attempt += 1) {
    await queryAuth("select private.open_sample_session($1, $2, now() + interval '1 hour')", [
      priya.id,
      hashToken(newToken()),
    ]);
  }
  const openSessions = await queryAuth<{ count: number }>("select count(*)::int as count from sessions where user_id = $1", [
    priya.id,
  ]);
  assert.ok(Number(openSessions[0]?.count) <= 3);

  await queryAuth(
    "insert into sessions (token_hash, user_id, expires_at, created_at) values ($1, $2, now() - interval '1 minute', now() - interval '2 days')",
    [hashToken(newToken()), priya.id],
  );
  await queryAuth("select private.open_sample_session($1, $2, now() + interval '1 hour')", [priya.id, hashToken(newToken())]);
  const expired = await queryAuth<{ count: number }>(
    "select count(*)::int as count from sessions where user_id = $1 and expires_at <= now()",
    [priya.id],
  );
  assert.equal(Number(expired[0]?.count), 0);
});

test("a manager sees sales reps, assigns an open lead, and cannot change settings", async () => {
  const directory = await usersByEmail();
  const morgan = directory.get("morgan.ellis@sample.invalid");
  const luis = directory.get("luis.ortega@sample.invalid");
  const avery = directory.get("avery.chen@sample.invalid");
  assert.ok(morgan && luis && avery);

  const visible = await withUser(morgan.id, (query) => query("select email from users order by email"));
  assert.deepEqual(
    visible.map((row) => row.email),
    ["luis.ortega@sample.invalid", "morgan.ellis@sample.invalid", "priya.shah@sample.invalid"],
  );

  const assigned = await withUser(morgan.id, (query) =>
    query("update leads set owner_id = $1 where company = 'Fieldstone Schools' returning owner_id", [luis.id]),
  );
  assert.equal(assigned[0]?.owner_id, luis.id);

  const settings = await withUser(morgan.id, (query) =>
    query("update crm_settings set stale_after_days = 3 where id = 1 returning stale_after_days"),
  );
  assert.equal(settings.length, 0);

  const adminSettings = await withUser(avery.id, (query) =>
    query("update crm_settings set stale_after_days = 9 where id = 1 returning stale_after_days"),
  );
  assert.equal(Number(adminSettings[0]?.stale_after_days), 9);
});

test("a signed-in teammate can read a shared cleaner list and cannot hide it from the workspace", async () => {
  const directory = await usersByEmail();
  const priya = directory.get("priya.shah@sample.invalid");
  const morgan = directory.get("morgan.ellis@sample.invalid");
  assert.ok(priya && morgan);

  const shared = await withUser(priya.id, (query) => query("select name from cleaner_lists"));
  assert.deepEqual(
    shared.map((row) => row.name),
    ["Outbound clinics"],
  );

  const saved = await withUser(priya.id, (query) =>
    query(
      `update cleaner_lists set rows = $2::jsonb where name = $1 returning name`,
      ["Outbound clinics", JSON.stringify([{ __id: "row-1", Company: "Northwind" }])],
    ),
  );
  assert.equal(saved[0]?.name, "Outbound clinics");

  await assert.rejects(
    () =>
      withUser(morgan.id, (query) =>
        query(
          `insert into cleaner_lists (name, headers, rows, created_by, is_sample)
           values ('Hidden', '[]'::jsonb, '[]'::jsonb, $1, false) returning id`,
          [morgan.id],
        ),
      ),
    /row-level security/i,
  );
});

test("company domain comes from configuration and blocks other emails", async () => {
  const directory = await usersByEmail();
  const priya = directory.get("priya.shah@sample.invalid");
  assert.ok(priya);

  await queryAuth("select private.apply_runtime_config($1)", ["example.test"]);
  const status = await queryAuth<{ sample_mode: boolean; email_domain: string }>(
    "select sample_mode, email_domain from private.workspace_status()",
  );
  assert.equal(status[0]?.sample_mode, false);
  assert.equal(status[0]?.email_domain, "example.test");

  const sampleLeads = await withUser(priya.id, (query) => query("select id from leads"));
  assert.equal(sampleLeads.length, 0);
  const sampleLists = await withUser(priya.id, (query) => query("select id from cleaner_lists"));
  assert.equal(sampleLists.length, 0);

  await assert.rejects(
    () =>
      queryAuth("select private.open_sample_session($1, $2, now() + interval '1 hour')", [
        priya.id,
        hashToken(newToken()),
      ]),
    /CRM:sample_mode/,
  );

  const passwordHash = await hashPassword("correct-horse");
  await assert.rejects(
    () =>
      queryAuth("select private.ensure_bootstrap_admin($1, $2, $3)", [
        "ada@other.test",
        "Other Admin",
        passwordHash,
      ]),
    /CRM:bootstrap_domain/,
  );
  await queryAuth("select private.ensure_bootstrap_admin($1, $2, $3)", [
    "ada@example.test",
    "Ada Admin",
    passwordHash,
  ]);
  const admin = await queryAuth<UserRow>("select id, email, role from users where email = 'ada@example.test'");
  assert.equal(admin[0]?.role, "admin");

  await assert.rejects(
    () =>
      queryAuth("select private.create_invite($1, $2, $3, $4, $5, now() + interval '1 day')", [
        admin[0]?.id,
        "rep@other.test",
        "Other Rep",
        "sales",
        hashToken(newToken()),
      ]),
    /CRM:domain_rejected/,
  );

  const token = newToken();
  await queryAuth("select private.create_invite($1, $2, $3, $4, $5, now() + interval '1 day')", [
    admin[0]?.id,
    "rep@example.test",
    "Rae Rep",
    "sales",
    hashToken(token),
  ]);
  const preview = await queryAuth("select email from private.verification_preview($1)", [hashToken(token)]);
  assert.equal(preview[0]?.email, "rep@example.test");

  const premature = await queryAuth("select user_id from private.credential_for_login($1)", ["rep@example.test"]);
  assert.equal(premature.length, 0);

  await queryAuth("select private.accept_invite($1, $2)", [hashToken(token), await hashPassword("rep-password-1")]);
  const ready = await queryAuth("select user_id from private.credential_for_login($1)", ["rep@example.test"]);
  assert.equal(ready.length, 1);

  const outsider = await queryAuth("select user_id from private.credential_for_login($1)", ["person@gmail.com"]);
  assert.equal(outsider.length, 0);

  await assert.rejects(
    () =>
      withUser(String(admin[0]?.id), (query) =>
        query(
          "insert into leads (full_name, company, email, owner_id, is_sample) values ('Guest', 'Guest Co', 'guest@guest.example', null, true)",
        ),
      ),
    /row-level security/i,
  );

  const inserted = await withUser(String(admin[0]?.id), (query) =>
    query(
      "insert into leads (full_name, company, email, owner_id, is_sample) values ('Guest', 'Guest Co', 'guest@guest.example', null, false) returning company",
    ),
  );
  assert.equal(inserted[0]?.company, "Guest Co");

  const salesView = await withUser(String(ready[0]?.user_id), (query) => query("select company from leads"));
  assert.deepEqual(salesView, []);
});
