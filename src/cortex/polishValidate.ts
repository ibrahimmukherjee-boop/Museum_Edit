/** Ensure SLM polish preserved CORTEX facts from the draft. */
export function polishPreservesDraft(draft: string, polished: string, question: string): boolean {
  const p = polished.toLowerCase();
  if (p.length < 40) return false;

  const mustFromDraft = extractAnchors(draft);
  const mustFromQuestion = extractAnchors(question);
  const required = [...new Set([...mustFromDraft, ...mustFromQuestion])];

  if (required.length === 0) return true;

  let hits = 0;
  for (const term of required) {
    if (p.includes(term)) hits++;
  }
  return hits >= Math.ceil(required.length * 0.6);
}

function extractAnchors(text: string): string[] {
  const t = text.toLowerCase();
  const anchors: string[] = [];
  const rules: [RegExp, string][] = [
    [/mona\s*lisa|gioconda/, "mona"],
    [/michelangelo|buonarroti/, "michelangelo"],
    [/sistine/, "sistine"],
    [/ornithopter/, "ornithopter"],
    [/saper vedere/, "see"],
    [/florence/, "florence"],
    [/vinci/, "vinci"],
    [/1452|fifteen fifty-two/, "1452"],
    [/louvre/, "louvre"],
    [/sfumato/, "sfumato"],
    [/not mine|not my/, "not"],
    [/\bno\b.*\bnot\b|\bnot\b.*\bmy\b/, "not"],
  ];
  for (const [re, token] of rules) {
    if (re.test(t)) anchors.push(token);
  }
  return anchors;
}
