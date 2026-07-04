import { runLeonardoCortex } from "../cortex/index";
import { sanitizeLeonardoReply } from "../cortex/corpusFilter";
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
  /** When true, skip GLM polish (kiosk fast path). */
  instant?: boolean;
  useLlmPolish?: boolean;
}

const POLISH_BUDGET_MS = 45_000;

function isLocalDevHost(): boolean {
  if (typeof window === "undefined") return false;
  return /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname);
}

function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => window.setTimeout(() => resolve(fallback), ms)),
  ]);
}

/**
 * CORTEX draft → server GLM polish (EC2). Browser never calls localhost Ollama in production.
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

  const draft = sanitizeLeonardoReply(cortex.reply || demoLeonardoReply(opts.question), opts.question);

  if (opts.instant === true) {
    return { reply: draft, provider: cortex.provider };
  }

  const wantPolish = opts.useLlmPolish !== false;

  if (wantPolish) {
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
            draft,
          }),
        }),
        POLISH_BUDGET_MS,
        null as unknown as Response,
      );
      if (res?.ok) {
        const data = (await res.json()) as { reply?: string; provider?: string };
        if (data.reply?.trim()) {
          return {
            reply: sanitizeLeonardoReply(data.reply, opts.question),
            provider: data.provider ?? "cortex+glm-5.2:cloud",
          };
        }
      }
    } catch {
      /* fall through to draft */
    }
  }

  if (wantPolish && isLocalDevHost() && settings.useLocalModel) {
    const { localLlmReady, polishWithLocalLlm, resolveLocalModel } = await import("../cortex/localLlm");
    const ready = await withTimeout(localLlmReady({ baseUrl: settings.localModelUrl }), 800, false);
    if (ready) {
      const model =
        (await withTimeout(resolveLocalModel(settings.localModelName, settings.localModelUrl), 800, null)) ??
        settings.localModelName;
      const polished = await withTimeout(
        polishWithLocalLlm(draft, opts.question, {
          baseUrl: settings.localModelUrl,
          model,
          folioContext: opts.folioContext,
          hotspotLabel: opts.hotspotLabel,
          history: opts.history,
        }),
        POLISH_BUDGET_MS,
        null,
      );
      if (polished) {
        return {
          reply: sanitizeLeonardoReply(polished, opts.question),
          provider: `cortex+${model}`,
        };
      }
    }
  }

  return { reply: draft, provider: cortex.provider };
}

export { LEONARDO_SYSTEM_PROMPT };
