# Deploy online — self-hosted SLM + push updates

Unlimited Parlor/Atelier polish **without Groq/API rate limits**:

- **CORTEX** — reasoning (JavaScript, no model)
- **Ollama** — `qwen2.5:3b` on your server for Leonardo voice polish
- **Docker Compose** — app + Ollama on one machine
- **GitHub Actions** — push to `main` → auto-deploy

---

## Architecture

```text
your-domain.org (Caddy HTTPS, optional)
        │
        ▼
   Node app (:8080)  — SPA + /api/leonardo
        │
        ▼
   Ollama (:11434)   — qwen2.5:3b (always on)
```

No per-token billing. You pay fixed **server RAM/CPU** (~$30–80/mo on AWS depending on size).

---

## What you will log into (agentic checklist)

Do these when prompted — I cannot access your accounts without you.

| Step | Service | Action |
|------|---------|--------|
| 1 | **AWS** | [console.aws.amazon.com](https://console.aws.amazon.com) → EC2 → Launch instance |
| 2 | **GitHub** | Create repo, push this project, add Secrets |
| 3 | **DNS** (optional) | Point domain A record to EC2 IP |

---

## Step 1 — AWS EC2 (recommended)

### Launch instance

1. Log in to **AWS Console** → **EC2** → **Launch instance**
2. **Name:** `leonardo-museum`
3. **AMI:** Ubuntu 22.04 LTS
4. **Instance type:** `t3.xlarge` (4 vCPU, 16 GB RAM) — comfortable for 3B model + app  
   Minimum: `t3.large` (8 GB) for `qwen2.5:3b` only
5. **Key pair:** Create new → download `.pem`
6. **Security group:** allow **22** (SSH), **80**, **443**, **8080** (or only 80/443 with Caddy)
7. **Storage:** 40 GB gp3
8. Launch

### Bootstrap server (SSH once)

```bash
chmod 400 your-key.pem
ssh -i your-key.pem ubuntu@YOUR_EC2_PUBLIC_IP

# On the server:
curl -fsSL https://raw.githubusercontent.com/YOUR_USER/leonardo-museum-web/main/deploy/ec2/bootstrap.sh | sudo bash
sudo usermod -aG docker ubuntu
exit
ssh -i your-key.pem ubuntu@YOUR_EC2_PUBLIC_IP   # re-login for docker group
```

### Clone and run

```bash
sudo mkdir -p /opt/leonardo-museum
sudo chown ubuntu:ubuntu /opt/leonardo-museum
git clone https://github.com/YOUR_USER/leonardo-museum-web.git /opt/leonardo-museum
cd /opt/leonardo-museum
npm run fetch-art || true   # optional: run on laptop, commit public/art, or fetch on server
docker compose up -d --build
```

First start pulls **qwen2.5:3b** (~2 GB) — allow **5–15 minutes**.

Test: `http://YOUR_EC2_IP:8080/#/login`  
Health: `http://YOUR_EC2_IP:8080/api/health` → `{"ok":true,"ollama":true}`

### HTTPS + custom domain

```bash
cd /opt/leonardo-museum
echo "DOMAIN=leonardo.yourmuseum.org" > .env
docker compose -f docker-compose.prod.yml --env-file .env up -d --build
```

Point DNS **A record** → EC2 public IP.

---

## Step 2 — GitHub (push updates)

```bash
cd ~/Desktop/Museum\ Full\ Version/leonardo-museum-web
git init
git add .
git commit -m "Leonardo Museum — Ollama production stack"
gh repo create leonardo-museum-web --private --source=. --push
```

### Repository Secrets (Settings → Secrets → Actions)

| Secret | Value |
|--------|-------|
| `DEPLOY_HOST` | EC2 public IP or hostname |
| `DEPLOY_USER` | `ubuntu` |
| `DEPLOY_SSH_KEY` | Contents of your `.pem` file |

Every **`git push origin main`** runs `.github/workflows/deploy.yml` → rebuilds on server.

---

## Step 3 — Verify SLM polish

1. Open site → **Parlor**
2. Ask Leonardo a question
3. In browser Network tab, `POST /api/leonardo` response should include:
   ```json
   "provider": "cortex+ollama"
   ```

If `cortex` only → Ollama not reachable; check `docker compose logs ollama app`.

---

## Alternatives to AWS

| Platform | Notes |
|----------|-------|
| **Hetzner CX42** (8 vCPU, 16 GB) | Often cheaper (~€15/mo), same Docker steps |
| **Railway** | Possible with 8 GB+ service; use `docker-compose.yml` |
| **DigitalOcean Droplet** | Same as EC2 |

GPU (AWS `g4dn`) only needed for 7B+ or high concurrency — **not required** for 3B museum chat.

---

## Environment variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `OLLAMA_BASE_URL` | `http://ollama:11434` | Ollama API |
| `OLLAMA_MODEL` | `qwen2.5:3b` | SLM for polish |
| `USE_OLLAMA` | `1` | Enable self-hosted polish |
| `GROQ_API_KEY` | empty | Optional cloud fallback |

---

## Local test (Docker on your Mac)

```bash
cd ~/Desktop/Museum\ Full\ Version/leonardo-museum-web
docker compose up -d --build
open http://127.0.0.1:8080/#/login
```

---

## Email login (next phase)

This stack does **not** include Clerk yet. For email access control, add **Clerk** on top (works with this Docker host). Say when ready and we wire it in.

---

## Quick commands on server

```bash
cd /opt/leonardo-museum
docker compose logs -f app ollama
docker compose restart app
git pull && docker compose up -d --build
curl http://127.0.0.1:8080/api/health
```
