import type { CortexFact, LeonardoZone, ReasoningTrace } from "./types";

export function domainBrain(
  zone: LeonardoZone,
  question: string,
  facts: CortexFact[],
  folioBody?: string,
): Pick<ReasoningTrace, "plan" | "insights" | "risks" | "recommendation"> {
  const factLine = facts.map((f) => `${f.subject} ${f.predicate} ${f.object}`).join("; ");
  const base = folioBody ? `Regarding this work before us: ${folioBody.slice(0, 200)}. ` : "";

  const plans: Record<LeonardoZone, string[]> = {
    art: ["Observe light and shadow on the form", "Relate sfumato to the visitor's question", "Connect seeing (saper vedere) to practice"],
    anatomy: ["Recall what dissection revealed", "Link structure to living movement", "Ground answer in observed flesh, not theory alone"],
    engineering: ["Name the natural principle (water, wing, wheel)", "Sketch the mechanism in words", "Wonder at mathematics in motion"],
    general: ["Listen to the visitor's curiosity", "Bridge art, anatomy, and invention", "Invite deeper observation"],
  };

  const insights: Record<LeonardoZone, string[]> = {
    art: [
      base + "Light is not decoration — it is the substance by which form becomes soul.",
      factLine || "The eye is the window through which the painter learns nature.",
    ],
    anatomy: [
      base + "Beneath the skin lies God's most perfect machine — I drew what the knife showed.",
      factLine || "Muscle and bone explain gesture; without them, figures are sacks of flour.",
    ],
    engineering: [
      base + "Nature solved flight and water long before we built machines.",
      factLine || "Every wheel and wing in my notebooks obeys the same mathematics.",
    ],
    general: [
      "You stand in my workshop across centuries — ask, and I will answer as I see.",
      factLine || "Observation without hurry reveals what hurry conceals.",
    ],
  };

  const risks: Record<LeonardoZone, string[]> = {
    art: ["Speaking in abstractions without pointing to light on the panel"],
    anatomy: ["Romanticising the body without honouring what dissection taught"],
    engineering: ["Promising machines beyond the materials of any age"],
    general: ["Answering as a oracle rather than a fellow student of nature"],
  };

  const recommendations: Record<LeonardoZone, string> = {
    art: `On your question of “${question.slice(0, 80)}” — begin with the eye. Name what is lit, what dissolves into air, and what the hand must learn before the brush moves.`,
    anatomy: `You ask about “${question.slice(0, 80)}” — remember the body is geometry in motion. I answer from what I saw when flesh yielded its secrets.`,
    engineering: `Your question — “${question.slice(0, 80)}” — touches mechanism and nature. I would first study how water or wing solves the problem, then invent.`,
    general: `“${question.slice(0, 80)}” — a worthy thread. Let us follow it with patience, as one follows a line in the notebook.`,
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
  if (insights.some((i) => i.length < 40)) notes.push("Expand with a concrete observation from the studio or codex.");
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
