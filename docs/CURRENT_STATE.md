# Current state

Updated 26 November 2026, 22:30 Asia/Shanghai.

## Working

- Invite-only sign-in, email verification, logout, and the signed-in name and email.
- Admin, Manager, and Sales, enforced in Postgres and in the pages.
- Sample workspace, clearly fictional. Sample admin has no one-click sign-in.
- Lead Enrichment sheet for every signed-in person: import, map, edit, filter, undo, export.
- Shared lists in the company database. They remain after the tab closes.
- Normalize Company and Normalize Titles, including from the column menu.
- Three-dot column menu: run, prompt, insert, filter, rename, freeze, remove.
- Add to pipeline for Manager and Admin.
- Supabase project Realynk CRM is signed in and healthy.
- Brand bible in `brand/`: identity manual, Realynk Assistants logo, and the written rules in `brand/BRAND.md`.

## Open

- A column run still lives in the browser. Closing the computer stops it. Supabase is connected and not yet used as the worker.
- Industry, email verification, ICP, and custom prompt runs do not call out. No server key is configured.
- Cursor private app is live at `https://realynk-crm.apps.grok.bot`. Company subdomain `crm.realynk.com` on Vercel is the next host step (see README).
- On a narrow phone, the Leads stage badge can clip inside the table.
- The Rea door is locked as the global CRM design: Lato, light canvas, Realynk navy/blue tokens in `globals.css`, quiet corner waves, Rea on `/login` and `/verify`, light sidebar chrome.

## Do not regress

- Hover and long-cell editing stay portaled, not clipped inside the sheet.
- Renaming a column keeps its name. Do not add a " 2".
- Deleted columns stay deleted. Do not re-add enrichment columns on load.
- The sample admin stays locked. Do not add a passwordless public admin.
- Do not hardcode a company email domain.
