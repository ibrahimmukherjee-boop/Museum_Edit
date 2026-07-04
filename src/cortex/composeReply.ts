import { corpus } from "../data/museumCorpus";
import type { LeonardoZone } from "./types";
import type { CortexInput } from "./types";
import type { KnowledgeSnippet } from "./knowledge";
import { isSafeForVisitorText, sanitizeLeonardoReply } from "./corpusFilter";

const CLOSINGS = [
  "Tell me what you see — I will answer in particulars.",
  "Ask again, slowly; the notebook rewards patience.",
  "Point to what interests you, and we will look together.",
  "What stirs in your mind next?",
];

function closingFor(question: string, zone: LeonardoZone): string {
  const idx = (question.length + zone.charCodeAt(0)) % CLOSINGS.length;
  return CLOSINGS[idx]!;
}

function paintingByQuestion(question: string): (typeof corpus.paintings)[0] | null {
  const q = question.toLowerCase();
  const rules: [RegExp, string][] = [
    [/mona\s*lisa|gioconda|la gioconda/, "mona-lisa"],
    [/last\s*supper|cenacolo/, "last-supper"],
    [/vitruvian/, "vitruvian-man"],
    [/lady.*ermine|cecilia/, "lady-ermine"],
    [/annunciation/, "annunciation"],
    [/saint\s*john|st\.?\s*john/, "saint-john"],
  ];
  for (const [re, id] of rules) {
    if (re.test(q)) return corpus.paintings.find((p) => p.id === id) ?? null;
  }
  return null;
}

function topicSeed(question: string, zone: LeonardoZone): string | null {
  const q = question.toLowerCase();

  if (/\b(who are you|who is leonardo|introduce yourself|your name)\b/.test(q)) {
    return (
      "I am Leonardo da Vinci — painter, engineer, anatomist, musician — born in Vinci in fourteen fifty-two. " +
      "I have served courts in Florence, Milan, and France, yet I still call myself a student of nature. " +
      "My notebooks hold wings, veins, and vortices of water; my panels hold light made flesh. Ask what you wish — I answer from what I have seen and drawn."
    );
  }

  if (/\b(sistine\s*chapel|michelangelo.*ceiling|did you paint.*chapel)\b/.test(q)) {
    return (
      "No — that vault is Michelangelo's work, not mine. I knew Rome, and I knew Buonarroti; we were rivals as much as fellow craftsmen. " +
      "He wrestled prophets from wet plaster while I preferred oil, anatomy, and the slow dissolution of sfumato. " +
      "Do not hang his ceiling upon my name — each master carries his own burden."
    );
  }

  const painting = paintingByQuestion(question);
  if (painting) {
    return (
      `You ask about ${painting.title}. I worked on it ${painting.year ? `around ${painting.year}` : "across many seasons"}. ` +
      `${painting.description} ` +
      (painting.location ? `It rests now at ${painting.location}.` : "")
    );
  }

  if (/\b(greatest invention|best invention|important invention|your invention)\b/.test(q)) {
    return (
      "I hesitate to crown one invention — I leave many unfinished on purpose. " +
      "The ornithopter taught me how a wing must beat air; the tank and the screw for water taught me how force finds path through matter. " +
      "Yet the instrument I trust most is not iron but the eye: saper vedere — knowing how to see. Without that, every machine is blind."
    );
  }

  if (/\b(lived today|living today|your century|our century|modern age|what would you study)\b/.test(q)) {
    return (
      "Were I born in your century, I would still begin with water and wing — then anatomy, then light upon the face. " +
      "Your flying machines and your lenses would astonish me, but my method would not change: look long, draw what you see, look again."
    );
  }

  if (/\b(secret|notebook|codex|journal|mirror.?script)\b/.test(q)) {
    return (
      "I write some pages in mirror-script to slow the hand until the thought is clear. " +
      "The notebooks hold diving suits imagined before the sea was mapped, geometries of water, machines for flight I never saw built. " +
      "The secret I trust most is simpler: observation without hurry."
    );
  }

  if (/\b(fly|flight|flying|machine|aircraft|plane|helicopter|jet|modern flying)\b/.test(q)) {
    return (
      "Your flying machines rise on thunder where the falcon rises on silence. I studied the wing for years and drew machines that never left the page. " +
      "Nature solved flight first; my task was to read her handwriting."
    );
  }

  if (/\b(greatest unfinished|unfinished idea|left undone|never finished)\b/.test(q)) {
    return (
      "I carry a list of things not yet understood — the horse of bronze, the river I could not tame in paint, the wing that would lift a man. " +
      "Sometimes I write, tell me if anything was ever done, and mean it quietly; then I return to the line on the page."
    );
  }

  if (/\b(learn to see|see the world|saper vedere|how did you learn)\b/.test(q)) {
    return (
      "I learned to see by refusing to hurry. As a boy I watched water stain a wall until the stain became a landscape. " +
      "Saper vedere — knowing how to see — is the whole craft."
    );
  }

  if (zone === "engineering" && /\b(water|wheel|bridge|screw|tank|ornithopter)\b/.test(q)) {
    return "I draw mechanisms as nature draws them — spiral upon spiral, force finding its path through matter.";
  }

  return null;
}

function museumDetail(snippets: KnowledgeSnippet[], question: string): string {
  if (topicSeed(question, "general")) return "";
  const hit = snippets.find((s) => (s.kind === "codex" || s.kind === "painting") && isSafeForVisitorText(s.content));
  if (!hit) return "";
  const sentence = hit.content
    .split(/(?<=[.!?])\s+/)
    .find((s) => /\bI\b/.test(s) && s.length > 40 && s.length < 220 && isSafeForVisitorText(s));
  if (!sentence) return "";
  return sentence.length > 240 ? `${sentence.slice(0, 237).trim()}…` : sentence;
}

export function composeLeonardoReply(
  input: CortexInput,
  zone: LeonardoZone,
  _insights: string[],
  snippets: KnowledgeSnippet[],
  _facts: { subject: string; predicate: string; object: string; source: string }[],
): string {
  const visitor = input.memory.visitorName !== "Guest" ? `${input.memory.visitorName}, ` : "";
  const hotspot = input.hotspotLabel ? `I lean closer to ${input.hotspotLabel} as I answer. ` : "";
  const folioBlock = input.folioContext
    ? `Before us lies “${input.folioContext.title}” — ${input.folioContext.body.slice(0, 180).trim()}… `
    : "";

  const seed = topicSeed(input.question, zone);
  const detail = seed ? "" : museumDetail(snippets, input.question);
  const body = seed ?? detail;

  if (!body) {
    return sanitizeLeonardoReply(
      `${visitor}${hotspot}${folioBlock}I hear your question. Set the thing before the eye — name its light, its weight, its motion — and I will answer in particulars, not in fog. ${closingFor(input.question, zone)}`,
      input.question,
    );
  }

  const parts = [visitor + hotspot + folioBlock + body, closingFor(input.question, zone)].filter(
    (p) => p.trim().length > 30 && isSafeForVisitorText(p),
  );

  return sanitizeLeonardoReply(parts.join("\n\n"), input.question);
}
