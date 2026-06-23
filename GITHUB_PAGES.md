# Museum_Edit — GitHub + Pages setup

**Repo:** https://github.com/ibrahimmukherjee-boop/Museum_Edit  
**Live URL (after deploy):** https://ibrahimmukherjee-boop.github.io/Museum_Edit/#/login

---

## One-time: GitHub Pages

1. Open **Museum_Edit** on GitHub  
2. **Settings → Pages**  
3. **Build and deployment → Source:** choose **GitHub Actions** (not “Deploy from branch”)

---

## Push with GitHub Desktop (easiest)

1. **File → Add Local Repository**  
2. Choose folder:
   ```
   /Users/ibrahimmukherjee/Desktop/Museum Full Version/leonardo-museum-web
   ```
3. If asked to create a repo, choose **existing** `Museum_Edit` on GitHub  
4. Or: **Repository → Repository Settings → Remote**  
   Set to: `https://github.com/ibrahimmukherjee-boop/Museum_Edit.git`
5. **Commit** all files (message e.g. `Leonardo Museum — GitHub Pages`)  
6. **Push origin**

---

## Push from Terminal

```bash
cd "/Users/ibrahimmukherjee/Desktop/Museum Full Version/leonardo-museum-web"
npm run push:github
```

---

## After push

1. **Actions** tab → wait for **Deploy GitHub Pages** (green)  
2. Open: https://ibrahimmukherjee-boop.github.io/Museum_Edit/#/login  
3. Login: **dvnc.ai** / **ColoradoMuseum**

---

## Future updates from Cursor

After code changes, run:

```bash
npm run push:github
```

Or commit + push in GitHub Desktop. Every push to `main` rebuilds the site automatically.
