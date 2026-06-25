/** Serve production build + proxy /api/leonardo to local CORTEX API. */
import { createServer, request as httpRequest } from "http";
import { readFile } from "fs";
import { join, extname } from "path";
import { fileURLToPath } from "url";

const root = join(fileURLToPath(new URL(".", import.meta.url)), "..", "dist");
const port = Number(process.env.PORT ?? 4173);
const apiPort = Number(process.env.API_PORT ?? 3001);

const MIME = {
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

function proxyApi(req, res) {
  const proxy = httpRequest(
    {
      hostname: "127.0.0.1",
      port: apiPort,
      path: req.url,
      method: req.method,
      headers: { ...req.headers, host: `127.0.0.1:${apiPort}` },
    },
    (proxyRes) => {
      res.writeHead(proxyRes.statusCode ?? 502, proxyRes.headers);
      proxyRes.pipe(res);
    },
  );
  proxy.on("error", () => {
    res.writeHead(503, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "CORTEX API offline — using in-browser fallback" }));
  });
  req.pipe(proxy);
}

createServer((req, res) => {
  let path = req.url?.split("?")[0] ?? "/";

  if (path.startsWith("/api/")) {
    proxyApi(req, res);
    return;
  }

  if (path === "/") path = "/index.html";
  const file = join(root, path);
  const ext = extname(file);

  const send = (status, body, type) => {
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
  console.log(`CORTEX API proxy → http://127.0.0.1:${apiPort}/api/leonardo`);
  console.log("Login: dvnc.ai / ColoradoMuseum");
});
