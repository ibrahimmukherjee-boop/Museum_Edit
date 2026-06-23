# Vercel deployment — Leonardo Museum Web

## Can Cursor link to Vercel and push from here?

**Partially — not automatically.**

| Action | From this Cursor agent | What you need |
|--------|------------------------|---------------|
| Prepare code + `vercel.json` | Yes | Done |
| Run `npm run build` locally | **Often blocked** | Agent shell may fail; run on your Mac |
| Log into your Vercel account | **No** | Only you can authenticate at [vercel.com](https://vercel.com) |
| `vercel link` / `vercel --prod` | **Only if** `vercel` CLI is installed **and** you ran `vercel login` in Terminal | Then agent or you can deploy |
| Push to GitHub | **Only if** `gh auth login` is done and a remote exists | Standard git push |
| Auto-deploy on push | **Yes, after one-time setup** | Connect GitHub repo in Vercel dashboard |

**Recommended path:** push this folder to GitHub → import on Vercel → set `GROQ_API_KEY` → every `git push` redeploys.

The agent **cannot** open your Vercel dashboard or use your credentials without you logging in first.

---

## One command — prep everything

```bash
cd ~/Desktop/Museum\ Full\ Version/leonardo-museum-web
chmod +x scripts/*.sh
npm run prep:vercel
```

This runs: `npm install` → fetch art → assign fallbacks → `test:cortex` → `npm run build`.

---

## Deploy to Vercel (first time)

### 1. GitHub

```bash
cd ~/Desktop/Museum\ Full\ Version/leonardo-museum-web
git init
git add .
git commit -m "Leonardo Museum web — ready for Vercel"
gh repo create leonardo-museum-web --public --source=. --push
```

(Or create the repo on GitHub manually and `git push`.)

### 2. Vercel import

1. [vercel.com/new](https://vercel.com/new)
2. Import `leonardo-museum-web`
3. Framework: **Vite** (auto)
4. Build command: `npm run build`
5. Output directory: `dist`
6. Environment variable: **`GROQ_API_KEY`** ([console.groq.com](https://console.groq.com))

### 3. Optional — CLI deploy (after `vercel login`)

```bash
npx vercel --prod
```

---

## What ships

- Static SPA (`dist/`) with HashRouter — works on Vercel rewrites
- Serverless API: `api/leonardo.ts` → `/api/leonardo`
- CORTEX runs in-browser; API adds optional Groq polish
- `public/art/` copied into `dist/art/` at build time

---

## Launch checklist

- [ ] `npm run prep:vercel` exits 0
- [ ] `npm run verify-art` — no MISSING files (duplicates OK if Wikimedia rate-limited)
- [ ] Test: login → Parlor → Atelier (all 3 rooms)
- [ ] `GROQ_API_KEY` on Vercel
- [ ] Custom domain (optional) in Vercel → Settings → Domains
