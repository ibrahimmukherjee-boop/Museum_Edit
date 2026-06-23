# Leonardo Museum — Deploy Online

## Recommendation for museums: **Vercel**

| | **Vercel** (recommended) | **Railway** |
|---|--------------------------|-------------|
| Static site + API | Native — `api/leonardo.ts` is serverless | Custom Node server (`railway-server.ts`) |
| Custom domain + SSL | One-click, free | Supported |
| Cold starts | ~100–300ms (fine for museum chat) | Always-on container (no cold start) |
| Cost at museum scale | Generous free tier | ~$5/mo minimum |
| Ops complexity | Lowest | Medium |
| iPad kiosk | Excellent (global CDN) | Good |

**Use Vercel** unless you need a always-on dedicated server or already run other services on Railway.

CORTEX reasoning runs **in the browser** even without an API. The hosted API adds optional Groq/Hugging Face **phrasing polish** only.

---

## Local development (tested)

```bash
cd ~/Desktop/Museum\ Full\ Version/leonardo-museum-web
bash scripts/copy-artwork.sh
npm install
npm run test:cortex          # 4/4 pipeline smoke tests
npm run dev:full             # Vite + /api/leonardo on :3001
```

Open the URL Vite prints (usually `http://localhost:5173`).

**Flow to verify:**
1. Login → Enter the Exhibit
2. Home → Parlor → ask a question (CORTEX replies)
3. Atelier → Studio → scroll folios → tap glowing hotspot
4. Settings → Demo Mode only if you want canned replies

Optional Groq polish locally:

```bash
GROQ_API_KEY=gsk_... npm run dev:full
```

---

## Deploy to Vercel (recommended)

### 1. Prepare

```bash
npm run build
npm run test:cortex
```

### 2. Push to GitHub

Create a repo containing `leonardo-museum-web` (or the whole `Museum Full Version` folder with root set in Vercel).

### 3. Import on Vercel

1. [vercel.com](https://vercel.com) → **Add New Project** → import repo
2. **Root Directory:** `leonardo-museum-web` (if monorepo)
3. **Framework:** Vite (auto-detected)
4. **Environment Variables:**

| Variable | Required | Purpose |
|----------|----------|---------|
| `GROQ_API_KEY` | Recommended | Natural Leonardo phrasing |
| `HUGGINGFACE_API_KEY` | Optional | Fallback LLM polish |

5. **Deploy**

You get: `https://your-project.vercel.app`

### 4. Custom domain (museum)

1. Vercel → Project → **Settings** → **Domains**
2. Add e.g. `leonardo.yourmuseum.org`
3. Add the CNAME record at your DNS provider
4. SSL is automatic

**Good names:** `speak.yourmuseum.org`, `atelier.museumname.com`, `leonardo.exhibit.org`

### 5. Museum launch checklist

- [ ] `npm run test:cortex` passes
- [ ] 36 artwork files in `public/art/`
- [ ] Test on iPad Safari: login → Parlor → Atelier hotspots
- [ ] `GROQ_API_KEY` set on Vercel
- [ ] Demo Mode **off** in curator settings (default)
- [ ] Custom domain live

---

## Deploy to Railway (alternative)

Railway runs a single Node process that serves the built SPA **and** `/api/leonardo`.

### 1. Push to GitHub (same as Vercel)

### 2. Create Railway project

1. [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub**
2. Select the repo; set root to `leonardo-museum-web` if needed
3. Railway reads `railway.json`:
   - Build: `npm install && npm run build`
   - Start: `tsx scripts/railway-server.ts`

### 3. Environment variables

| Variable | Purpose |
|----------|---------|
| `GROQ_API_KEY` | Optional LLM polish |
| `HUGGINGFACE_API_KEY` | Optional fallback |
| `PORT` | Set automatically by Railway |

### 4. Custom domain

Railway → Service → **Settings** → **Networking** → **Custom Domain**

### Railway vs Vercel for this app

- Railway: one always-on server, simpler mental model, small monthly cost
- Vercel: better CDN for static assets, serverless API scales to zero, free tier usually enough

For a **public museum kiosk with moderate traffic**, **Vercel is the better default**.

---

## Architecture reminder

```
Visitor question / hotspot tap
    → Zone Router (art / anatomy / engineering)
    → BM25 retrieval (codex + paintings)
    → Domain Brain (structured reasoning)
    → Critic + Verifier (scores in trace)
    → Conversation layer (prose)
    → Optional LLM polish (Groq/HF — phrasing only)
```

Reasoning is explicit. The LLM never decides facts — it only rewrites the CORTEX draft.

---

## Static-only fallback (no API)

If you upload `dist/` to Netlify Drop or any static host:

- CORTEX still works in the browser
- No Groq polish unless you add a separate API
- Enable **Demo Mode** in settings for fully offline canned replies

For the full museum experience, deploy to **Vercel with `GROQ_API_KEY`**.
