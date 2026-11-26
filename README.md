# Realynk CRM

Internal CRM for Realynk leads, opportunities, and sales activity. Sign-in is limited to approved company accounts. There is no public registration.

## Sign in

The company email domain is **not set in this project**. The app does not guess it.

Until `REALYNK_EMAIL_DOMAIN` is set, the CRM opens a labeled sample workspace. The sample people are fictional. Sales and manager sample accounts can be opened from the login page. The sample admin is listed and cannot be opened that way. Setting the domain turns sample mode off, disables those accounts, and requires a verified company email.

Copy `.env.example` to `.env.local` when you are ready to enforce the domain:

- `REALYNK_EMAIL_DOMAIN` — the part after `@` in a company address (not the CRM website host)
- `REALYNK_BOOTSTRAP_ADMIN_EMAIL` — first admin, on that domain
- `REALYNK_BOOTSTRAP_ADMIN_NAME`
- `REALYNK_BOOTSTRAP_ADMIN_PASSWORD` — at least 10 characters
- `REALYNK_ALLOWED_HOSTS` — optional CRM website hosts only, e.g. `crm.realynk.com,127.0.0.1,localhost`

The bootstrap admin is created already verified, because you set the password yourself. Every later person is invited by an admin, gets a one-time verification link, and chooses a password before they can sign in. The link is shown to the admin to send on; this app does not include an email provider.

### Keep the CRM off the open web

Sign-in is already invite-only. To keep the site itself off public browse lists:

1. Publish the app as **private** (or team), not public.
2. Point a company subdomain at it, such as `crm.realynk.com`.
3. Set `REALYNK_ALLOWED_HOSTS=crm.realynk.com` (plus `127.0.0.1,localhost` when developing). Other hosts, including a random preview URL, get 404.

Anyone who knows the subdomain can still open the sign-in page. They cannot enter the CRM without an approved company account. For a harder gate in front of even the login page, put Cloudflare Access or a VPN on that subdomain.

## Lead cleaner

Signed-in teammates share lead lists in the company database. Import a CSV, match the columns, edit the sheet, then normalize company names and titles. Export a CSV when the list is ready. Managers and admins can add rows that have a name, company, and email into the lead pipeline.

Industry lookup, email verification, and ICP scoring are not connected. The cleaner does not call outside services and does not keep provider keys in the browser.

## Roles

| Role | Access |
| --- | --- |
| Admin | Full CRM, users and permissions, every lead and opportunity, settings |
| Manager | Every lead and opportunity, activity and performance, lead assignment |
| Sales | Assigned leads and opportunities, pipeline updates, tasks and activities |

Authorization is enforced in Postgres with row level security. Pages and server actions check the signed-in role as well. A sales rep cannot read another rep's leads by calling the database as themselves.

The CRM uses its own Postgres database for sign-in and the sheet (in-memory during local development, and the published app's database when one is attached). Session checks do not trust the browser alone. A Supabase project named Realynk CRM is signed in for a later worker that can finish a column run after the computer is off. That worker is not connected yet. The session record lives in `docs/`. The company identity lives in `brand/`: the identity manual, the Realynk Assistants logo, and `brand/BRAND.md`.

## Run locally

```bash
npm install
npm test
npm run dev
```

Open http://127.0.0.1:4317. Unauthenticated visits go to the login page. The sidebar shows the signed-in name and email, and Log out ends the session.

## Design

The Rea door is the locked global design: Lato, light canvas, Realynk navy/blue accents, quiet corner waves. Sign-in is http://127.0.0.1:4317/login. Earlier landing samples stay under `/landing` for reference.

## Deploy on Vercel (`crm.realynk.com`)

Cursor Live Apps stay on their own private URL. The company subdomain is a separate Vercel project.

1. In [Vercel](https://vercel.com), **Add New Project** and import this repo (or deploy with `npx vercel` after `vercel login`).
2. Framework: Next.js. Root directory: `.`
3. Environment variables (Production):

| Name | Value |
| --- | --- |
| `DATABASE_URL` | Supabase Postgres URI for project **Realynk CRM** (Settings → Database → URI). Prefer the pooled URI for runtime. |
| `DATABASE_URL_UNPOOLED` | Direct Supabase URI (optional; used by migrate on build). |
| `REALYNK_EMAIL_DOMAIN` | `realynk.com` |
| `REALYNK_BOOTSTRAP_ADMIN_EMAIL` | your company admin address |
| `REALYNK_BOOTSTRAP_ADMIN_NAME` | admin display name |
| `REALYNK_BOOTSTRAP_ADMIN_PASSWORD` | admin password (10+ characters) |
| `REALYNK_ALLOWED_HOSTS` | `crm.realynk.com` (add `127.0.0.1,localhost` only if you need local overrides against that build) |

4. Deploy. Build runs `next build` then `scripts/migrate.mjs` against `DATABASE_URL`.
5. In Vercel → Project → **Domains**, add `crm.realynk.com`.
6. In your DNS for `realynk.com`, create the record Vercel shows (usually a CNAME `crm` → `cname.vercel-dns.com`).
7. Wait for HTTPS. Open `https://crm.realynk.com/login` and sign in with the bootstrap admin.

Do not commit database passwords. Keep the Cursor private app as a backup until the subdomain is healthy.
