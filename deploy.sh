#!/usr/bin/env bash
#
# Publish your portfolio to the live site — one command.
#
#   ./deploy.sh                 → publishes with a default message
#   ./deploy.sh "fixed gallery" → publishes with your own note
#
# After it runs, the live site updates in about 1 minute at:
#   https://mayuunda.github.io/new-portfolio/
#
set -e

MSG="${1:-Update site}"
LIVE_URL="https://mayuunda.github.io/new-portfolio/"

echo "→ Saving your changes..."
git add -A
git commit -m "$MSG" || echo "  (nothing new to save — publishing current version)"

echo "→ Syncing with the live branch..."
git fetch origin main -q
git merge origin/main -m "Merge live site" -q || true

echo "→ Publishing..."
git push origin HEAD:main

echo ""
echo "✅ Done! Your site updates in ~1 minute at:"
echo "   $LIVE_URL"
