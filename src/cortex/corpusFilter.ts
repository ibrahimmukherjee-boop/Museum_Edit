/** Block RAG chunks that leak into visitor-facing Leonardo replies. */
const BLOCKED_SOURCE = /polymath festival|masterclass.*transcription|transcription for|speaker_\d+/i;

const BLOCKED_CONTENT =
  /\b(SPEAKER_\d+|Transcription for|Angela Myers|Polymaths Place|dissertation|shout out|going live|zoom call|gender quota|Wakas|Wakat|GMT2021|Personality:\s*DVNC|Agent Prompts brief|CONFIDENTIAL|Polymath Festival:\s*transcription|DVNC\.ai Leonardo Museum|Complete Brief For Ibrahim|How to Use This Document|BEHAVIOURAL INSTRUCTION|mental models as simultaneous)\b/i;

const MODERN_ACADEMIC =
  /\b(polymath festival|modern day polymath|learning strategies|edtech|AI-powered|machine learning|dissertation|academic|webinar|podcast)\b/i;

export function isSafeCorpusChunk(source: string, content: string): boolean {
  const combined = `${source} ${content}`;
  if (BLOCKED_SOURCE.test(source)) return false;
  if (BLOCKED_CONTENT.test(combined)) return false;
  if (/^Transcription for/i.test(content.trim())) return false;
  if ((content.match(/SPEAKER_\d+/g) ?? []).length >= 2) return false;
  return true;
}

const THIRD_PERSON_META =
  /\bLeonardo's\b|\bLeonardo is\b|\bLeonardo was\b|\bThe actual Leonardo\b|\bHe served Cesare\b|\bHis humour\b|\bhe delight/i;

/** Personality-brief phrases that must never appear in visitor replies. */
const PERSONALITY_LEAK =
  /\b(my humou?r is dry|humou?r is dry and structural|let the observation carry the wit|never announce a joke|fable about a stone that leaves its hill|I delight when a pupil notices|Irony is more efficient than complaint|Any phenomenon, attended to carefully)\b/i;

export function hasPersonalityLeak(text: string): boolean {
  return PERSONALITY_LEAK.test(text);
}

export function isSafeForVisitorText(text: string): boolean {
  if (!text || text.length < 20) return false;
  if (BLOCKED_CONTENT.test(text)) return false;
  if (MODERN_ACADEMIC.test(text)) return false;
  if (/Personality:\s*DVNC/i.test(text)) return false;
  if (THIRD_PERSON_META.test(text)) return false;
  if (hasPersonalityLeak(text)) return false;
  return true;
}

/** Strip contamination and meta from a finished Leonardo reply. */
export function sanitizeLeonardoReply(text: string, question?: string): string {
  let out = text
    .replace(/Personality:\s*DVNC[^.]*\./gi, "")
    .replace(/Polymath Festival:\s*transcription[^.]*\./gi, "")
    .replace(/Transcription for[^.]*\./gi, "")
    .replace(/SPEAKER_\d+[^.!?]*[.!?]/gi, "")
    .replace(/Angela Myers[^.!?]*[.!?]/gi, "")
    .replace(/Polymaths Place[^.!?]*[.!?]/gi, "")
    .replace(/\b(give them a major shout out|my dissertation|going live|zoom call)\b[^.!?]*[.!?]/gi, "")
    .replace(/\bIn my notebooks I saw that[^.!?]*[.!?]/gi, "")
    .replace(/\bAccording to (the|my) (brief|notebooks I saw)[^.!?]*[.!?]/gi, "")
    .replace(/\bLeonardo's humour[^.!?]*[.!?]/gi, "")
    .replace(/\bMy humou?r is dry[^.!?]*[.!?]/gi, "")
    .replace(/\bhumou?r is dry and structural[^.!?]*[.!?]/gi, "")
    .replace(/\blet the observation carry the wit[^.!?]*[.!?]/gi, "")
    .replace(/\bnever announce a joke[^.!?]*[.!?]/gi, "")
    .replace(/\bfable about a stone that leaves its hill[^.!?]*[.!?]/gi, "")
    .replace(/\bLeonardo is[^.!?]*[.!?]/gi, "")
    .replace(/\bLeonardo was[^.!?]*[.!?]/gi, "")
    .replace(/\bThe actual Leonardo[^.!?]*[.!?]/gi, "")
    .replace(/\bDVNC\.ai[^.!?]*[.!?]/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  if (question) {
    const qNorm = question.trim().replace(/\?+$/, "").toLowerCase();
    const qShort = qNorm.slice(0, 60);
    out = out.replace(
      new RegExp(`^(Ans\\s*[-—:]\\s*)?(our\\s+)?question\\s+touches\\s+${escapeRegExp(qShort)}[^.!?]*[.!?]\\s*`, "i"),
      "",
    );
    out = out.replace(
      new RegExp(`^["'""]?${escapeRegExp(qShort)}["'""]?\\s*[-—:]\\s*`, "i"),
      "",
    );
    out = out.replace(
      new RegExp(`^On\\s+${escapeRegExp(qShort)}\\s*[-—]\\s*`, "i"),
      "",
    );
  }

  const paragraphs = out
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter((p) => isSafeForVisitorText(p) && p.length > 25);

  return paragraphs.slice(0, 3).join("\n\n") || out.slice(0, 1200);
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Internal context for GLM — no source labels, safe chunks only. */
export function polishContextFromSnippets(
  snippets: { title: string; content: string; kind: string }[],
  maxChars = 1800,
): string {
  const blocks: string[] = [];
  let used = 0;
  for (const s of snippets) {
    if (!isSafeCorpusChunk(s.title, s.content)) continue;
    if (s.kind === "persona-anchor" || s.kind === "personality") {
      const line = s.content.slice(0, 280);
      if (used + line.length > maxChars) break;
      blocks.push(line);
      used += line.length;
      continue;
    }
    if (s.kind !== "codex" && s.kind !== "painting" && s.kind !== "folio") continue;
    const line = s.content.replace(/\s+/g, " ").slice(0, 320);
    if (used + line.length > maxChars) break;
    blocks.push(line);
    used += line.length;
  }
  return blocks.join("\n");
}
