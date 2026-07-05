import { runLeonardoCortex } from "../cortex/index";
import { buildLeonardoPolishContext } from "../cortex/polishContext";
import { sanitizeLeonardoReply } from "../cortex/corpusFilter";
import { polishDraft, polishProviderLabel } from "../cortex/polish";
import { polishWithOllama } from "../cortex/ollama";
import { polishPreservesDraft } from "../cortex/polishValidate";
import { LEONARDO_SYSTEM_PROMPT } from "../lib/prompt";
import type { CortexInput } from "../cortex/types";

export type LeonardoRequestBody = CortexInput & {
  polish?: boolean;
  draft?: string;
  memory?: CortexInput["memory"];
};

async function polishCortexDraft(
  draft: string,
  question: string,
  zone: ReturnType<typeof runLeonardoCortex>["trace"]["zone"],
): Promise<{ reply: string; provider: string } | null> {
  const corpusContext = buildLeonardoPolishContext(question, zone, 5);

  for (const strict of [false, true, true]) {
    const polished = await polishDraft(
      draft,
      LEONARDO_SYSTEM_PROMPT,
      corpusContext,
      question,
      strict,
    );
    if (!polished?.text) continue;
    const text = sanitizeLeonardoReply(polished.text, question);
    if (polishPreservesDraft(draft, text, question)) {
      return {
        reply: text,
        provider: polishProviderLabel(polished.provider, polished.model),
      };
    }
    console.warn(`[leonardo] SLM polish failed validation (strict=${strict})`);
  }

  const last = await polishWithOllama(draft, LEONARDO_SYSTEM_PROMPT, {
    corpusContext,
    question,
    strict: true,
  });
  if (last?.text) {
    const text = sanitizeLeonardoReply(last.text, question);
    if (polishPreservesDraft(draft, text, question)) {
      return { reply: text, provider: `cortex+${last.model}` };
    }
  }
  return null;
}

/** CORTEX draft → corpus-tuned SLM polish → one full reply. */
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
  const draft = sanitizeLeonardoReply(cortex.reply, input.question);
  let reply = draft;
  let provider = "cortex";

  if (body.polish !== false) {
    const polished = await polishCortexDraft(draft, input.question, cortex.trace.zone);
    if (polished) {
      reply = polished.reply;
      provider = polished.provider;
    } else {
      console.error("[leonardo] SLM could not preserve CORTEX facts — using validated draft");
      reply = draft;
      provider = "cortex+slm-fallback";
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
