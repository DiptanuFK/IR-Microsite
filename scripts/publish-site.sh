#!/bin/bash

set -euo pipefail

commit_message="${1:-}"

if [ -z "$commit_message" ]; then
  echo "Usage: ./scripts/publish-site.sh \"your commit message\""
  exit 1
fi

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "This folder is not a git repository."
  exit 1
fi

git add -A

if git diff --cached --quiet; then
  echo "No changes to publish."
  exit 0
fi

git commit -m "$commit_message"
git push origin main

echo
echo "Published to GitHub."
echo "Website: https://diptanufk.github.io/IR-Microsite/"
