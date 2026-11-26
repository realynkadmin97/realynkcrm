# Architecture we are working

Updated 27 November 2026, 02:11 Asia/Shanghai.

Realynk CRM (“Rea’s Command Center”) is the company workspace. Joan and teammates sign in by invite, work leads and pipeline on the Harbor desk, and clean sheets in Lead Enrichment before outreach.

## Where it runs

| Piece | Choice |
| --- | --- |
| App | Next.js App Router (TypeScript), Tailwind, Harbor UI |
| Host | Vercel under Realynk Assistants |
| Source for builds | GitHub `realynkadmin97/realynkcrm` (also mirrored on Origin) |
| Public URL | `https://crm.realynk.com` |
| DNS | GoHighLevel: CNAME `crm` → `cname.vercel-dns.com` |
| Database | Supabase Postgres (Tokyo). App uses the **Session pooler** URI as `DATABASE_URL`. |
| Local | `npm run dev` on `127.0.0.1:4317`. Without `DATABASE_URL`, PGlite holds a local sample workspace. |

Host allowlist: `REALYNK_ALLOWED_HOSTS` (for example `crm.realynk.com`). Other Host headers get 404. Cursor private publish can remain a backup; the company URL is the product.

## Shape of the app

```
Browser
  → proxy (host allowlist + session cookie gate)
  → /login, /verify          Rea door (unauthenticated)
  → (crm)/*                  Harbor shell after login
       /                     Today
       /leads, /opportunities, /activities, /team, /people, /settings
       /clean                Lead Enrichment sheet
       /command/[department] Finance / Ops / HR placeholders
  → /api/desk-check          Signed-in health (no secrets)
  → Postgres                 sessions, users, CRM tables, cleaner_lists
```

Key folders:

- `src/app/(crm)/` — signed-in pages and layout that wraps Harbor `Shell`
- `src/app/login/` — Rea door
- `src/app/actions.ts` — server mutations (leads, invites, settings)
- `src/components/shell.tsx` + `shell-nav.tsx` — Harbor chrome and department rail
- `src/lib/auth.ts` — session cookie, `requireUser`, `can()`
- `src/lib/db.ts` — pool / PGlite, runtime migrations, `queryAuth` / `withUser`
- `src/lib/permissions.ts` — static Admin / Manager / Sales grants for the shell
- `src/lib/crm.ts` — leads, opportunities, activities, Today dashboard
- `src/lib/cleaner*.ts` — Lead Enrichment sheet logic
- `migrations/` — numbered SQL applied at runtime
- `brand/` — identity manual and brand rules

## Sign-in and roles

Invite-only. No public registration. Password login uses scrypt hashes in `user_credentials`. Session token is hashed into `sessions`; cookie name `crm_session`.

Roles: **Admin**, **Manager**, **Sales**.

- Admin — people, settings, full CRM
- Manager — all leads, assignment, performance
- Sales — assigned leads and opportunities

Until `REALYNK_EMAIL_DOMAIN` is set, the app stays in **sample mode** with fictional accounts. The sample admin cannot be opened with one click. Bootstrap admin env vars only apply when a real domain is configured and no admin exists yet.

Pages call `can(permissions, …)`. On hosted Postgres we do **not** `SET ROLE crm_app` inside `withUser` (that aborted transactions on Supabase and produced React #441). The connection owner (`postgres` on the pooler) bypasses RLS; authorization stays in app checks. Local PGlite still uses `crm_app` so access tests exercise RLS.

## Harbor desk

Locked visual system: soft light canvas, Realynk navy/blue tokens, Lato, rounded panels. Left rail lists departments:

- **Go-to-Market** — live CRM modules (Today, Leads, Cleaner, …)
- **Finance / Operations / HR** — placeholder routes under `/command/...`

Mockups that led here live at `/mockups` (Atlas, Harbor, Ledger). Harbor won.

## Lead Enrichment (cleaner)

Sheet UX matches https://lead-cleaner-opal.vercel.app. Lists sit in `cleaner_lists` (headers, rows, column meta). Company and Title can run built-in cleaning. Managers and admins can push ready rows into the pipeline. Export is CSV.

## Data and migrations

SQL files in `migrations/` run when the app starts against Postgres (not during the Vercel build). `schema_migrations` records applied files. Auth helpers live in schema `private` (`session_profile`, `open_session`, bootstrap, workspace status).

Diagnostic while signed in: `GET /api/desk-check` → `{ ok, role, sessionUser, leadCount, … }` with no secrets.

## What is next

1. **Background column runs** — write a job row, worker on Supabase continues in batches, sheet updates even if the laptop closes.
2. **Department desks** — replace Finance / Ops / HR placeholders with real modules when Joan prioritizes them.
3. **Enrichment keys** — Industry, email verification, ICP, and custom prompts stay off until a server-side key exists. Keys never go to the browser.

Built-in Company and Title cleaning can run with no outside key today.

## Parked

LinkedIn message generation is not a screen. Person LinkedIn URL mapping stays. The August workspace chooser stays gone.
