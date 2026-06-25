# Leonardo Museum Web

Deploys automatically to **GitHub Pages** on every push to `main`.

**Live site:** https://ibrahimmukherjee-boop.github.io/Museum_Edit/#/login  
**Login:** `dvnc.ai` / `ColoradoMuseum`

## Push updates

```bash
npm run push:github
```

Or in GitHub Desktop: commit → Push origin.

## One-time GitHub setup

1. Repo **Settings → Pages → Build and deployment → Source:** **GitHub Actions**
2. After first push, open the **Actions** tab and wait for “Deploy GitHub Pages” to finish.

## Local museum (Parlor + Atelier)

**Production build on port 4173** (matches your kiosk URL):

```bash
cd leonardo-museum-web
npm install
npm run serve
```

Open **http://127.0.0.1:4173/** — login `dvnc.ai` / `ColoradoMuseum`

**Hot reload dev** (Vite on 5173 + CORTEX API on 3001):

```bash
npm run museum
```

### CORTEX + local GLM (Ollama)

1. Run Ollama with your model (e.g. `ollama pull glm4:9b` or your GLM 5.2 tag).
2. In Parlor → ⚙ Settings → confirm **Use local SLM** and model name.
3. CORTEX serves curated museum answers first; GLM **polishes** the draft (never replaces it blindly).

```bash
npm run test:cortex   # smoke test — flying machines, Atelier zones
```

## Local dev (frontend only)

```bash
npm install
npm run dev
```

## Stack

React + Vite · CORTEX in-browser · static GitHub Pages (no server API on Pages)
