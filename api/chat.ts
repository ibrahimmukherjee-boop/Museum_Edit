import type { VercelRequest, VercelResponse } from "@vercel/node";
import { LEONARDO_SYSTEM_PROMPT } from "../src/lib/prompt";
import { demoLeonardoReply } from "../src/lib/demoResponses";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const body = req.body as { messages?: ChatMessage[]; demo?: boolean };
  const messages = body?.messages ?? [];
  const lastUser = [...messages].reverse().find((m) => m.role === "user");

  if (!lastUser?.content?.trim()) {
    res.status(400).json({ error: "No user message" });
    return;
  }

  if (body.demo) {
    res.status(200).json({ reply: demoLeonardoReply(lastUser.content), provider: "demo" });
    return;
  }

  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    try {
      const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${groqKey}` },
        body: JSON.stringify({
          model: process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile",
          temperature: 0.85,
          max_tokens: 600,
          messages: [
            { role: "system", content: LEONARDO_SYSTEM_PROMPT },
            ...messages.map((m) => ({ role: m.role, content: m.content })),
          ],
        }),
      });
      if (r.ok) {
        const data = (await r.json()) as { choices?: { message?: { content?: string } }[] };
        const text = data.choices?.[0]?.message?.content?.trim();
        if (text) {
          res.status(200).json({ reply: text, provider: "groq" });
          return;
        }
      }
    } catch (e) {
      console.error("Groq error", e);
    }
  }

  res.status(200).json({
    reply: demoLeonardoReply(lastUser.content),
    provider: "demo-fallback",
  });
}
