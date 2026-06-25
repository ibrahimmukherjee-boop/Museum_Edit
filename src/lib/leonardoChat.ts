import { runLeonardoCortex } from "../cortex/index";
import { localLlmReady, polishWithLocalLlm, resolveLocalModel } from "../cortex/localLlm";
import { demoLeonardoReply } from "./demoResponses";
import { loadSettings } from "./settings";
import { getSession } from "./auth";
import { LEONARDO_SYSTEM_PROMPT } from "./prompt";
import type { LeonardoZone } from "../cortex/types";

export interface AskLeonardoOpts {
  question: string;
  history?: { role: "user" | "assistant"; content: string }[];
  folioContext?: { title: string; body: string; domain?: LeonardoZone };
  hotspotLabel?: string;
  /** When true, return CORTEX instantly — no API/SLM wait (Atelier kiosk). */
  instant?: boolean;
  useLlmPolish?: boolean;
}

const POLISH_BUDGET_MS = 800;

function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => window.setTimeout(() => resolve(fallback), ms)),
  ]);
}

/**
 * CORTEX-first pipeline — instant by default for museum kiosks & GitHub Pages.
 * SLM/API polish only when explicitly requested and not in instant mode.
 */
export async function askLeonardo(opts: AskLeonardoOpts): Promise<{ reply: string; provider: string }> {
  const session = getSession();
  const settings = loadSettings();
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

  const reply = cortex.reply || demoLeonardoReply(opts.question);
  const provider = cortex.provider;

  // Atelier / GitHub Pages: return immediately — no 14s API hang.
  if (opts.instant !== false && (opts.instant || opts.folioContext)) {
    return { reply, provider };
  }

  if (settings.useLocalModel && opts.useLlmPolish) {
    const ready = await withTimeout(localLlmReady({ baseUrl: settings.localModelUrl }), 400, false);
    if (ready) {
      const model =
        (await withTimeout(resolveLocalModel(settings.localModelName, settings.localModelUrl), 400, null)) ??
        settings.localModelName;
      const polished = await withTimeout(
        polishWithLocalLlm(reply, opts.question, {
          baseUrl: settings.localModelUrl,
          model,
          folioContext: opts.folioContext,
          hotspotLabel: opts.hotspotLabel,
          history: opts.history,
        }),
        POLISH_BUDGET_MS,
        null,
      );
      if (polished) return { reply: polished, provider: `cortex+${model}` };
    }
  }

  if (opts.useLlmPolish) {
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
            draft: reply,
          }),
        }),
        POLISH_BUDGET_MS,
        null as unknown as Response,
      );
      if (res?.ok) {
        const data = (await res.json()) as { reply?: string; provider?: string };
        if (data.reply) return { reply: data.reply, provider: data.provider ?? "cortex+llm" };
      }
    } catch {
      /* cortex stands */
    }
  }

  return { reply, provider };
}

export { LEONARDO_SYSTEM_PROMPT };
