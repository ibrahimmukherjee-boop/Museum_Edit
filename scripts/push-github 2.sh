#!/usr/bin/env bash
# Push to https://github.com/ibrahimmukherjee-boop/Museum_Edit
set -euo pipefail
cd "$(dirname "$0")/.."
REPO="https://github.com/ibrahimmukherjee-boop/Museum_Edit.git"
MSG="${1:-Leonardo Museum web update}"

echo "GitHub:"
gh auth status

git rev-parse --is-inside-work-tree 2>/dev/null || git init
git remote remove origin 2>/dev/null || true
git remote add origin "$REPO"

git add -A
git status -sb

if ! git diff --cached --quiet 2>/dev/null || [ -n "$(git status --porcelain)" ]; then
  git commit -m "$MSG"
fi

git branch -M main

if git ls-remote --heads origin main 2>/dev/null | grep -q main; then
  git pull origin main --rebase 2>/dev/null || git pull origin main --allow-unrelated-histories --no-edit || true
fi

git push -u origin main

echo ""
echo "Pushed: https://github.com/ibrahimmukherjee-boop/Museum_Edit"
echo "Site (after Actions): https://ibrahimmukherjee-boop.github.io/Museum_Edit/#/login"
