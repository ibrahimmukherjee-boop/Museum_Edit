#!/usr/bin/env bash
# Server-side deploy script (called by GitHub Actions or manually).
set -euo pipefail
cd /opt/leonardo-museum

if [ -f docker-compose.prod.yml ] && [ -n "${DOMAIN:-}" ]; then
  docker compose -f docker-compose.prod.yml pull app 2>/dev/null || true
  docker compose -f docker-compose.prod.yml build app
  docker compose -f docker-compose.prod.yml up -d
else
  docker compose pull app 2>/dev/null || true
  docker compose build app
  docker compose up -d
fi

docker compose ps
curl -fsS http://127.0.0.1:8080/api/health | head -c 200
echo ""
echo "Deploy complete."
