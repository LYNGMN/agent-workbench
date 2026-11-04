# Naming Cloudflare resources

Decide names before creating anything; some can never change.

| Kind | Rename in place? | If you must change it |
|---|---|---|
| Worker | yes (dashboard Settings) | routes and service bindings follow the new name |
| KV namespace | yes, id kept (`wrangler kv namespace rename`) | — |
| D1 | **no** (only `read_replication` is editable) | create a new database and copy the data |
| R2 bucket | **no** | create a new bucket and copy the objects |
| Queue | **no** | create a new queue, move producers and consumers, drain the old one |

## Rules
- Every resource is `<service>-<role>`: D1 by the data it holds (`myapp-app`, `myapp-meta`), Queues by purpose with `-failures` for dead letters, R2 by purpose.
- Binding names in code (`DB`, `ACCESS_DB`) are separate from resource names; changing a binding means changing code.
- Code that compares queue names as strings must change together with the queue.
- Keep one resource table per project (name, id, binding, status) in its docs, checked against the account.

Evidence: a renamed service kept its old D1 and R2 names for good, and splitting that D1 later took weeks.
