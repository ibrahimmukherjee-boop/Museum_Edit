import { runLeonardoCortex } from "../cortex/index";
import { getSession } from "./auth";
import { LEONARDO_SYSTEM_PROMPT } from "./prompt";
import type { LeonardoZone } from "../cortex/types";

export interface AskLeonardoOpts {
  question: string;
  history?: { role: "user" | "assistant"; content: string }[];
  folioContext?: { title: string; body: string; domain?: LeonardoZone };
  hotspotLabel?: string;
  useLlmPolish?: boolean;
}

export async function askLeonardo(opts: AskLeonardoOpts): Promise<{ reply: string; provider: string }> {
  const session = getSession();
  const memory = {
    sessionId: session?.sessionId ?? "anon",
    visitorName: session?.name ?? "Guest",
    workingMemory: opts.history?.slice(-4).map((h) => h.content) ?? [],
    folioId: opts.folioContext?.title,
    folioTitle: opts.folioContext?.title,
  };

  const cortex = runLeonardoCortex({
    question: opts.question,
    history: opts.history ?? [],
    memory,
    folioContext: opts.folioContext,
    hotspotLabel: opts.hotspotLabel,
  });

  if (opts.useLlmPolish) {
    try {
      const res = await fetch("/api/leonardo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: opts.question,
          history: opts.history ?? [],
          folioContext: opts.folioContext,
          hotspotLabel: opts.hotspotLabel,
          memory,
          polish: true,
          draft: cortex.reply,
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as { reply?: string; provider?: string };
        if (data.reply) return { reply: data.reply, provider: data.provider ?? "cortex+llm" };
      }
    } catch {
      /* cortex fallback */
    }
  }

  try {
    const res = await fetch("/api/leonardo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: opts.question,
        history: opts.history ?? [],
        folioContext: opts.folioContext,
        hotspotLabel: opts.hotspotLabel,
        memory,
      }),
    });
    if (res.ok) {
      const data = (await res.json()) as { reply?: string; provider?: string };
      if (data.reply) return { reply: data.reply, provider: data.provider ?? "cortex" };
    }
  } catch {
    /* local cortex */
  }

  return { reply: cortex.reply, provider: cortex.provider };
}

export { LEONARDO_SYSTEM_PROMPT };
