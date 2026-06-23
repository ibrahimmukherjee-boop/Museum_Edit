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

## Local dev

```bash
npm install
npm run dev
```

## Stack

React + Vite · CORTEX in-browser · static GitHub Pages (no server API on Pages)
