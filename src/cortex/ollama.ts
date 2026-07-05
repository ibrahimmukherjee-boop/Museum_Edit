/** Self-hosted SLM — corpus-tuned leonardo-museum model via Ollama Modelfile. */
import { buildLeonardoModelfile, LEONARDO_BASE_MODEL, LEONARDO_OLLAMA_MODEL } from "./leonardoModel";

export interface OllamaPolishOptions {
  baseUrl?: string;
  model?: string;
  timeoutMs?: number;
  corpusContext?: string;
  question?: string;
  stream?: boolean;
}

const DEFAULT_BASE = "http://127.0.0.1:11434";
const DEFAULT_MODEL = process.env.OLLAMA_MODEL ?? LEONARDO_OLLAMA_MODEL;

const LOCAL_MODEL_CANDIDATES = [
  LEONARDO_OLLAMA_MODEL,
  "qwen2.5:0.5b",
  "qwen2.5:1.5b",
  "qwen2.5:3b",
];
const CLOUD_MODEL_CANDIDATES = ["glm-5.2:cloud", "glm-5.2"];
const MODEL_CANDIDATES = [...LOCAL_MODEL_CANDIDATES, ...CLOUD_MODEL_CANDIDATES];

const POLISH_OPTIONS = { temperature: 0.65, num_predict: 120, num_ctx: 1536, top_p: 0.9 };

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
    const hit = installed.find((m) => m === c || m.startsWith(`${c}:`) || m.startsWith(`${c}`));
    if (hit && !out.includes(hit)) out.push(hit);
  }
  for (const c of ordered) {
    if (!out.some((m) => m === c || m.startsWith(`${c}:`))) out.push(c);
  }
  return out;
}

function polishUserMessage(draft: string, question?: string): string {
  const q = question?.trim() ? `Visitor asks: "${question.trim()}"\n` : "";
  return `${q}Polish this CORTEX draft in Leonardo's voice. Keep every fact. Two short paragraphs.\n\nDRAFT:\n${draft}`;
}

function polishSystemSuffix(corpusContext?: string, question?: string): string {
  const parts = [
    "You POLISH a CORTEX draft — do not invent facts. First person, present tense.",
    "Answer directly in sentence one. Never say Leonardo's humour or speak in third person.",
  ];
  if (corpusContext) parts.push(`Extra context:\n${corpusContext.slice(0, 600)}`);
  if (question) parts.push(`Question: ${question}`);
  return parts.join("\n");
}

async function pullModel(base: string, name: string): Promise<boolean> {
  try {
    console.log(`[ollama] pulling ${name}…`);
    const pull = await fetch(`${base}/api/pull`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, stream: false }),
      signal: AbortSignal.timeout(600_000),
    });
    if (!pull.ok) return false;
    await pull.json();
    return true;
  } catch {
    return false;
  }
}

/** Create leonardo-museum from qwen2.5:0.5b + corpus SYSTEM (runs on EC2 at boot). */
export async function ensureLeonardoCorpusModel(baseUrlArg?: string): Promise<string> {
  const base = (baseUrlArg ?? process.env.OLLAMA_BASE_URL ?? DEFAULT_BASE).replace(/\/$/, "");
  const installed = await listInstalledModels(base);
  const hasLeonardo = installed.some((m) => m.startsWith(LEONARDO_OLLAMA_MODEL));
  if (hasLeonardo) {
    activeModel = installed.find((m) => m.startsWith(LEONARDO_OLLAMA_MODEL))!;
    return activeModel;
  }

  const baseName = LEONARDO_BASE_MODEL;
  if (!installed.some((m) => m.startsWith(baseName))) {
    await pullModel(base, baseName);
  }

  const modelfile = buildLeonardoModelfile(baseName);
  console.log(`[ollama] creating corpus-tuned ${LEONARDO_OLLAMA_MODEL} from ${baseName}…`);
  const create = await fetch(`${base}/api/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: LEONARDO_OLLAMA_MODEL, modelfile, stream: false }),
    signal: AbortSignal.timeout(300_000),
  });
  if (!create.ok) {
    const err = await create.text().catch(() => "");
    console.warn(`[ollama] create ${LEONARDO_OLLAMA_MODEL} failed: ${err.slice(0, 300)}`);
    activeModel = baseName;
    return baseName;
  }
  await create.json();
  activeModel = LEONARDO_OLLAMA_MODEL;
  console.log(`[ollama] corpus model ready: ${LEONARDO_OLLAMA_MODEL}`);
  return LEONARDO_OLLAMA_MODEL;
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
        options: POLISH_OPTIONS,
        messages: [
          { role: "system", content: systemContent },
          { role: "user", content: userContent },
        ],
      }),
    });
    if (!r.ok) return null;
    const data = (await r.json()) as { message?: { content?: string }; error?: string };
    if (data.error) return null;
    return data.message?.content?.trim() || null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** Stream polish tokens for low perceived latency. */
export async function* polishWithOllamaStream(
  draft: string,
  systemPrompt: string,
  opts: OllamaPolishOptions = {},
): AsyncGenerator<string, { model: string } | null, unknown> {
  const base = baseUrl(opts);
  const preferred = opts.model ?? process.env.OLLAMA_MODEL ?? DEFAULT_MODEL;
  const installed = await listInstalledModels(base);
  const candidates = resolveCandidate(preferred, installed);
  const systemContent = systemPrompt + "\n" + polishSystemSuffix(opts.corpusContext, opts.question);
  const userContent = polishUserMessage(draft, opts.question);

  for (const model of candidates) {
    try {
      const r = await fetch(`${base}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          stream: true,
          options: POLISH_OPTIONS,
          messages: [
            { role: "system", content: systemContent },
            { role: "user", content: userContent },
          ],
        }),
      });
      if (!r.ok || !r.body) continue;

      const reader = r.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const j = JSON.parse(line) as { message?: { content?: string }; done?: boolean };
            const tok = j.message?.content;
            if (tok) yield tok;
          } catch {
            /* skip */
          }
        }
      }
      activeModel = model;
      return { model };
    } catch {
      continue;
    }
  }
  return null;
}

