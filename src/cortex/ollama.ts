/** Self-hosted SLM polish via Ollama (local quant models; cloud optional). */
export interface OllamaPolishOptions {
  baseUrl?: string;
  model?: string;
  timeoutMs?: number;
  corpusContext?: string;
  question?: string;
}

const DEFAULT_BASE = "http://127.0.0.1:11434";
/** Local quant models run reliably on t3.large without cloud auth. */
const DEFAULT_MODEL = process.env.OLLAMA_MODEL ?? "qwen2.5:3b";

/** Prefer local models — glm-5.2:cloud needs `ollama login` and often returns Unauthorized. */
const LOCAL_MODEL_CANDIDATES = ["qwen2.5:3b", "qwen2.5:7b-instruct-q4_K_M", "glm4:9b"];
const CLOUD_MODEL_CANDIDATES = ["glm-5.2:cloud", "glm-5.2"];
const MODEL_CANDIDATES = [...LOCAL_MODEL_CANDIDATES, ...CLOUD_MODEL_CANDIDATES];

let activeModel: string | null = null;

export function getActiveOllamaModel(): string | null {
  return activeModel;
}

function baseUrl(opts?: OllamaPolishOptions): string {
  return (opts?.baseUrl ?? process.env.OLLAMA_BASE_URL ?? DEFAULT_BASE).replace(/\/$/, "");
}

async function listInstalledModels(base: string): Promise<string[]> {
  try {
    const r = await fetch(`${base}/api/tags`, { signal: AbortSignal.timeout(8000) });
    if (!r.ok) return [];
    const data = (await r.json()) as { models?: { name: string }[] };
    return data.models?.map((m) => m.name) ?? [];
  } catch {
    return [];
  }
}

function resolveCandidate(preferred: string, installed: string[]): string[] {
  const ordered = [preferred, ...MODEL_CANDIDATES.filter((m) => m !== preferred)];
  const out: string[] = [];
  for (const c of ordered) {
    const hit = installed.find((m) => m === c || m.startsWith(`${c.split(":")[0]}:`));
    if (hit && !out.includes(hit)) out.push(hit);
  }
  for (const c of ordered) {
    if (!out.includes(c)) out.push(c);
  }
  return out;
}

