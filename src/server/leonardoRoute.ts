import { runLeonardoCortex } from "../cortex/index";
import { buildLeonardoPolishContext } from "../cortex/polishContext";
import { sanitizeLeonardoReply } from "../cortex/corpusFilter";
import { polishDraft, polishProviderLabel } from "../cortex/polish";
import { polishWithOllamaStream } from "../cortex/ollama";
import { LEONARDO_SYSTEM_PROMPT } from "../lib/prompt";
import type { CortexInput } from "../cortex/types";

export type LeonardoRequestBody = CortexInput & {
  polish?: boolean;
  draft?: string;
  memory?: CortexInput["memory"];
  stream?: boolean;
};

export type LeonardoStreamEvent =
  | { type: "draft"; reply: string; provider: string }
  | { type: "token"; text: string }
  | { type: "done"; reply: string; provider: string }
  | { type: "error"; message: string };

/** CORTEX draft → corpus-tuned SLM polish (always on unless polish:false). */
export async function handleLeonardoRequest(body: LeonardoRequestBody) {
  if (!body?.question?.trim()) {
    return { status: 400 as const, error: "No question" };
  }

  const input: CortexInput = {
    question: body.question,
    history: body.history ?? [],
    memory: body.memory ?? { sessionId: "api", visitorName: "Guest", workingMemory: [] },
    folioContext: body.folioContext,
    hotspotLabel: body.hotspotLabel,
  };

  const cortex = runLeonardoCortex(input);
  let reply = sanitizeLeonardoReply(body.draft ?? cortex.reply, input.question);
  let provider = "cortex";

  const shouldPolish = body.polish !== false;

  if (shouldPolish) {
    const zone = cortex.trace.zone;
    const corpusContext = buildLeonardoPolishContext(input.question, zone, 5);
    const polished = await polishDraft(
      reply,
      LEONARDO_SYSTEM_PROMPT,
      corpusContext,
      input.question,
    );
    if (polished?.text) {
      reply = sanitizeLeonardoReply(polished.text, input.question);
      provider = polishProviderLabel(polished.provider, polished.model);
    } else {
      console.warn("[leonardo] SLM polish failed — retrying once");
      const retry = await polishDraft(reply, LEONARDO_SYSTEM_PROMPT, corpusContext, input.question);
      if (retry?.text) {
        reply = sanitizeLeonardoReply(retry.text, input.question);
        provider = polishProviderLabel(retry.provider, retry.model);
      } else {
        console.warn("[leonardo] SLM unavailable after retry — CORTEX draft only");
        provider = "cortex+fallback";
      }
    }
  }

  reply = sanitizeLeonardoReply(reply, input.question);

  return {
    status: 200 as const,
    reply,
    provider,
    trace: cortex.trace,
  };
}

/** SSE: emit CORTEX draft immediately, then stream SLM polish tokens. */
export async function* handleLeonardoStream(
  body: LeonardoRequestBody,
): AsyncGenerator<LeonardoStreamEvent> {
  if (!body?.question?.trim()) {
    yield { type: "error", message: "No question" };
    return;
  }

  const input: CortexInput = {
    question: body.question,
    history: body.history ?? [],
    memory: body.memory ?? { sessionId: "api", visitorName: "Guest", workingMemory: [] },
    folioContext: body.folioContext,
    hotspotLabel: body.hotspotLabel,
  };

  const cortex = runLeonardoCortex(input);
  const draft = sanitizeLeonardoReply(body.draft ?? cortex.reply, input.question);
  yield { type: "draft", reply: draft, provider: "cortex" };

  if (body.polish === false) {
    yield { type: "done", reply: draft, provider: "cortex" };
    return;
  }

  const zone = cortex.trace.zone;
  const corpusContext = buildLeonardoPolishContext(input.question, zone, 5);
  let full = "";
  const stream = polishWithOllamaStream(draft, LEONARDO_SYSTEM_PROMPT, {
    corpusContext,
    question: input.question,
  });

  let model = "leonardo-museum";
  while (true) {
    const next = await stream.next();
    if (next.done) {
      model = next.value?.model ?? model;
      break;
    }
    full += next.value;
    yield { type: "token", text: next.value };
  }

  if (!full.trim()) {
    const fallback = await polishDraft(draft, LEONARDO_SYSTEM_PROMPT, corpusContext, input.question);
    if (fallback?.text) {
      full = fallback.text;
      model = fallback.model ?? model;
    } else {
      full = draft;
      model = "cortex+fallback";
    }
  }

  const reply = sanitizeLeonardoReply(full, input.question);
  const provider = model.includes("cortex") ? model : `cortex+${model}`;
  yield { type: "done", reply, provider };
}
