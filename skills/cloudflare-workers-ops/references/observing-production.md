# Observing production

What local tools and `wrangler` cannot see, and how to check instead.

| Fact | First seen | Guard |
|---|---|---|
| `wrangler tail` shows no scheduled (cron) events; zero lines is not evidence that a cron did not run. | 2026-10-23 | Diagnose crons from what they write (a `*_runs` table row, a KV stamp) or from dashboard logs. |
| Code that swallows the D1 error message leaves `tail` empty for a production-only SQL failure. | 2026-10-01, admin page 503 | Log the D1 message; run the generated SQL read-only with `wrangler d1 execute <db> --remote` (user approval). |
| Bot protection blocks headless Playwright and rapid reloads against the live site (429, "Access denied"), while `curl` stays 200. | 2026-10-02, 2026-10-16 | Measure live pages in a real browser window at normal pace; do not loop reloads; use `curl` for HTML and asset checks. |

Container logs and Workers Logs: see containers-and-do.md. Injected production scripts (CSP): see deploy-and-secrets.md.
