import type { LeonardoZone } from "./types";
import type { CortexInput } from "./types";
import type { KnowledgeSnippet } from "./knowledge";
import { isSafeForVisitorText, sanitizeLeonardoReply } from "./corpusFilter";

function topicSeed(question: string, zone: LeonardoZone): string | null {
  const q = question.toLowerCase();
  if (/\b(lived today|living today|your century|our century|modern age|today, what would you study|what would you study)\b/.test(q)) {
    return (
      "Were I born again in your century, I would still call myself a student — never a master who has arrived. " +
      "I would begin with water, for it sculpts stone and teaches every vortex I have drawn in the notebooks. " +
      "I would watch birds until flight became geometry, and open the body until muscle and bone explained the living hand upon the panel. " +
      "Your instruments would astonish me, yet my method would not change: I look long, I draw what I see, and I look again until the thing reveals its law."
    );
  }
  if (/\b(secret|notebook|codex|journal|mirror.?script)\b/.test(q)) {
    return (
      "I write some pages in mirror-script — not to hide from honest eyes, but to slow the hand until the thought is clear. " +
      "The notebooks hold diving suits imagined before the sea was mapped, geometries of water, machines for flight I never saw built. " +
      "The secret I trust most is simpler: observation without hurry. The world yields its structure to the patient eye."
    );
  }
  if (/\b(fly|flight|flying|machine|aircraft|plane|helicopter|jet|modern flying)\b/.test(q)) {
    return (
      "Your flying machines rise on thunder where the falcon rises on silence. I studied the wing for years — the tendon, the bone, the curve of air — and drew machines that never left the page. " +
      "Nature solved flight first; my task was to read her handwriting. I wonder whether your iron birds have yet learned what the kite teaches: that the air is a sea, not an emptiness."
    );
  }
  if (/\b(greatest unfinished|unfinished idea|left undone|never finished)\b/.test(q)) {
    return (
      "I carry a list of things not yet understood — this is not shame but appetite. " +
      "The horse of bronze, the river I could not tame in paint, the wing that would lift a man — each unfinished work is a door I have not yet passed through. " +
      "Sometimes I write, tell me if anything was ever done, and mean it quietly; then I return to the line on the page."
    );
  }
  if (/\b(learn to see|see the world|saper vedere|how did you learn)\b/.test(q)) {
    return (
      "I learned to see by refusing to hurry. As a boy I watched water stain a wall until the stain became a landscape. " +
      "Saper vedere — knowing how to see — is the whole craft, whether the subject is a face, a tendon, or the curl of a wing."
    );
  }
  if (zone === "engineering" && /\b(water|wheel|bridge|screw|tank|ornithopter)\b/.test(q)) {
    return "I draw mechanisms as nature draws them — spiral upon spiral, force finding its path through matter.";
  }
  return null;
}

function pickInsight(insights: string[], zone: LeonardoZone): string {
  const ok = insights.filter(
    (i) => /\bI\b/.test(i) && !/\bYou stand\b/i.test(i) && isSafeForVisitorText(i),
  );
  return ok[0] ?? "";
}

function museumDetail(snippets: KnowledgeSnippet[]): string {
  const hit = snippets.find((s) => s.kind === "codex" || s.kind === "painting");
  if (!hit || !isSafeForVisitorText(hit.content)) return "";
  const sentence =
    hit.content
      .replace(/^[^.]+\.\s*/, "")
      .split(/(?<=[.!?])\s+/)
      .find((s) => /\bI\b/.test(s) && s.length > 40 && s.length < 220) ??
    hit.content.split(/(?<=[.!?])\s+/)[0];
  if (!sentence || !isSafeForVisitorText(sentence)) return "";
  return sentence.length > 240 ? `${sentence.slice(0, 237).trim()}…` : sentence;
}

function closingInvitation(zone: LeonardoZone): string {
  if (zone === "art") return "Come stand where the light falls — tell me what you see.";
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
  const hotspot = input.hotspotLabel ? `I lean closer to ${input.hotspotLabel} as I answer. ` : "";
  const folioBlock = input.folioContext
    ? `Before us lies “${input.folioContext.title}” — ${input.folioContext.body.slice(0, 180).trim()}… `
    : "";

  const seed = topicSeed(input.question, zone);
  const opener = seed ?? pickInsight(insights, zone);
  const detail = museumDetail(snippets);
  const fact =
    facts.length > 0 && facts[0].object.length < 90
      ? `In my notebooks I saw that ${facts[0].subject} ${facts[0].predicate} ${facts[0].object}.`
      : "";

  const parts = [visitor + hotspot + folioBlock + opener, detail, fact, closingInvitation(zone)].filter(
    (p) => p.trim().length > 35 && isSafeForVisitorText(p),
  );

  const unique: string[] = [];
  for (const p of parts) {
    const key = p.slice(0, 50).toLowerCase();
    if (!unique.some((u) => u.slice(0, 50).toLowerCase() === key)) unique.push(p);
  }

  const raw = unique.slice(0, 3).join("\n\n");
  return sanitizeLeonardoReply(raw, input.question);
}
