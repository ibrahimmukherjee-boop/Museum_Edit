/** Optional cloud LLM polish (Groq / Hugging Face) — fallback when Ollama unavailable. */
export async function polishWithLlm(
  draft: string,
  systemPrompt: string,
  apiKey: string,
  provider: "groq" | "huggingface",
): Promise<string | null> {
  try {
    if (provider === "groq") {
      const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          temperature: 0.75,
          max_tokens: 500,
          messages: [
            {
              role: "system",
              content:
                systemPrompt +
                "\nRewrite the DRAFT below as Leonardo da Vinci in first person. Keep all facts. No markdown. Two to three short paragraphs.",
            },
            { role: "user", content: `DRAFT:\n${draft}` },
          ],
        }),
      });
      if (!r.ok) return null;
      const data = await r.json();
      return data.choices?.[0]?.message?.content?.trim() ?? null;
    }
    const r = await fetch("https://router.huggingface.co/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "Qwen/Qwen2.5-3B-Instruct",
        max_tokens: 500,
        temperature: 0.75,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Rewrite as Leonardo (first person, prose only):\n${draft}` },
        ],
      }),
    });
    if (!r.ok) return null;
    const data = await r.json();
    return data.choices?.[0]?.message?.content?.trim() ?? null;
  } catch {
    return null;
  }
}
