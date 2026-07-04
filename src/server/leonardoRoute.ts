import { runLeonardoCortex } from "../cortex/index";
import { buildLeonardoPolishContext } from "../cortex/polishContext";
import { sanitizeLeonardoReply } from "../cortex/corpusFilter";
import { polishDraft, polishProviderLabel } from "../cortex/polish";
import { LEONARDO_SYSTEM_PROMPT } from "../lib/prompt";
import type { CortexInput } from "../cortex/types";

export type LeonardoRequestBody = CortexInput & {
  polish?: boolean;
  draft?: string;
  memory?: CortexInput["memory"];
};

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
  let reply = body.draft ?? cortex.reply;
  let provider = body.draft ? "cortex+draft" : cortex.provider;

  if (body.polish !== false) {
    const zone = cortex.trace.zone;
    const corpusContext = buildLeonardoPolishContext(input.question, zone, 6);
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
      console.warn("[leonardo] LLM polish unavailable — returning CORTEX draft");
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
