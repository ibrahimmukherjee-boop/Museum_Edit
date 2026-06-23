import type { CortexInput, LeonardoZone } from "./types";

export function routeZone(input: CortexInput): LeonardoZone {
  if (input.folioContext?.domain && input.folioContext.domain !== "general") {
    return input.folioContext.domain as LeonardoZone;
  }
  const q = input.question.toLowerCase();
  if (/\b(anatom|body|muscle|bone|eye|dissect|heart|flesh|skull|womb)\b/.test(q)) return "anatomy";
  if (/\b(fly|flight|machine|wing|water|engineer|ornithopter|canal|tank|screw)\b/.test(q)) return "engineering";
  if (/\b(paint|light|sfumato|portrait|panel|colour|color|canvas|studio|chiaroscuro)\b/.test(q)) return "art";
  return "general";
}

export function zoneLabel(z: LeonardoZone): string {
  return { art: "The Studio", anatomy: "The Dissection Table", engineering: "The Workshop", general: "The Parlor" }[z];
}
