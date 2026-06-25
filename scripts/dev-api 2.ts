/** Local dev API for /api/leonardo — pairs with Vite proxy on port 3001. */
import { createServer } from "node:http";
import { handleLeonardoRequest } from "../src/server/leonardoRoute";

const port = Number(process.env.PORT ?? 3001);

createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method !== "POST" || req.url !== "/api/leonardo") {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not found" }));
    return;
  }

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
}).listen(port, () => {
  console.log(`CORTEX dev API → http://127.0.0.1:${port}/api/leonardo`);
  if (process.env.OLLAMA_BASE_URL) console.log(`  Ollama polish: ${process.env.OLLAMA_BASE_URL}`);
  else if (process.env.GROQ_API_KEY) console.log("  Groq polish: enabled");
});
