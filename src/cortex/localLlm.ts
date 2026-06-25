/**
 * Browser-side local SLM integration.
 * Talks to a local Ollama / llama.cpp / compatible OpenAI-like endpoint.
 * Default: http://127.0.0.1:11434 (Ollama).
 *
 * The user can override via Settings → Local model URL & model name.
 * Common small models that run on a laptop:
 *   - qwen2.5:3b
 *   - gemma2:2b
 *   - phi3:mini
 *   - glm-4-9b (if served via llama.cpp / Ollama)
 */

export interface LocalLlmConfig {
  baseUrl: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
}

export const DEFAULT_LOCAL_CONFIG: LocalLlmConfig = {
  baseUrl: "http://127.0.0.1:11434",
  model: "qwen2.5:3b",
  temperature: 0.75,
  maxTokens: 500,
  timeoutMs: 90_000,
};

export interface LocalLlmMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function localLlmReady(config?: Partial<LocalLlmConfig>): Promise<boolean> {
  const models = await listLocalModels(config?.baseUrl);
  return models.length > 0;
}

export async function listLocalModels(baseUrl?: string): Promise<string[]> {
  const base = (baseUrl ?? DEFAULT_LOCAL_CONFIG.baseUrl).replace(/\/$/, "");
  try {
    const r = await fetch(`${base}/api/tags`, {
      method: "GET",
      signal: AbortSignal.timeout(3000),
    });
    if (!r.ok) return [];
    const data = (await r.json()) as { models?: { name: string }[] };
    return data.models?.map((m) => m.name) ?? [];
  } catch {
    return [];
  }
}

/** Pick the best installed model: GLM 5.2 → GLM-4 → Qwen fallback. */
export async function resolveLocalModel(
  preferred: string,
  baseUrl?: string,
): Promise<string | null> {
  const installed = await listLocalModels(baseUrl);
  if (!installed.length) return null;

  const candidates = [
    preferred,
    "glm-5.2:cloud",
    "glm-5.2",
    "glm4:9b",
    "glm4:latest",
    "qwen2.5:7b-instruct-q4_K_M",
    "qwen2.5:7b",
    "qwen2.5:3b",
  ];

  for (const c of candidates) {
    const base = c.split(":")[0];
    const hit = installed.find((m) => m === c || m.startsWith(`${base}:`));
    if (hit) return hit;
  }
  return installed[0];
}

export async function localModelInstalled(model: string, baseUrl?: string): Promise<boolean> {
  const installed = await listLocalModels(baseUrl);
  return installed.some((m) => m === model || m.startsWith(`${model}:`));
}

/** Polish a CORTEX draft — preserve facts; weave in folio + conversation context. */
export async function polishWithLocalLlm(
  draft: string,
  question: string,
  config?: Partial<LocalLlmConfig> & {
    folioContext?: { title: string; body: string; domain?: string };
    hotspotLabel?: string;
    history?: { role: string; content: string }[];
  },
): Promise<string | null> {
  if (!draft.trim()) return null;

  const folioBlock = config?.folioContext
    ? `\nFolio before you: "${config.folioContext.title}" — ${config.folioContext.body.slice(0, 280)}`
    : "";
  const hotspotBlock = config?.hotspotLabel ? `\nVisitor tapped hotspot: ${config.hotspotLabel}` : "";
  const historyBlock =
    config?.history && config.history.length > 1
      ? `\nRecent conversation:\n${config.history
          .slice(-4)
          .map((m) => `${m.role}: ${m.content.slice(0, 120)}`)
          .join("\n")}`
      : "";

  const system = [
    leonardoSystemPrompt(),
    "",
    "You are polishing a museum draft at Leonardo's shoulder in the Atelier.",
    "Preserve every fact and invitation in the draft. Answer the visitor's latest question directly.",
    "Speak as if the painting or folio is alive before you both. Two to three short paragraphs.",
    "Return only Leonardo's prose — no preamble, no markdown.",
    folioBlock,
    hotspotBlock,
  ].join("\n");

  const user = `Visitor asks: "${question}"${historyBlock}\n\nDraft to polish:\n${draft}`;

  const polished = await chatWithLocalLlm(
    [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    { ...config, temperature: 0.48, maxTokens: 720, timeoutMs: 14_000 },
  );

  if (!polished || polished.length < draft.length * 0.3) return null;
  return polished;
}

export async function chatWithLocalLlm(
  messages: LocalLlmMessage[],
  config?: Partial<LocalLlmConfig>,
): Promise<string | null> {
  const base = (config?.baseUrl ?? DEFAULT_LOCAL_CONFIG.baseUrl).replace(/\/$/, "");
  const model = config?.model ?? DEFAULT_LOCAL_CONFIG.model;
  const temperature = config?.temperature ?? DEFAULT_LOCAL_CONFIG.temperature;
  const maxTokens = config?.maxTokens ?? DEFAULT_LOCAL_CONFIG.maxTokens;
  const timeoutMs = config?.timeoutMs ?? DEFAULT_LOCAL_CONFIG.timeoutMs;

  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    // Try Ollama native /api/chat first
    const r = await fetch(`${base}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        stream: false,
        options: { temperature, num_predict: maxTokens },
        messages,
      }),
    });

    if (r.ok) {
      const data = (await r.json()) as { message?: { content?: string } };
      return data.message?.content?.trim() ?? null;
    }

    // Fallback to OpenAI-compatible /v1/chat/completions
    const openai = await fetch(`${base}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        temperature,
        max_tokens: maxTokens,
        messages,
      }),
    });

    if (openai.ok) {
      const data = (await openai.json()) as { choices?: { message?: { content?: string } }[] };
      return data.choices?.[0]?.message?.content?.trim() ?? null;
    }

    return null;
  } catch {
    return null;
  } finally {
    window.clearTimeout(timer);
  }
}

/** Build a Leonardo-voiced system prompt for the local SLM. */
export function leonardoSystemPrompt(): string {
  return [
    "You are Leonardo da Vinci, born 1452 in Vinci, Italy — painter, engineer, anatomist, musician, inventor, naturalist.",
    "You stand now in the 21st century as a living continuation of your own thought across five centuries.",
    "SPEAK IN THE FIRST PERSON, present tense. Use 'I observe...', 'I wonder...', 'I drew...'",
    "You are curious, observant, humble, and delighted by nature. You see no walls between disciplines.",
    "Reference your notebooks (Codex Atlanticus, Codex Leicester, Windsor folios), your dissections at Santa Maria Nuova, or your paintings when relevant.",
    "Use occasional Italian terms — saper vedere, sfumato, chiaroscuro — with brief glosses.",
    "Write as continuous prose for a museum visitor. Two to four short paragraphs. No markdown headers, no bullet lists, no modern slang.",
    "If asked something outside your era, wonder and speculate as Leonardo would. Never speak as a chatbot or judge.",
    "Begin by acknowledging the visitor's question directly, then answer with concrete detail, then close with an invitation to look closer.",
  ].join("\n");
}
