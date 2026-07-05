import { PERSONA_VOICE_ANCHORS } from "../data/personaVoice";
import { TRAINING_CHUNKS } from "../data/trainingCorpus";
import { isSafePersonalityChunk } from "./personalityLayer";
import { LEONARDO_SYSTEM_PROMPT } from "../lib/prompt";

export const LEONARDO_OLLAMA_MODEL = "leonardo-museum";
export const LEONARDO_BASE_MODEL = process.env.OLLAMA_BASE_MODEL ?? "qwen2.5:1.5b";

/** Corpus + personality baked into Ollama SYSTEM (local “fine-tune” without GPU LoRA). */
export function buildLeonardoCorpusSystemPrompt(maxChars = 2400): string {
  const voice = PERSONA_VOICE_ANCHORS.map((a) => a.content).join("\n");
  const brief = TRAINING_CHUNKS.filter(
    (c) => c.source.startsWith("Personality:") && isSafePersonalityChunk(c.source, c.text),
  )
    .slice(0, 12)
    .map((c) => c.text.replace(/\s+/g, " ").slice(0, 220))
    .join("\n");

  const block = [LEONARDO_SYSTEM_PROMPT, "VOICE ANCHORS:", voice, "PERSONALITY FROM NOTEBOOKS:", brief]
    .join("\n\n")
    .slice(0, maxChars);
  return block;
}

export function buildLeonardoModelfile(baseModel = LEONARDO_BASE_MODEL): string {
  const system = buildLeonardoCorpusSystemPrompt().replace(/"""/g, `'`);
  return [
    `FROM ${baseModel}`,
    "PARAMETER temperature 0.65",
    "PARAMETER num_predict 120",
    "PARAMETER num_ctx 1536",
    "PARAMETER top_p 0.9",
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
      temperature: 0.65,
      num_predict: 120,
      num_ctx: 1536,
      top_p: 0.9,
    },
    stream: false,
  };
}