export async function polishWithOllama(
  draft: string,
  systemPrompt: string,
  opts: OllamaPolishOptions = {},
): Promise<{ text: string; model: string } | null> {
  const base = baseUrl(opts);
  const preferred = opts.model ?? process.env.OLLAMA_MODEL ?? DEFAULT_MODEL;
  const timeoutMs = opts.timeoutMs ?? 45_000;
  const systemContent = systemPrompt + "\n" + polishSystemSuffix(opts.corpusContext, opts.question);
  const userContent = polishUserMessage(draft, opts.question);
  const installed = await listInstalledModels(base);
  const candidates = resolveCandidate(preferred, installed);

  for (const model of candidates) {
    const text = await chatOnce(base, model, systemContent, userContent, timeoutMs);
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

export async function ensureOllamaModel(model?: string, baseUrlArg?: string): Promise<string> {
  await ensureLeonardoCorpusModel(baseUrlArg);
  const base = (baseUrlArg ?? process.env.OLLAMA_BASE_URL ?? DEFAULT_BASE).replace(/\/$/, "");
  const preferred = model ?? process.env.OLLAMA_MODEL ?? LEONARDO_OLLAMA_MODEL;
  const installed = await listInstalledModels(base);
  const candidates = resolveCandidate(preferred, installed);

  for (const name of candidates) {
    const probe = await chatOnce(base, name, "OK", "ping", 45_000);
    if (probe) {
      activeModel = name;
      console.log(`[ollama] active model: ${name}`);
      return name;
    }
  }
  for (const name of LOCAL_MODEL_CANDIDATES) {
    if (!installed.some((m) => m.startsWith(name))) await pullModel(base, name);
    const probe = await chatOnce(base, name, "OK", "ping", 45_000);
    if (probe) {
      activeModel = name;
      return name;
    }
  }
  throw new Error("Ollama: no working model");
}

export async function warmupOllamaModel(baseUrlArg?: string, model?: string): Promise<void> {
  const base = (baseUrlArg ?? process.env.OLLAMA_BASE_URL ?? DEFAULT_BASE).replace(/\/$/, "");
  const name = model ?? activeModel ?? process.env.OLLAMA_MODEL ?? DEFAULT_MODEL;
  try {
    await chatOnce(base, name, "OK", "warmup", 60_000);
    console.log(`[ollama] warmup complete: ${name}`);
  } catch {
    console.warn(`[ollama] warmup skipped for ${name}`);
  }
}

export function startOllamaKeepalive(intervalMs = 90_000): void {
  if (!process.env.OLLAMA_BASE_URL && process.env.USE_OLLAMA !== "1") return;
  const base = (process.env.OLLAMA_BASE_URL ?? DEFAULT_BASE).replace(/\/$/, "");
  setInterval(async () => {
    const name = activeModel ?? process.env.OLLAMA_MODEL ?? DEFAULT_MODEL;
    try {
      await chatOnce(base, name, "OK", "ping", 15_000);
    } catch {
      /* ignore */
    }
  }, intervalMs);
  console.log(`[ollama] keepalive every ${intervalMs / 1000}s`);
}
