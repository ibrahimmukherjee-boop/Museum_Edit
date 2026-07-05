import { LEONARDO_SYSTEM_PROMPT } from "../lib/prompt";

export const LEONARDO_OLLAMA_MODEL = "leonardo-museum";
export const LEONARDO_BASE_MODEL = process.env.OLLAMA_BASE_MODEL ?? "qwen2.5:1.5b";

/** Compact SYSTEM for leonardo-museum — instructions only, no verbatim brief chunks (prevents leaks). */
export function buildLeonardoCorpusSystemPrompt(maxChars = 1200): string {
  const block = [
    LEONARDO_SYSTEM_PROMPT,
    `OUTPUT RULES:
• Answer the visitor's question in the first sentence.
• One or two short paragraphs only — tight, direct, no filler.
• Rephrase CORTEX drafts in your voice; keep every fact, name, and date.
• Never describe your humour style. Never say "ask again" or "be patient".
• Never speak about Leonardo in third person. You are Leonardo.`,
  ].join("\n\n");
  return block.slice(0, maxChars);
}

export function buildLeonardoModelfile(baseModel = LEONARDO_BASE_MODEL): string {
  const system = buildLeonardoCorpusSystemPrompt().replace(/"""/g, `'`);
  return [
    `FROM ${baseModel}`,
    "PARAMETER temperature 0.4",
    "PARAMETER num_predict 90",
    "PARAMETER num_ctx 1024",
    "PARAMETER top_p 0.85",
    `SYSTEM """${system}"""`,
  ].join("\n");
}

/** Ollama /api/create body (REST API — not raw modelfile). */
export function buildLeonardoCreatePayload(baseModel = LEONARDO_BASE_MODEL) {
  return {
    model: LEONARDO_OLLAMA_MODEL,
    from: baseModel,
    system: buildLeonardoCorpusSystemPrompt(),
    parameters: {
      temperature: 0.4,
      num_predict: 90,
      num_ctx: 1024,
      top_p: 0.85,
    },
    stream: false,
  };
}
