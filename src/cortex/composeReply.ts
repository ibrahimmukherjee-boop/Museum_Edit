import type { LeonardoZone } from "./types";
import type { CortexInput } from "./types";
import type { KnowledgeSnippet } from "./knowledge";

function stripBoilerplate(text: string): string {
  return text
    .replace(/\bYou stand in my workshop[^.]*\.\s*/gi, "")
    .replace(/\bYou ask[^.]*\.\s*/gi, "")
    .replace(/[""][^""]+[""]\s*—\s*a worthy thread[^.]*\.\s*/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function topicSeed(question: string, zone: LeonardoZone): string | null {
  const q = question.toLowerCase();
  if (/\b(lived today|living today|your century|our century|modern age|today, what would you study|what would you study)\b/.test(q)) {
    return (
      "Were I born again in your century, I would still call myself a student — never a master who has arrived. " +
      "I would begin with water, for it sculpts stone and teaches every vortex I have drawn in the notebooks. " +
      "I would watch birds until flight became geometry, and open the body until muscle and bone explained the living hand upon the panel. " +
      "Your flying machines and your instruments of sight would astonish me, yet my method would not change: I look long, I draw what I see, and I look again until the thing reveals its law."
    );
  }
  if (/\b(greatest unfinished|unfinished idea|left undone|never finished)\b/.test(q)) {
    return (
      "I carry a list of things not yet understood — this is not shame but appetite. " +
      "The horse of bronze, the river that would not be tamed in paint, the wing that would lift a man — each unfinished work is a door I have not yet passed through. " +
      "Sometimes I write in the notebooks, tell me if anything was ever done, and mean it quietly; then I return to the line on the page, because the looking itself is the life."
    );
  }
  if (/\b(learn to see|see the world|saper vedere|how did you learn)\b/.test(q)) {
    return (
      "I learned to see by refusing to hurry. As a boy I watched water stain a wall until the stain became a landscape; I learned that the eye must be a lover, not a judge. " +
      "Saper vedere — knowing how to see — is the whole craft, whether the subject is a face, a tendon, or the curl of a wing in air."
    );
  }
  if (/\b(fly|flight|flying machine|aircraft|plane|ornithopter)\b/.test(q) && zone !== "engineering") {
    return (
      "Your flying machines rise on thunder where the falcon rises on silence — and still I wonder whether you have learned what the wing teaches: that air is a sea, not an emptiness. " +
      "I studied lift in the feather long before iron learned to swim."
    );
  }
  return null;
}

function acknowledgeQuestion(question: string, zone: LeonardoZone): string {
  const seed = topicSeed(question, zone);
  if (seed) return seed;

  const short = question.trim().replace(/\?+$/, "");
  if (zone === "art") {
    return `You ask me about ${short.toLowerCase()} — I answer as a painter who trusts the eye before the tongue. Light is my first subject; the rest follows.`;
  }
  if (zone === "anatomy") {
    return `On ${short.toLowerCase()} — I speak from the candle and the knife, from what flesh revealed when it yielded to patient looking.`;
  }
  if (zone === "engineering") {
    return `Your question touches ${short.toLowerCase()} — I would first ask how nature solves it, then invent in wood and iron to imitate her law.`;
  }
  return (
    `On ${short.toLowerCase()} — I answer as one who begins with the thing itself before the eye. ` +
    `Patience is my first instrument; hurry is the enemy of form.`
  );
}

function weaveCorpus(snippets: KnowledgeSnippet[]): string {
  const hit = snippets.find(
    (s) => s.kind === "training" || s.kind === "personality" || s.kind === "codex" || s.kind === "persona-anchor",
  );
  if (!hit) return "";
  const text = hit.content.replace(/\s+/g, " ").trim();
  const sentence = text.split(/(?<=[.!?])\s+/).find((s) => /\bI\b/.test(s)) ?? text.split(/(?<=[.!?])\s+/)[0];
  if (!sentence || sentence.length < 40) return "";
  return sentence.length > 320 ? `${sentence.slice(0, 317).trim()}…` : sentence;
}

function pickInsight(insights: string[]): string {
  const firstPerson = insights.find((i) => /\bI\b/.test(i) && !/\bYou stand\b/i.test(i));
  const pick = firstPerson ?? insights.find((i) => !/\bYou stand\b/i.test(i)) ?? insights[0];
  if (!pick) return "";
  return stripBoilerplate(pick);
}

function closingInvitation(zone: LeonardoZone): string {
  if (zone === "art") return "Come stand where the light falls — tell me what you see, and I will show you what the brush must learn.";
  if (zone === "anatomy") return "Lean closer to the folio — the body still has secrets for both of us.";
  if (zone === "engineering") return "Point to the mechanism you wonder about, and we will read it as nature reads water and wing.";
  return "Ask the next question slowly — the notebook rewards the patient line.";
}

export function composeLeonardoReply(
  input: CortexInput,
  zone: LeonardoZone,
  insights: string[],
  snippets: KnowledgeSnippet[],
  facts: { subject: string; predicate: string; object: string; source: string }[],
): string {
  const visitor = input.memory.visitorName !== "Guest" ? `${input.memory.visitorName}, ` : "";
  const hotspot = input.hotspotLabel
    ? `I lean closer to ${input.hotspotLabel} as I answer. `
    : "";

  const folioBlock = input.folioContext
    ? `Before us lies “${input.folioContext.title}” — ${input.folioContext.body.slice(0, 200).trim()}… `
    : "";

  const opener = acknowledgeQuestion(input.question, zone);
  const insight = pickInsight(insights);
  const corpus = weaveCorpus(snippets);
  const fact =
    facts.length > 0
      ? `In my ${facts[0].source}, I noted that ${facts[0].subject} ${facts[0].predicate} ${facts[0].object}.`
      : "";

  const parts = [visitor + hotspot + folioBlock + opener, insight, corpus, fact, closingInvitation(zone)]
    .map((p) => stripBoilerplate(p))
    .filter((p) => p.length > 30);

  const unique: string[] = [];
  for (const p of parts) {
    const key = p.slice(0, 60);
    if (!unique.some((u) => u.slice(0, 60) === key)) unique.push(p);
  }

  return unique.slice(0, 3).join("\n\n");
}
