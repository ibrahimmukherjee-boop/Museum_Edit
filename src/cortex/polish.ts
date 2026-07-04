import { polishWithOllama, getActiveOllamaModel } from "./ollama";
import { polishWithLlm } from "./llmCloud";

export type PolishProvider = "ollama" | "groq" | "huggingface" | "none";

export interface PolishResult {
  text: string;
  provider: PolishProvider;
  model?: string;
}

/** Polish CORTEX draft via Ollama (local SLM) or optional cloud fallback. */
export async function polishDraft(
  draft: string,
  systemPrompt: string,
  corpusContext?: string,
  question?: string,
): Promise<PolishResult | null> {
  const useOllama = process.env.OLLAMA_BASE_URL || process.env.OLLAMA_MODEL || process.env.USE_OLLAMA === "1";
  if (useOllama) {
    const ollama = await polishWithOllama(draft, systemPrompt, { corpusContext, question });
    if (ollama) return { text: ollama.text, provider: "ollama", model: ollama.model };
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

export function polishProviderLabel(p: PolishProvider, model?: string): string {
  const resolved = model ?? getActiveOllamaModel() ?? process.env.OLLAMA_MODEL ?? "qwen2.5:3b";
  if (p === "ollama") return `cortex+${resolved}`;
  if (p === "groq") return "cortex+groq";
  if (p === "huggingface") return "cortex+hf";
  return "cortex";
}
