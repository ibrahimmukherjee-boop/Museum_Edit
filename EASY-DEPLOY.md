# Deploy Leonardo Museum — the easy way

## Honest answer on “drag zip to Vercel”

**Vercel does not support drag-and-drop zip** in the dashboard.  
Netlify Drop does (static only). Vercel needs **one CLI command** or **GitHub import**.

---

## Easiest path (3 commands)

Open **Terminal** and paste:

```bash
cd ~/Desktop/Museum\ Full\ Version/leonardo-museum-web
npm install && npm run build
npx vercel --prod
```

First time: browser opens → log in to Vercel → done.  
You get a URL. Open `YOUR_URL/#/login`.

**No AWS. No Docker. No GitHub required.**

---

## Want a zip on your Desktop?

Run once:

```bash
cd ~/Desktop/Museum\ Full\ Version/leonardo-museum-web
chmod +x scripts/make-vercel-zip.sh
./scripts/make-vercel-zip.sh
```

Creates: **`~/Desktop/leonardo-museum-vercel.zip`**

Unzip → `cd ~/Desktop/leonardo-museum-vercel` → `vercel --prod`

---

## Truly drag-and-drop (static, 60 seconds)

```bash
cd ~/Desktop/Museum\ Full\ Version/leonardo-museum-web
npm run build
open dist
```

1. Zip the **dist** folder (right-click → Compress)  
2. Go to **[app.netlify.com/drop](https://app.netlify.com/drop)**  
3. Drag the **dist** folder (or unzipped contents) onto the page  

Instant URL. Museum works. CORTEX chat works in the browser.

---

## Optional: nicer Leonardo voice

Free Groq key at [console.groq.com](https://console.groq.com) → then:

```bash
vercel env add GROQ_API_KEY
vercel --prod
```

Not required for the museum to work.
