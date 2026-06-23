import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleLeonardoRequest } from "../src/server/leonardoRoute";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const body = req.body as Parameters<typeof handleLeonardoRequest>[0];
  const result = await handleLeonardoRequest(body);

  if (result.status !== 200) {
    res.status(result.status).json({ error: result.error });
    return;
  }

  res.status(200).json({ reply: result.reply, provider: result.provider, trace: result.trace });
}
