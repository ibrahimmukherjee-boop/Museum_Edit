/** Self-hosted SLM polish via Ollama (no external API rate limits). */
export interface OllamaPolishOptions {
  baseUrl?: string;
  model?: string;
  timeoutMs?: number;
  corpusContext?: string;
}

const DEFAULT_BASE = "http://127.0.0.1:11434";
const DEFAULT_MODEL = process.env.OLLAMA_MODEL ?? "glm-5.2:cloud";

const MODEL_CANDIDATES = [
  "glm-5.2:cloud",
  "glm-5.2",
  "glm4:9b",
  "qwen2.5:7b-instruct-q4_K_M",
  "qwen2.5:3b",
];

export async function polishWithOllama(
  draft: string,
  systemPrompt: string,
  opts: OllamaPolishOptions = {},
): Promise<string | null> {
  const baseUrl = (opts.baseUrl ?? process.env.OLLAMA_BASE_URL ?? DEFAULT_BASE).replace(/\/$/, "");
  const model = opts.model ?? process.env.OLLAMA_MODEL ?? DEFAULT_MODEL;
  const timeoutMs = opts.timeoutMs ?? 120_000;

  const corpusBlock = opts.corpusContext
    ? `\nCORPUS (preserve these facts in your rewrite):\n${opts.corpusContext}\n`
    : "";

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const r = await fetch(`${baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        stream: false,
        options: { temperature: 0.75, num_predict: 500 },
        messages: [
          {
            role: "system",
            content:
              systemPrompt +
              "\nYou POLISH a CORTEX draft — you do not invent new facts. Keep every fact from the DRAFT and CORPUS." +
              "\nRewrite as Leonardo da Vinci in first person (I/me/my), present tense. Never quote the visitor's question in quotation marks." +
              "\nNever say 'worthy thread', 'You ask', or 'You stand in my workshop'. No markdown. Two to three short paragraphs." +
              "\nUse dry wit and specific wonder — never chatbot enthusiasm." +
              corpusBlock,
          },
          { role: "user", content: `DRAFT TO POLISH:\n${draft}` },
        ],
      }),
    });
    if (!r.ok) return null;
    const data = (await r.json()) as { message?: { content?: string } };
    return data.message?.content?.trim() ?? null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function ollamaReady(baseUrl?: string): Promise<boolean> {
  const base = (baseUrl ?? process.env.OLLAMA_BASE_URL ?? DEFAULT_BASE).replace(/\/$/, "");
  try {
    const r = await fetch(`${base}/api/tags`, { signal: AbortSignal.timeout(5000) });
    return r.ok;
  } catch {
    return false;
  }
}

export async function ensureOllamaModel(
  model?: string,
  baseUrl?: string,
): Promise<string> {
  const base = (baseUrl ?? process.env.OLLAMA_BASE_URL ?? DEFAULT_BASE).replace(/\/$/, "");
  const preferred = model ?? process.env.OLLAMA_MODEL ?? DEFAULT_MODEL;

  const tags = await fetch(`${base}/api/tags`);
  if (tags.ok) {
    const data = (await tags.json()) as { models?: { name: string }[] };
    const installed = data.models?.map((m) => m.name) ?? [];
    for (const c of [preferred, ...MODEL_CANDIDATES]) {
      const hit = installed.find((m) => m === c || m.startsWith(`${c.split(":")[0]}:`));
      if (hit) return hit;
    }
  }

  for (const name of [preferred, ...MODEL_CANDIDATES]) {
    try {
      console.log(`[ollama] pulling model ${name}…`);
      const pull = await fetch(`${base}/api/pull`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, stream: false }),
      });
      if (pull.ok) {
        await pull.json();
        console.log(`[ollama] model ${name} ready`);
        return name;
      }
    } catch {
      /* try next */
    }
  }
  throw new Error("Ollama model pull failed — set OLLAMA_MODEL or run ollama login for glm-5.2:cloud");
}
