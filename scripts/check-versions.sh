#!/usr/bin/env bash
# Compara lo instalado contra la última estable del registry y detecta paquetes
# deprecados. Con --gate sale con error si hay alguno (lo usa verify.sh).
set -euo pipefail
cd "$(dirname "$0")/.."

GATE="${1:-}"
FAILED=0

deps=$(node -p "const p=require('./package.json');Object.keys({...p.dependencies,...p.devDependencies}).join('\n')")

printf '%-38s %-14s %-14s %s\n' PAQUETE INSTALADA ÚLTIMA ESTADO
while read -r dep; do
  [ -z "$dep" ] && continue
  # Leemos el package.json instalado por su ruta. No usamos require('$dep/package.json')
  # porque los paquetes modernos no exponen ese archivo en su campo "exports".
  installed=$(node -p "JSON.parse(require('fs').readFileSync('node_modules/$dep/package.json','utf8')).version" 2>/dev/null || echo '?')
  latest=$(pnpm view "$dep" version 2>/dev/null || echo '?')
  deprecated=$(pnpm view "$dep" deprecated 2>/dev/null || true)

  status="ok"
  [ -n "$deprecated" ] && { status="DEPRECADO"; FAILED=1; }
  [ "$installed" != "$latest" ] && [ "$status" = "ok" ] && status="hay $latest"

  printf '%-38s %-14s %-14s %s\n' "$dep" "$installed" "$latest" "$status"
done <<< "$deps"

if [ "$GATE" = "--gate" ] && [ "$FAILED" -ne 0 ]; then
  echo "✖ Hay dependencias deprecadas. Reemplácenlas por su sucesor documentado."
  exit 1
fi
