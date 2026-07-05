import { runLeonardoCortex } from "../cortex/index";
import { sanitizeLeonardoReply } from "../cortex/corpusFilter";
import { demoLeonardoReply } from "./demoResponses";
import { getSession } from "./auth";
import type { LeonardoZone } from "../cortex/types";

export interface AskLeonardoOpts {
  question: string;
  history?: { role: "user" | "assistant"; content: string }[];
  folioContext?: { title: string; body: string; domain?: LeonardoZone };
  hotspotLabel?: string;
  /** Called immediately with CORTEX draft (~instant). */
  onDraft?: (draft: string) => void;
  /** Called as SLM streams tokens (optional). */
  onToken?: (chunk: string, full: string) => void;
}

const STREAM_BUDGET_MS = 60_000;

function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => window.setTimeout(() => resolve(fallback), ms)),
  ]);
}

/**
 * Always: CORTEX draft (instant preview) → corpus-tuned SLM polish on EC2.
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

  const cortex = runLeonardoCortex({
    question: opts.question,
    history: opts.history ?? [],
    memory,
    folioContext: opts.folioContext,
    hotspotLabel: opts.hotspotLabel,
  });

  const draft = sanitizeLeonardoReply(cortex.reply || demoLeonardoReply(opts.question), opts.question);
  opts.onDraft?.(draft);

  try {
    const result = await withTimeout(
      streamLeonardoFromApi(opts, memory, draft),
      STREAM_BUDGET_MS,
      null,
    );
    if (result) return result;
  } catch {
    /* fallback below */
  }

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
      STREAM_BUDGET_MS,
      null as unknown as Response,
    );
    if (res?.ok) {
      const data = (await res.json()) as { reply?: string; provider?: string };
      if (data.reply?.trim()) {
        return {
          reply: sanitizeLeonardoReply(data.reply, opts.question),
          provider: data.provider ?? "cortex+leonardo-museum",
        };
      }
    }
  } catch {
    /* fall through */
  }

  return { reply: draft, provider: "cortex+fallback" };
}

async function streamLeonardoFromApi(
  opts: AskLeonardoOpts,
  memory: Record<string, unknown>,
  draft: string,
): Promise<{ reply: string; provider: string } | null> {
  const res = await fetch("/api/leonardo/stream", {
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
  });
  if (!res.ok || !res.body) return null;

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  let full = "";
  let provider = "cortex+leonardo-museum";
  let reply = draft;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const parts = buf.split("\n\n");
    buf = parts.pop() ?? "";
    for (const part of parts) {
      const line = part.replace(/^data:\s*/, "").trim();
      if (!line) continue;
      try {
        const ev = JSON.parse(line) as {
          type: string;
          reply?: string;
          provider?: string;
          text?: string;
        };
        if (ev.type === "draft" && ev.reply) {
          opts.onDraft?.(ev.reply);
          full = ev.reply;
        } else if (ev.type === "token" && ev.text) {
          full += ev.text;
          opts.onToken?.(ev.text, full);
        } else if (ev.type === "done") {
          reply = ev.reply ?? full;
          provider = ev.provider ?? provider;
        }
      } catch {
        /* skip */
      }
    }
  }

  if (reply && reply !== draft) {
    return { reply: sanitizeLeonardoReply(reply, opts.question), provider };
  }
  if (full.length > draft.length) {
    return { reply: sanitizeLeonardoReply(full, opts.question), provider };
  }
  return null;
}

export { LEONARDO_SYSTEM_PROMPT } from "./prompt";
