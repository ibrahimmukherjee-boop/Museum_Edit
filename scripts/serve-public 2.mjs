/** Serve production build locally (static SPA). CORTEX runs in-browser when API is unavailable. */
import { createServer } from "http";
import { readFile } from "fs";
import { join, extname } from "path";
import { fileURLToPath } from "url";

const root = join(fileURLToPath(new URL(".", import.meta.url)), "..", "dist");
const port = Number(process.env.PORT ?? 4173);

const MIME: Record<string, string> = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};

createServer((req, res) => {
  let path = req.url?.split("?")[0] ?? "/";
  if (path === "/") path = "/index.html";
  const file = join(root, path);
  const ext = extname(file);

  const send = (status: number, body: Buffer | string, type: string) => {
    res.writeHead(status, { "Content-Type": type });
    res.end(body);
  };

  if (!ext) {
    readFile(join(root, "index.html"), (err, data) => {
      if (err) send(404, "Not found", "text/plain");
      else send(200, data, "text/html");
    });
    return;
  }

  readFile(file, (err, data) => {
    if (err) {
      readFile(join(root, "index.html"), (e2, html) => {
        if (e2) send(404, "Not found", "text/plain");
        else send(200, html, "text/html");
      });
      return;
    }
    send(200, data, MIME[ext] ?? "application/octet-stream");
  });
}).listen(port, () => {
  console.log(`Leonardo Museum → http://127.0.0.1:${port}`);
  console.log("Tip: use `npx vercel dev` for live /api/leonardo with Groq polish.");
});
