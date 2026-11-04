# Domains, routes and Cloudflare Access

| Fact | First seen | Guard |
|---|---|---|
| A Custom Domain cannot be attached to an apex that still has proxied A/AAAA records: deploy fails with code 100117 (the old records also caused 522s). | 2026-10-03 | Delete the apex A/AAAA in the dashboard first (keep MX), then rerun the same deploy. A wrangler token without DNS permission gets 403 on the DNS API, so the user does this step. |
| Worker routes take precedence over Custom Domains on the same hostname. | 2026-10-03 | A path route (`example.com/brand/*`) on one Worker keeps working while another Worker owns the domain; write both in the project's deployment map. |
| An internal or paid API Worker can stay reachable on `*.workers.dev` and preview URLs next to its custom domain. | 2026-09-30, internal API Worker | Set `workers_dev: false` and `preview_urls: false`; reach it by service binding or its custom domain with an API key. |
