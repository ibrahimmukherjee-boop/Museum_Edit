import { runLeonardoCortex } from "../cortex/index";
import { buildLeonardoPolishContext } from "../cortex/polishContext";
import { hasPersonalityLeak, isSafeForVisitorText, sanitizeLeonardoReply } from "../cortex/corpusFilter";
import { polishDraft, polishProviderLabel } from "../cortex/polish";
import { polishWithOllamaStream, getActiveOllamaModel } from "../cortex/ollama";
import { polishPreservesDraft } from "../cortex/polishValidate";
import { LEONARDO_SYSTEM_PROMPT } from "../lib/prompt";
import type { CortexInput } from "../cortex/types";

export type LeonardoRequestBody = CortexInput & {
  polish?: boolean;
  draft?: string;
  memory?: CortexInput["memory"];
};

const SLM_FALLBACK_PROVIDER = "cortex+leonardo-museum:fallback";
const STREAM_GUARD_CHARS = 18;

export type LeonardoStreamEvent =
  | { type: "slm_start" }
  | { type: "token"; text: string }
  | { type: "done"; reply: string; provider: string }
  | { type: "error"; message: string };

function buildInput(body: LeonardoRequestBody): CortexInput {
  return {
    question: body.question,
    history: body.history ?? [],
    memory: body.memory ?? { sessionId: "api", visitorName: "Guest", workingMemory: [] },
    folioContext: body.folioContext,
    hotspotLabel: body.hotspotLabel,
  };
}

function isValidPolish(draft: string, polished: string, question: string): boolean {
  return (
    polished.length > 40 &&
    !hasPersonalityLeak(polished) &&
    isSafeForVisitorText(polished) &&
    polishPreservesDraft(draft, polished, question)
  );
}

async function polishCortexDraft(
  draft: string,
  question: string,
  zone: ReturnType<typeof runLeonardoCortex>["trace"]["zone"],
): Promise<{ reply: string; provider: string } | null> {
  const corpusContext = buildLeonardoPolishContext(question, zone, 3);
  const polished = await polishDraft(draft, LEONARDO_SYSTEM_PROMPT, corpusContext, question);
  if (!polished?.text) return null;
  const text = sanitizeLeonardoReply(polished.text, question);
  if (!isValidPolish(draft, text, question)) return null;
  return {
    reply: text,
    provider: polishProviderLabel(polished.provider, polished.model),
  };
}

/** CORTEX draft → corpus-tuned SLM polish → one full reply. */
export async function handleLeonardoRequest(body: LeonardoRequestBody) {
  if (!body?.question?.trim()) {
    return { status: 400 as const, error: "No question" };
  }

  const input = buildInput(body);
  const cortex = runLeonardoCortex(input);
  const draft = sanitizeLeonardoReply(cortex.reply, input.question);
  let reply = draft;
  let provider = "cortex";

  if (body.polish !== false) {
    const polished = await polishCortexDraft(draft, input.question, cortex.trace.zone);
    if (polished) {
      reply = polished.reply;
      provider = polished.provider;
    } else {
      reply = draft;
      provider = SLM_FALLBACK_PROVIDER;
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

/** Stream SLM tokens — brief guard buffer, then live tokens. */
export async function* handleLeonardoStream(body: LeonardoRequestBody): AsyncGenerator<LeonardoStreamEvent> {
  if (!body?.question?.trim()) {
    yield { type: "error", message: "No question" };
    return;
  }

  const input = buildInput(body);
  const cortex = runLeonardoCortex(input);
  const draft = sanitizeLeonardoReply(cortex.reply, input.question);
  const corpusContext = buildLeonardoPolishContext(input.question, cortex.trace.zone, 3);

  if (body.polish === false) {
    yield { type: "done", reply: draft, provider: "cortex" };
    return;
  }

  yield { type: "slm_start" };

  let streamed = "";
  let emitted = "";
  const finish = (reply: string, provider: string) => ({ type: "done" as const, reply, provider });

  try {
    const stream = polishWithOllamaStream(draft, LEONARDO_SYSTEM_PROMPT, { corpusContext, question: input.question });

    for await (const tok of stream) {
      streamed += tok;

      if (hasPersonalityLeak(streamed)) {
        yield finish(draft, SLM_FALLBACK_PROVIDER);
        return;
      }

      if (emitted.length === 0 && streamed.length < STREAM_GUARD_CHARS) continue;

      if (emitted.length === 0 && hasPersonalityLeak(streamed)) {
        yield finish(draft, SLM_FALLBACK_PROVIDER);
        return;
      }

      const delta = streamed.slice(emitted.length);
      if (delta) {
        yield { type: "token", text: delta };
        emitted = streamed;
      }
    }
  } catch {
    yield finish(draft, SLM_FALLBACK_PROVIDER);
    return;
  }

  const model = getActiveOllamaModel() ?? process.env.OLLAMA_MODEL ?? "leonardo-museum";
  const sanitized = sanitizeLeonardoReply(streamed, input.question);
  const valid = isValidPolish(draft, sanitized, input.question);
  const reply = valid ? sanitized : draft;
  const provider = valid ? `cortex+${model}` : SLM_FALLBACK_PROVIDER;

  yield finish(reply, provider);
}
