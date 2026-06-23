#!/usr/bin/env bash
# One-time EC2 bootstrap (Ubuntu 22.04). Run as root or with sudo.
set -euo pipefail

echo "=== Installing Docker ==="
apt-get update -qq
apt-get install -y ca-certificates curl git
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
  | tee /etc/apt/sources.list.d/docker.list > /dev/null
apt-get update -qq
apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

mkdir -p /opt/leonardo-museum
chown -R "${SUDO_USER:-ubuntu}:$(id -gn "${SUDO_USER:-ubuntu}")" /opt/leonardo-museum 2>/dev/null || true

echo "=== Done ==="
echo "Clone your repo into /opt/leonardo-museum or let GitHub Actions deploy there."
echo "Recommended instance: t3.xlarge (4 vCPU, 16 GB RAM) for qwen2.5:3b"
