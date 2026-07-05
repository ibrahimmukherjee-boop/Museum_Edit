import { sanitizeLeonardoReply } from "../cortex/corpusFilter";
import { demoLeonardoReply } from "./demoResponses";
import { getSession } from "./auth";
import type { LeonardoZone } from "../cortex/types";

export interface AskLeonardoOpts {
  question: string;
  history?: { role: "user" | "assistant"; content: string }[];
  folioContext?: { title: string; body: string; domain?: LeonardoZone };
  hotspotLabel?: string;
  /** Called when SLM begins streaming tokens (CORTEX draft is ready). */
  onSlmStart?: () => void;
  /** Called for each SLM token as it is generated. */
  onToken?: (chunk: string) => void;
}

const API_BUDGET_MS = 120_000;

function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => window.setTimeout(() => resolve(fallback), ms)),
  ]);
}

async function readLeonardoStream(
  res: Response,
  opts: AskLeonardoOpts,
): Promise<{ reply: string; provider: string }> {
  const reader = res.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let buf = "";
  let reply = "";
  let provider = "cortex+leonardo-museum";
  let slmStarted = false;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const parts = buf.split("\n\n");
    buf = parts.pop() ?? "";

    for (const part of parts) {
      const line = part.trim();
      if (!line.startsWith("data: ")) continue;
      let ev: { type?: string; text?: string; reply?: string; provider?: string; message?: string };
      try {
        ev = JSON.parse(line.slice(6));
      } catch {
        continue;
      }

      if (ev.type === "slm_start" && !slmStarted) {
        slmStarted = true;
        opts.onSlmStart?.();
      } else if (ev.type === "token" && ev.text) {
        if (!slmStarted) {
          slmStarted = true;
          opts.onSlmStart?.();
        }
        reply += ev.text;
        opts.onToken?.(ev.text);
      } else if (ev.type === "done") {
        reply = ev.reply ?? reply;
        provider = ev.provider ?? provider;
      } else if (ev.type === "error") {
        throw new Error(ev.message ?? "Stream error");
      }
    }
  }

  return {
    reply: sanitizeLeonardoReply(reply, opts.question),
    provider,
  };
}

/**
 * CORTEX → streaming SLM polish. Tokens appear via onToken as soon as the model generates them.
 */
export async function askLeonardo(opts: AskLeonardoOpts): Promise<{ reply: string; provider: string }> {
  const session = getSession();
  const memory = {
    sessionId: session?.sessionId ?? "anon",
    visitorName: session?.name ?? "Guest",
    workingMemory: opts.history?.slice(-4).map((h) => h.content) ?? [],
    folioId: opts.folioContext?.title,
    folioTitle: opts.folioContext?.title,
  };

  const payload = {
    question: opts.question,
    history: opts.history ?? [],
    folioContext: opts.folioContext,
    hotspotLabel: opts.hotspotLabel,
    memory,
    polish: true,
  };

  const useStream = Boolean(opts.onToken || opts.onSlmStart);

  try {
    if (useStream) {
      const res = await withTimeout(
        fetch("/api/leonardo/stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }),
        API_BUDGET_MS,
        null as unknown as Response,
      );
      if (res?.ok && res.body) {
        return await readLeonardoStream(res, opts);
      }
    } else {
      const res = await withTimeout(
        fetch("/api/leonardo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }),
        API_BUDGET_MS,
        null as unknown as Response,
      );
      if (res?.ok) {
        const data = (await res.json()) as { reply?: string; provider?: string };
        const reply = data.reply?.trim();
        if (reply) {
          return {
            reply: sanitizeLeonardoReply(reply, opts.question),
            provider: data.provider ?? "cortex+leonardo-museum",
          };
        }
      }
    }
  } catch {
    /* demo fallback */
  }

  return {
    reply: sanitizeLeonardoReply(demoLeonardoReply(opts.question), opts.question),
    provider: "demo",
  };
}

export { LEONARDO_SYSTEM_PROMPT } from "./prompt";
