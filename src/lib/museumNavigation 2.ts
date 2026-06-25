export const ATELIER_NAV_MARKER = "[[ATELIER]]";
export const STUDIO_NAV_MARKER = "[[STUDIO]]";
export const DISSECTION_NAV_MARKER = "[[DISSECTION]]";
export const WORKSHOP_NAV_MARKER = "[[WORKSHOP]]";

export type MuseumNavTarget = "atelier" | "art" | "anatomy" | "engineering";

export function stripMuseumNavMarkers(text: string): string {
  return text
    .replace(/\[\[(?:ATELIER|STUDIO|DISSECTION|WORKSHOP)\]\]/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function userRequestsAtelierTour(question: string): boolean {
  const q = question.toLowerCase();
  return (
    /\b(atelier|workshop|studio|dissection|tour|walk me|show me your|three room|work beside|enter the)\b/.test(q) ||
    /\b(lead me|take me|bring me)\b/.test(q)
  );
}
