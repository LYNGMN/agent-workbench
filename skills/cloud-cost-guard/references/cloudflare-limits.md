# Cloudflare limits and prices (checked 2026-09-25)

Numbers change. Before relying on one, confirm it on the official pages:
https://developers.cloudflare.com/workers/platform/pricing/ · https://developers.cloudflare.com/d1/platform/pricing/ · https://developers.cloudflare.com/workers/platform/limits/

## Free plan (daily, blocks when exceeded; resets 00:00 UTC = 09:00 KST)
| Product | Limit |
|---|---|
| Workers requests | 100,000 / day |
| Workers CPU | 10 ms / invocation |
| D1 rows read | 5,000,000 / day |
| D1 rows written | 100,000 / day |
| D1 queries / subrequests | 50 per invocation |
| KV | 100,000 reads, 1,000 writes / day |
| Queues | 10,000 operations / day |

When D1 reads are exhausted every D1 read errors until the reset: signed-in pages, cron jobs and queue consumers fail (`scriptThrewException`). Stored data is unaffected.

## Workers Paid ($5 / month, usage beyond included amounts billed monthly, no hard cap)
| Product | Included / month | Beyond |
|---|---|---|
| Workers requests | 10,000,000 | $0.30 / million |
| Workers CPU | 30,000,000 ms | $0.02 / million ms |
| D1 rows read | 25,000,000,000 | $0.001 / million |
| D1 rows written | 50,000,000 | $1.00 / million |
| D1 storage | 5 GB | $0.75 / GB-month |
| KV | 10M reads, 1M writes | $0.50 / M reads, $5 / M writes |
| Queues | 1,000,000 operations | $0.40 / million |
| R2 | 10 GB, 1M class A, 10M class B | $0.015 / GB, $4.50 / M A, $0.36 / M B |
| Workers Logs | 20M events | see pricing page |

Per-invocation D1 limit on Paid: 1,000 queries.

## Cost notes
- `assets.run_worker_first: true` makes every static file request a Worker invocation: a bot flood is billed as requests + CPU. Add a WAF rate-limiting rule (Free zones get one).
- D1 **writes** cost 1,000× reads per row: loops that rewrite rows (requeue, recount columns on every import) are the expensive failure on Paid.
- Paid has no spending cap. The only protections are usage notifications, rate limiting and code-level caps.
