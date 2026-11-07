#!/usr/bin/env bash
# Every repository check, shared by all workflows and local runs.
# Optional: SURGE_CLI=/Applications/Surge.app/Contents/Applications/surge-cli
# adds Surge's own profile parser (macOS only; not available on GitHub runners).
set -euo pipefail
cd "$(dirname "$0")/.."
echo "python $(python3 --version 2>&1 | cut -d' ' -f2), node $(node --version), $(jq --version)"
if [ -n "${SURGE_CLI:-}" ]; then
  python3 scripts/validate_loon.py --surge-cli "$SURGE_CLI"
else
  python3 scripts/validate_loon.py
fi
python3 -m unittest discover -s tests -p 'test_loon.py'
node tests/loon_runtime.cjs
node tests/argument_probe.cjs
python3 -m unittest discover -s tests -p 'test_amap.py'
python3 -m unittest discover -s tests -p 'test_external_jq.py'
python3 -m unittest discover -s tests -p 'test_converter.py'
python3 -m unittest discover -s tests -p 'test_fanqie.py'
node tests/upstream_runtime.cjs
python3 scripts/validate_repository.py
node tests/alidns_auto_switch.cjs
node tests/panel_scripts.cjs

if [ -n "${SURGE_CLI:-}" ]; then
  python3 scripts/validate_yfamilys.py --surge-cli "$SURGE_CLI"
else
  python3 scripts/validate_yfamilys.py
fi
python3 -m unittest discover -s tests -p 'test_yfamilys.py'
