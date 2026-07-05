import { sanitizeLeonardoReply } from "../cortex/corpusFilter";
import { demoLeonardoReply } from "./demoResponses";
import { getSession } from "./auth";
import type { LeonardoZone } from "../cortex/types";

export interface AskLeonardoOpts {
  question: string;
  history?: { role: "user" | "assistant"; content: string }[];
  folioContext?: { title: string; body: string; domain?: LeonardoZone };
  hotspotLabel?: string;
}

const API_BUDGET_MS = 90_000;

function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => window.setTimeout(() => resolve(fallback), ms)),
  ]);
}

/**
 * Server pipeline only: CORTEX draft → corpus-tuned SLM → one full reply.
 * No client-side CORTEX, no draft preview.
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

  try {
    const res = await withTimeout(
      fetch("/api/leonardo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: opts.question,
          history: opts.history ?? [],
          folioContext: opts.folioContext,
          hotspotLabel: opts.hotspotLabel,
          memory,
          polish: true,
        }),
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
  } catch {
    /* demo fallback */
  }

  return {
    reply: sanitizeLeonardoReply(demoLeonardoReply(opts.question), opts.question),
    provider: "demo",
  };
}

export { LEONARDO_SYSTEM_PROMPT } from "./prompt";
