import { polishWithOllama } from "./ollama";
import { polishWithLlm } from "./llmCloud";

export type PolishProvider = "ollama" | "groq" | "huggingface" | "none";

/** Polish CORTEX draft via glm-5.2:cloud (Ollama) — voice only; facts from RAG draft. */
export async function polishDraft(
  draft: string,
  systemPrompt: string,
  corpusContext?: string,
): Promise<{ text: string; provider: PolishProvider } | null> {
  const useOllama = process.env.OLLAMA_BASE_URL || process.env.OLLAMA_MODEL || process.env.USE_OLLAMA === "1";
  if (useOllama) {
    const ollama = await polishWithOllama(draft, systemPrompt, { corpusContext });
    if (ollama) return { text: ollama, provider: "ollama" };
  }

  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    const groq = await polishWithLlm(draft, systemPrompt, groqKey, "groq");
    if (groq) return { text: groq, provider: "groq" };
  }

  const hfKey = process.env.HUGGINGFACE_API_KEY ?? process.env.HF_TOKEN;
  if (hfKey) {
    const hf = await polishWithLlm(draft, systemPrompt, hfKey, "huggingface");
    if (hf) return { text: hf, provider: "huggingface" };
  }

  return null;
}

export function polishProviderLabel(p: PolishProvider): string {
  const model = process.env.OLLAMA_MODEL ?? "glm-5.2:cloud";
  if (p === "ollama") return `cortex+${model}`;
  if (p === "groq") return "cortex+groq";
  if (p === "huggingface") return "cortex+hf";
  return "cortex";
}
