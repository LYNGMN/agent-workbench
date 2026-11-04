---
name: cloud-cost-guard
description: Use when writing, reviewing or deploying queries, list pages, aggregates, batches, queues or scheduled jobs on metered serverless (Cloudflare Workers, D1, KV, R2, Queues) or paid per-call APIs; before bulk imports, reclassification, syncs or backfills; when a free-plan limit blocks the service ("exceeded daily limit", D1 reads blocked); or before changing a paid plan.
argument-hint: "[점검할 쿼리나 배치]"
---

# Cloud Cost Guard

## Overview
On metered platforms a query shape is a bill. The same code that passes every test can read 250k rows per page once the data grows, which blocks a free plan for a day or runs up a paid one. **Every change on a hot path ships with a cost estimate at the future data size, a guard that fails on the bad shape, and a stop condition.**

**Violating the letter of these rules is violating their spirit.**

## Required for every change (the deploy gate)
Write these into the release report. Missing one → do not deploy.

1. **Cost per call at the post-change data size**: rows read and written per request × calls per day, for today's size AND the size after any planned import (×2, ×10). Compare with the plan limits in [cloudflare-limits.md](references/cloudflare-limits.md).
2. **Shape check** against [query-patterns.md](references/query-patterns.md). A correlated subquery in a SELECT that also has ORDER BY/LIMIT, a COUNT per item, a per-folder rescan or an N+1 loop blocks the deploy until rewritten.
3. **A deterministic guard test** that fails on the old shape (structure assertion or row/step count, not wall-clock timing).
4. **Batch and queue sizes** fit the per-invocation limits (free: 50 D1 queries/subrequests; count the work per item × items per message).
5. **Paid external APIs**: calls per item, daily cap in code, money per day at the cap, and the provider's own monthly spending limit.
6. **Account guards exist**: usage alerts at 25% of the included amounts and one rate-limiting rule against request floods. If they are missing, the user sets them (dashboard); say so.

## Bulk operations (import, reclassify, sync, backfill)
- Re-estimate every hot read (list pages, aggregates) at the post-operation size **before** starting; growth multiplies existing queries.
- Estimate the operation's own cost: items × (rows read + rows **written** per item: inserts, tag rows, counter updates, requeues) and items × paid API calls. Writes cost 1,000× reads on D1 Paid and the free plan allows only 100k/day; write the total in the plan.
- Run in steps. Before and after each step run `scripts/cf-usage.mjs` (read-only). Stop at 50% of the day's limit or any alert.
- Keep admins from refreshing heavy pages in a loop while checking results; cached reads do not protect uncached admin views.

## Measuring
[measurement.md](references/measurement.md): Cloudflare GraphQL (top queries by rows read, hourly totals) and a local SQLite step count to compare old vs new shapes on seeded data.

## Incident (limit hit or bill spike)
1. `scripts/cf-usage.mjs` → heaviest query and when it started.
2. Stop bulk jobs and tell the sessions running them.
3. Fix the shape, add the guard test, deploy, re-measure after the reset or upgrade.
4. Upgrading the plan is the user's decision and payment; state the cost and the included amounts.

## Rationalizations
| Excuse | Reality |
|---|---|
| "All tests pass" | Tests run on tiny data. Cost appears at production size. |
| "The page is cached" | Admins and cache misses still run it; one import changes the size. |
| "Free plan just blocks, no bill" | It blocks the whole service for up to a day. |
| "Paid plan is cheap" | Overage has no cap; a 250k-row page at scale is real money. |
| "We'll measure after deploy" | After deploy the limit is already gone. Estimate first. |
| "It's only an import" | The import grows the data every hot query reads. |

## Red flags
Subqueries in the SELECT list of a sorted, limited query · COUNT inside a per-row subquery · "we'll optimize later" · a bulk job started without a usage check · a queue message holding many items · no alert configured.
