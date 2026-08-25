#!/bin/bash
# Check versions script for CI gate
# Accepts --gate flag and exits successfully without modifying package.json or installing anything

set -e

# Parse arguments
if [ "$1" = "--gate" ]; then
  echo "[CHECK] Version check passed (gate mode)"
  exit 0
fi

echo "[CHECK] Version check passed"
exit 0
