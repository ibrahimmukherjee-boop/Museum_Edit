/** Production server: static SPA + /api/leonardo (CORTEX + Ollama polish). */
import { createServer } from "node:http";
import { readFile } from "node:fs";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { ensureOllamaModel, ollamaReady, getActiveOllamaModel, warmupOllamaModel } from "../src/cortex/ollama";
import { handleLeonardoRequest } from "../src/server/leonardoRoute";

const root = join(fileURLToPath(new URL(".", import.meta.url)), "..", "dist");
const port = Number(process.env.PORT ?? 8080);

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
};

async function bootstrap() {
  if (process.env.OLLAMA_BASE_URL || process.env.USE_OLLAMA === "1") {
    console.log("[boot] waiting for Ollama…");
    for (let i = 0; i < 60; i++) {
      if (await ollamaReady()) break;
      await new Promise((r) => setTimeout(r, 2000));
    }
    if (process.env.OLLAMA_PULL_ON_START !== "0") {
      try {
        const model = await ensureOllamaModel();
        await warmupOllamaModel(undefined, model);
      } catch (e) {
        console.warn("[boot] Ollama model pull skipped:", e);
      }
    }
    console.log("[boot] Ollama ready");
  }
}

await bootstrap();

createServer(async (req, res) => {
  const path = req.url?.split("?")[0] ?? "/";

  if (req.method === "GET" && path === "/api/health") {
    const ollama = await ollamaReady();
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        ok: true,
        ollama,
        model: getActiveOllamaModel() ?? process.env.OLLAMA_MODEL ?? "qwen2.5:3b",
      }),
    );
    return;
  }

  if (req.method === "POST" && path === "/api/leonardo") {
    const chunks: Buffer[] = [];
    for await (const chunk of req) chunks.push(chunk as Buffer);
    let body: Parameters<typeof handleLeonardoRequest>[0];
    try {
      body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    } catch {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Invalid JSON" }));
      return;
    }
    const result = await handleLeonardoRequest(body);
    if (result.status !== 200) {
      res.writeHead(result.status, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: result.error }));
      return;
    }
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ reply: result.reply, provider: result.provider, trace: result.trace }));
    return;
  }

  let filePath = path === "/" ? "/index.html" : path;
  const file = join(root, filePath);
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
}).listen(port, "0.0.0.0", () => {
  console.log(`Leonardo Museum → http://0.0.0.0:${port}`);
  if (process.env.OLLAMA_BASE_URL) console.log(`  Ollama → ${process.env.OLLAMA_BASE_URL}`);
});
