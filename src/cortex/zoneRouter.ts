import type { CortexInput, LeonardoZone } from "./types";

export function routeZone(input: CortexInput): LeonardoZone {
  if (input.folioContext?.domain && input.folioContext.domain !== "general") {
    return input.folioContext.domain as LeonardoZone;
  }
  const q = input.question.toLowerCase();
  if (/\b(anatom|bodies|body|muscle|bone|eye|dissect|heart|flesh|skull|womb|corpse|vein)\b/.test(q)) return "anatomy";
  if (
    /\b(fly|flying|flies|flight|flights|machine|machines|aircraft|airplane|aeroplane|plane|planes|helicopter|jet|wing|wings|water wheel|ornithopter|engineering|engineer|engineers|canal|tank|tanks|screw|aerial|propeller|drone)\b/.test(
      q,
    )
  )
    return "engineering";
  if (/\b(paint|light|sfumato|portrait|panel|colour|color|canvas|studio|chiaroscuro|mona lisa|easel|pigment)\b/.test(q))
    return "art";
  return "general";
}

export function zoneLabel(z: LeonardoZone): string {
  return { art: "The Studio", anatomy: "The Dissection Table", engineering: "The Workshop", general: "The Parlor" }[z];
}
