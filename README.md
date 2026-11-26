# Realynk CRM

Internal CRM for Realynk leads, opportunities, and sales activity. Sign-in is limited to approved company accounts. There is no public registration.

## Sign in

The company email domain is **not set in this project**. The app does not guess it.

Until `REALYNK_EMAIL_DOMAIN` is set, the CRM opens a labeled sample workspace. The sample people are fictional. Sales and manager sample accounts can be opened from the login page. The sample admin is listed and cannot be opened that way. Setting the domain turns sample mode off, disables those accounts, and requires a verified company email.

Copy `.env.example` to `.env.local` when you are ready to enforce the domain:

- `REALYNK_EMAIL_DOMAIN` — the part after `@` in a company address
- `REALYNK_BOOTSTRAP_ADMIN_EMAIL` — first admin, on that domain
- `REALYNK_BOOTSTRAP_ADMIN_NAME`
- `REALYNK_BOOTSTRAP_ADMIN_PASSWORD` — at least 10 characters

The bootstrap admin is created already verified, because you set the password yourself. Every later person is invited by an admin, gets a one-time verification link, and chooses a password before they can sign in. The link is shown to the admin to send on; this app does not include an email provider.

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
