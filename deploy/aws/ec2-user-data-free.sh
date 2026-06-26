#!/bin/bash
# EC2 first-boot (Free Tier): Docker + Museum_Edit — CORTEX + SPA + art (no Ollama).
set -euo pipefail
export DEBIAN_FRONTEND=noninteractive

apt-get update -qq
apt-get install -y ca-certificates curl git

if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com | sh
fi
usermod -aG docker ubuntu || true

mkdir -p /opt/leonardo-museum
chown ubuntu:ubuntu /opt/leonardo-museum

sudo -u ubuntu bash <<'UBUNTU'
set -euo pipefail
cd /opt/leonardo-museum
if [ ! -d .git ]; then
  git clone https://github.com/ibrahimmukherjee-boop/Museum_Edit.git .
fi
git pull origin main || true
docker compose -f docker-compose.free.yml up -d --build
UBUNTU

echo "leonardo-museum free-tier boot complete" > /var/log/leonardo-museum-boot.log
