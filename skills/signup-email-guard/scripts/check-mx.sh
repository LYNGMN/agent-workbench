#!/usr/bin/env bash
# Prints the MX servers of every curated alias domain (data/alias-domains.json), so a stale entry
# (no MX, or MX moved to an ordinary mail host) shows up before the list is trusted again.
# Usage: bash scripts/check-mx.sh
set -euo pipefail
here="$(cd "$(dirname "$0")/.." && pwd)"
node -e 'for (const d of require(process.argv[1]).domains) console.log(d.domain + "\t" + d.service)' "$here/data/alias-domains.json" |
while IFS=$'\t' read -r domain service; do
  mx="$(dig +short MX "$domain" | sort | tr '\n' ' ')"
  printf '%-26s %-28s %s\n' "$domain" "$service" "${mx:-NO MX ← check this one}"
done
