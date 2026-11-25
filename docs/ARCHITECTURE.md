# Architecture we are working

Updated 25 November 2026, 23:10 Asia/Shanghai.

Realynk CRM is the product. Lead Enrichment lives inside it, behind sign-in, with the sheet stored for the company. Joan uses it to clean leads before outreach.

## What is running

The app is Next.js. Locally it listens on 127.0.0.1 port 4317. Sign-in is invite-only. There is no public registration. A session cookie is checked on every CRM page, and Postgres row level security checks the same person again on every read and write.

Roles are Admin, Manager, and Sales. Admin can manage people and settings. Manager can see every lead and assign them. Sales sees assigned work. The sample workspace stays on until a company email domain is configured. The sample admin cannot be opened with one click.

The cleaner is the Lead Enrichment sheet: client tabs, column letters, row numbers, and a three-dot menu on each column. Lists live in `cleaner_lists` (headers, rows, and column meta such as prompts and frozen columns). Company and Title can run built-in name and title cleaning. Managers and admins can add ready rows to the pipeline. Export is a CSV download.

## What is next

A column run should finish after the computer is off. Supabase project **Realynk CRM** (Tokyo, healthy) is signed in for that. It is not the job runner yet.

The intended path:

1. Run column writes a job row, then returns.
2. A worker on Supabase continues the job in small batches.
3. Each finished batch is written back onto the same sheet.
4. Closing the laptop does not cancel work that has already been saved as a job.

Built-in Company and Title cleaning can run with no outside key. Industry, email verification, ICP, and custom prompts stay off until a server key exists. Keys stay on the server. The browser does not hold them, and there is no open proxy that can call an arbitrary URL.

## Parked

LinkedIn message generation is not a screen. Person LinkedIn URL mapping stays. The August workspace chooser stays gone. Publishing the CRM is on hold.
