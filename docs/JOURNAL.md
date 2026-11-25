# How we keep the record

Write this down at the end of a working session, before stopping. Three files, in this order.

1. `docs/journal/YYYY-MM-DD.md` — that day only. What we tried, what shipped, each issue, and the solution. Add a new file. Do not rewrite an older day.
2. `docs/CURRENT_STATE.md` — what works tonight, and the open issues. Replace the open list when something is fixed.
3. `docs/ARCHITECTURE.md` — the shape we are building. Change it only when the shape changes.

Rules:

- Plain language. Name the commit when there is one.
- Times in Asia/Shanghai.
- No secrets, passwords, API keys, or real customer rows. Sample people stay labeled fictional.
- An issue stays on the open list until the journal has a solution line for it.
- The live Lead Enrichment app at https://lead-cleaner-opal.vercel.app is the interface to match. The 2 September 2026 tracker wins over the 15 August 2026 chooser.