async function chatOnce(
  base: string,
  model: string,
  systemContent: string,
  userContent: string,
  timeoutMs: number,
): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const r = await fetch(`${base}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        stream: false,
        options: { temperature: 0.75, num_predict: 220, num_ctx: 2048 },
        messages: [
          { role: "system", content: systemContent },
          { role: "user", content: userContent },
        ],
      }),
    });
    if (!r.ok) {
      const err = await r.text().catch(() => "");
      if (/unauthorized/i.test(err)) console.warn(`[ollama] ${model}: unauthorized (cloud login required)`);
      return null;
    }
    const data = (await r.json()) as { message?: { content?: string }; error?: string };
    if (data.error) return null;
    const text = data.message?.content?.trim();
    return text || null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function polishWithOllama(
  draft: string,
  systemPrompt: string,
  opts: OllamaPolishOptions = {},
): Promise<{ text: string; model: string } | null> {
  const base = baseUrl(opts);
  const preferred = opts.model ?? process.env.OLLAMA_MODEL ?? DEFAULT_MODEL;
  const timeoutMs = opts.timeoutMs ?? 120_000; // EC2 cold-start polish can exceed 90s

  const corpusBlock = opts.corpusContext
    ? `\nCORPUS (personality + facts — preserve meaning, never quote labels or meta-text):\n${opts.corpusContext}\n`
    : "";

  const questionBlock = opts.question?.trim()
    ? `\nThe visitor asks: "${opts.question.trim()}"\nAnswer this question directly in your first sentence.\n`
    : "";

  const systemContent =
    systemPrompt +
    "\nYou POLISH a CORTEX draft — you do not invent new facts. Keep every fact from the DRAFT and CORPUS." +
    "\nRewrite as Leonardo da Vinci speaking directly to a museum visitor." +
    "\nAnswer the question directly in the first sentence. First person (I/me/my), present tense." +
    "\nNever quote the visitor's question. Never mention Polymath, dissertations, SPEAKER labels, or Personality briefs." +
    "\nNever say 'Leonardo's humour' or speak about yourself in third person." +
    "\nTwo short paragraphs, plain language. Use dry wit — never chatbot enthusiasm." +
    corpusBlock +
    questionBlock;

  const installed = await listInstalledModels(base);
  const candidates = resolveCandidate(preferred, installed);

  for (const model of candidates) {
    const text = await chatOnce(base, model, systemContent, `DRAFT TO POLISH:\n${draft}`, timeoutMs);
    if (text) {
      activeModel = model;
      return { text, model };
    }
  }
  return null;
}

export async function ollamaReady(baseUrlArg?: string): Promise<boolean> {
  const base = (baseUrlArg ?? process.env.OLLAMA_BASE_URL ?? DEFAULT_BASE).replace(/\/$/, "");
  try {
    const r = await fetch(`${base}/api/tags`, { signal: AbortSignal.timeout(5000) });
    return r.ok;
  } catch {
    return false;
  }
}

/** Pull and verify a working local model at boot. */
export async function ensureOllamaModel(model?: string, baseUrlArg?: string): Promise<string> {
  const base = (baseUrlArg ?? process.env.OLLAMA_BASE_URL ?? DEFAULT_BASE).replace(/\/$/, "");
  const preferred = model ?? process.env.OLLAMA_MODEL ?? DEFAULT_MODEL;
  const installed = await listInstalledModels(base);
  const candidates = resolveCandidate(preferred, installed);

  for (const name of candidates) {
    const probe = await chatOnce(
      base,
      name,
      "Reply with the single word OK.",
      "ping",
      90_000,
    );
    if (probe) {
      activeModel = name;
      console.log(`[ollama] active model: ${name}`);
      return name;
    }
  }

  for (const name of [preferred, ...LOCAL_MODEL_CANDIDATES]) {
    try {
      console.log(`[ollama] pulling model ${name}…`);
      const pull = await fetch(`${base}/api/pull`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, stream: false }),
        signal: AbortSignal.timeout(600_000),
      });
      if (!pull.ok) continue;
      await pull.json();
      const probe = await chatOnce(base, name, "Reply OK.", "ping", 90_000);
      if (probe) {
        activeModel = name;
        console.log(`[ollama] model ${name} ready`);
        return name;
      }
    } catch {
      /* try next */
    }
  }
  throw new Error("Ollama: no working local model — set OLLAMA_MODEL=qwen2.5:3b");
}

/** Pre-load model weights so first visitor request is not a cold start. */
export async function warmupOllamaModel(baseUrlArg?: string, model?: string): Promise<void> {
  const base = (baseUrlArg ?? process.env.OLLAMA_BASE_URL ?? DEFAULT_BASE).replace(/\/$/, "");
  const name = model ?? activeModel ?? process.env.OLLAMA_MODEL ?? DEFAULT_MODEL;
  try {
    await chatOnce(base, name, "Reply OK.", "warmup", 90_000);
    console.log(`[ollama] warmup complete: ${name}`);
  } catch {
    console.warn(`[ollama] warmup skipped for ${name}`);
  }
}

/** Keep SLM loaded in memory between optional polish requests. */
export function startOllamaKeepalive(intervalMs = 4 * 60 * 1000): void {
  if (!process.env.OLLAMA_BASE_URL && process.env.USE_OLLAMA !== "1") return;
  const base = (process.env.OLLAMA_BASE_URL ?? DEFAULT_BASE).replace(/\/$/, "");
  setInterval(async () => {
    const name = activeModel ?? process.env.OLLAMA_MODEL ?? DEFAULT_MODEL;
    try {
      await chatOnce(base, name, "OK", "ping", 20_000);
    } catch {
      /* ignore */
    }
  }, intervalMs);
  console.log(`[ollama] keepalive every ${intervalMs / 1000}s`);
}
