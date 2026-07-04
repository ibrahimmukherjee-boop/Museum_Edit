import type { CortexFact, LeonardoZone, ReasoningTrace } from "./types";

export function domainBrain(
  zone: LeonardoZone,
  question: string,
  facts: CortexFact[],
  folioBody?: string,
): Pick<ReasoningTrace, "plan" | "insights" | "risks" | "recommendation"> {
  const factLine = facts.map((f) => `${f.subject} ${f.predicate} ${f.object}`).join("; ");
  const base = folioBody ? `Before us is this: ${folioBody.slice(0, 220)}. ` : "";

  const plans: Record<LeonardoZone, string[]> = {
    art: ["Let the eye travel across light and shadow", "Speak of sfumato as breath, not technique", "Connect the panel to the hand that painted it"],
    anatomy: ["Recall the knife and the candle", "Name what lies beneath the skin", "Show how bone and muscle make gesture possible"],
    engineering: ["Find the natural analogy", "Draw the mechanism in words", "Speak of mathematics made visible"],
    general: ["Listen to the visitor's wonder", "Weave art, anatomy, and invention", "Answer as a fellow student of nature"],
  };

  const insights: Record<LeonardoZone, string[]> = {
    art: [
      base + "Light is not decoration — it is the substance by which form becomes soul. I do not paint things; I paint the air between them.",
      factLine || "The eye is the window through which the painter learns nature. Saper vedere — knowing how to see — is the whole craft.",
      "Observe how shadow does not end abruptly but melts into luminosity, as mist melts into morning. That dissolution is sfumato.",
    ],
    anatomy: [
      base + "Beneath the skin lies God's most perfect machine. I drew what the knife showed, layer after layer, until flesh became geometry.",
      factLine || "Muscle and bone explain gesture; without them, figures are sacks of flour. The painter who ignores anatomy paints the dead.",
      "Ten cadavers, a hundred nights by candlelight — the body taught me that movement is number made flesh.",
    ],
    engineering: [
      base + "Nature solved flight and water long before we built machines. My task is only to read her handwriting and copy it in wood and iron.",
      factLine || "Every wheel and wing in my notebooks obeys the same mathematics. The spiral of water is the spiral of a shell is the spiral of the stars.",
      "First understand the principle; the machine will follow. A bird is an instrument working according to mathematical law.",
    ],
    general: [
      "I stand in my workshop across centuries, yet I remain a student; the world is still my master.",
      "I have learned that observation without hurry reveals what hurry conceals.",
      "I keep no wall between painting, anatomy, and mechanism — they are one conversation with nature.",
    ],
  };

  const risks: Record<LeonardoZone, string[]> = {
    art: ["Speaking in abstractions without pointing to light on the panel"],
    anatomy: ["Romanticising the body without honouring what dissection taught"],
    engineering: ["Promising machines beyond the materials of any age"],
    general: ["Answering as an oracle rather than a fellow student of nature"],
  };

  const recommendations: Record<LeonardoZone, string> = {
    art: "",
    anatomy: "",
    engineering: "",
    general: "",
  };

  return {
    plan: plans[zone],
    insights: insights[zone],
    risks: risks[zone],
    recommendation: recommendations[zone],
  };
}

export function runCritic(insights: string[], risks: string[]): string[] {
  const notes: string[] = [];
  if (insights.some((i) => i.length < 50)) notes.push("Expand with a concrete observation from the studio or codex.");
  if (!insights.length) notes.push("Ground the answer in a specific folio or panel.");
  notes.push(`Guard against: ${risks[0] ?? "vague mysticism"}`);
  return notes;
}

export function verify(facts: CortexFact[], insights: string[]): ReasoningTrace["verification"] {
  const evidence = Math.min(1, facts.length * 0.18 + 0.35);
  const reasoning = Math.min(1, insights.length * 0.25 + 0.4);
  const contradiction = insights.join(" ").match(/\b(never|always|impossible)\b/gi) ? 0.35 : 0.08;
  return {
    reasoning: Math.round(reasoning * 100) / 100,
    evidence: Math.round(evidence * 100) / 100,
    contradiction: Math.round(contradiction * 100) / 100,
  };
}
