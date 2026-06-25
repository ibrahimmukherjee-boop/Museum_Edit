/** Self-hosted SLM polish via Ollama (no external API rate limits). */
export interface OllamaPolishOptions {
  baseUrl?: string;
  model?: string;
  timeoutMs?: number;
}

const DEFAULT_BASE = "http://127.0.0.1:11434";
const DEFAULT_MODEL = "qwen2.5:3b";

export async function polishWithOllama(
  draft: string,
  systemPrompt: string,
  opts: OllamaPolishOptions = {},
): Promise<string | null> {
  const baseUrl = (opts.baseUrl ?? process.env.OLLAMA_BASE_URL ?? DEFAULT_BASE).replace(/\/$/, "");
  const model = opts.model ?? process.env.OLLAMA_MODEL ?? DEFAULT_MODEL;
  const timeoutMs = opts.timeoutMs ?? 120_000;

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
              "\nRewrite the DRAFT below as Leonardo da Vinci in first person. Keep all facts. No markdown. Two to three short paragraphs.",
          },
          { role: "user", content: `DRAFT:\n${draft}` },
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
): Promise<void> {
  const base = (baseUrl ?? process.env.OLLAMA_BASE_URL ?? DEFAULT_BASE).replace(/\/$/, "");
  const name = model ?? process.env.OLLAMA_MODEL ?? DEFAULT_MODEL;

  const tags = await fetch(`${base}/api/tags`);
  if (tags.ok) {
    const data = (await tags.json()) as { models?: { name: string }[] };
    const have = data.models?.some((m) => m.name === name || m.name.startsWith(`${name}:`));
    if (have) return;
  }

  console.log(`[ollama] pulling model ${name}…`);
  const pull = await fetch(`${base}/api/pull`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, stream: false }),
  });
  if (!pull.ok) throw new Error(`Ollama pull failed for ${name}`);
  await pull.json();
  console.log(`[ollama] model ${name} ready`);
}
