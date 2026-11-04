#!/usr/bin/env bash
# doctor.sh — agent-workbench doctor. 자세한 설명은 README.md.
set -euo pipefail
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
command -v python3 >/dev/null 2>&1 || { echo "python3가 없습니다. macOS면 터미널에서: xcode-select --install" >&2; exit 2; }
exec python3 "$here/lib/workbench.py" doctor "$@"
