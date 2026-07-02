import { runLeonardoCortex } from "../cortex/index";
import { buildPolishContext, retrieveKnowledge } from "../cortex/knowledge";
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
  let provider = cortex.provider;

  if (body.polish !== false) {
    const zone = cortex.trace.zone;
    const snippets = retrieveKnowledge(
      input.question,
      zone === "general" ? undefined : zone,
      6,
    );
    const corpusContext = buildPolishContext(snippets);
    const polished = await polishDraft(reply, LEONARDO_SYSTEM_PROMPT, corpusContext);
    if (polished) {
      reply = sanitizeLeonardoReply(polished.text, input.question);
      provider = polishProviderLabel(polished.provider);
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
