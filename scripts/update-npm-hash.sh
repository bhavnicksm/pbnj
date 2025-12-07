#!/usr/bin/env bash
# Update the npmDepsHash in flake.nix
# Run this after changing package.json or package-lock.json

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT"

echo "Computing npm dependencies hash..."
HASH=$(nix run nixpkgs#prefetch-npm-deps -- package-lock.json 2>/dev/null)

echo "Hash: $HASH"

# Update flake.nix with the new hash
sed -i.bak "s|npmDepsHash = \"sha256-[^\"]*\";|npmDepsHash = \"$HASH\";|" flake.nix
rm -f flake.nix.bak

echo "Updated flake.nix with new hash"
