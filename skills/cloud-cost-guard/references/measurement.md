# Measuring cost

## Production (read-only)
- `node scripts/cf-usage.mjs` (from a project with wrangler logged in; set `CLOUDFLARE_ACCOUNT_ID`): month-to-date use of every product vs the Paid included amounts, month-end pace, today's D1 reads and the five heaviest queries. Exit 2 when a pace passes `--threshold` (default 25%) or today's D1 reads pass `--daily-d1-reads`.
- Ad-hoc GraphQL (`https://api.cloudflare.com/client/v4/graphql`, token from `wrangler auth token --json`, never printed). Useful datasets:
  - `d1QueriesAdaptiveGroups` ordered by `sum_rowsRead_DESC` → which query, calls, rows per call
  - `d1AnalyticsAdaptiveGroups` by `datetimeHour` or `datetimeFifteenMinutes` → when it started
  - `workersInvocationsAdaptive` by `status` → `scriptThrewException` after a limit is hit
  - zone `httpRequestsAdaptiveGroups` by `clientRequestPath` → which endpoint drove the calls
- `wrangler d1 insights <db> --sort-by reads --json` also lists heavy queries.

## Before deploy (local)
Local D1 (`wrangler d1 execute --local`) does not report rows read. Compare shapes with SQLite's VM step count, which tracks the rows visited:

```python
import sqlite3
c = sqlite3.connect('seeded-copy.sqlite')   # migrations applied, data seeded at the post-import size
def steps(sql, args=()):
    n = [0]
    c.set_progress_handler(lambda: n.__setitem__(0, n[0] + 1) or 0, 1)
    rows = c.execute(sql, args).fetchall()
    c.set_progress_handler(None, 1)
    return n[0], rows
old_steps, old_rows = steps(OLD_SQL, ARGS)
new_steps, new_rows = steps(NEW_SQL, ARGS)
assert old_rows == new_rows            # same output
print(old_steps / new_steps)           # the saving; report it
```
Seed at least two sizes (today and after the planned import) and check that the new shape grows linearly.
