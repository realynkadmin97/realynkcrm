# Current state

Updated 27 November 2026, 02:11 Asia/Shanghai.

## Working

- Company CRM live at `https://crm.realynk.com` (Vercel project under Realynk Assistants; GitHub `realynkadmin97/realynkcrm`; GHL DNS CNAME `crm`).
- Invite-only sign-in on `/login`, email verification, logout, signed-in name and email.
- Harbor desk after login: soft canvas, department side rail (Go-to-Market live; Finance / Operations / HR placeholders), module nav.
- Admin, Manager, and Sales. Hosted Postgres runs desk queries as the connection owner; pages still gate actions with `can()`. Local PGlite still exercises `crm_app` RLS in tests.
- Sample workspace when no company email domain is set. Sample admin has no one-click sign-in.
- Lead Enrichment sheet for every signed-in person: import, map, edit, filter, undo, export.
- Shared cleaner lists in the company database. They remain after the tab closes.
- Normalize Company and Normalize Titles, including from the column menu.
- Three-dot column menu: run, prompt, insert, filter, rename, freeze, remove.
- Add to pipeline for Manager and Admin.
- Supabase Postgres via Session pooler `DATABASE_URL`. Migrations apply at runtime.
- Brand bible in `brand/`: identity manual, logos, rules in `brand/BRAND.md`.
- Desk health while signed in: `https://crm.realynk.com/api/desk-check` (safe codes only).

## Open

- One browser may still show a cached React #441 page; clear site data for `crm.realynk.com` or use the browser where Harbor already opens.
- Finance / Operations / HR are placeholders under `/command/[department]`.
- A column run still lives in the browser. Closing the computer stops it. Supabase is connected and not yet used as the worker.
- Industry, email verification, ICP, and custom prompt runs do not call out. No server key is configured.
- On a narrow phone, the Leads stage badge can clip inside the table.

## Do not regress

- Hover and long-cell editing stay portaled, not clipped inside the sheet.
- Renaming a column keeps its name. Do not add a " 2".
- Deleted columns stay deleted. Do not re-add enrichment columns on load.
- The sample admin stays locked. Do not add a passwordless public admin.
- Do not hardcode a company email domain.
- Do not call `SET ROLE crm_app` on the hosted pool path. A failed role switch aborts the transaction and takes down Harbor (React #441).
- Keep `REALYNK_ALLOWED_HOSTS` pointed at the company CRM host in production.
