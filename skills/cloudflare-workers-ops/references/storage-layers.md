# Storage layers: R2, D1, KV and the browser

Applies to every feature that produces an expensive result (AI call, paid API, long collection). Use it as the default.

## Do the same work once
- Result key = content hash of the input + rule version. Store the body in R2 and never overwrite it; a changed input or rule makes a new key.
- Concurrent identical requests: `INSERT … ON CONFLICT DO NOTHING` creates one job; the others wait for it. Other entry points use the same stored result.
- Fields that change without changing the meaning (provider route, view counts) stay out of the hash, or every old file is rewritten.

## Layers
| Layer | Holds | Rule |
|---|---|---|
| R2 | bodies, permanent | immutable keys; `If-None-Match: *` on upload |
| D1 | jobs and list indexes | query by indexed columns only; step-limit test for new queries |
| KV | hot lists the screen reads often | TTL, and a short TTL for empty results; rewrite when a job finishes |
| Browser | per-user responses | ETag and `Cache-Control: private` |

- Never read D1 once per row to build a list or card; read the KV list or one indexed query.
- KV is eventually consistent and may be missing; the caller must work without it.
- Awaiting several KV `put`s one after another before responding added 1.4 s per request (2026-10-21). Put cache writes in `ctx.waitUntil`, but keep awaiting the writes the very next request reads (a list followed at once by its body).

## Words: saved vs archived
- **Saved (저장)** = a copy kept for speed that may expire or be cleared (KV, short-lived D1 tables). Not in backups.
- **Archived (보관)** = a record that stays until deleted (R2, D1). Use "archived" in UI text only for these.
- When an upstream field is sometimes absent ("none" and "temporarily missing" look the same), store "none" only briefly.

## Paid features
Ship off by default with a zero budget, daily and monthly reservations, per-tier caps and a per-message work cap; say "off" in the release report. Details: cloud-cost-guard.
