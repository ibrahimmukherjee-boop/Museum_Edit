/** Per-folio 3D tuning — museum parchment pop-out (not floating rock). */
import type { StageMode } from "./folioVisuals";

export type ReliefProfile = "portrait" | "anatomy" | "workshop";

export interface Folio3DTuning {
  reliefProfile: ReliefProfile;
  depthScale: number;
  planeW: number;
  zLift: number;
  pageCurl: number;
  edgeWeight: number;
  lumWeight: number;
}

const PORTRAIT: Omit<Folio3DTuning, "reliefProfile" | "depthScale" | "planeW"> = {
  zLift: 0.045,
  pageCurl: 0.14,
  edgeWeight: 0.28,
  lumWeight: 0.42,
};

const ANATOMY: Omit<Folio3DTuning, "reliefProfile" | "depthScale" | "planeW"> = {
  zLift: 0.038,
  pageCurl: 0.1,
  edgeWeight: 0.48,
  lumWeight: 0.38,
};

const WORKSHOP: Omit<Folio3DTuning, "reliefProfile" | "depthScale" | "planeW"> = {
  zLift: 0.042,
  pageCurl: 0.11,
  edgeWeight: 0.38,
  lumWeight: 0.36,
};

const OVERRIDES: Record<string, Partial<Folio3DTuning>> = {
  "p-mona-lisa": {
    reliefProfile: "portrait",
    depthScale: 0.11,
    planeW: 0.88,
    zLift: 0.04,
    pageCurl: 0.16,
    edgeWeight: 0.22,
    lumWeight: 0.35,
  },
  "p-lady-ermine": { depthScale: 0.12, planeW: 0.9 },
  "p-saint-john": { depthScale: 0.12, planeW: 0.9 },
  "p-last-supper": { depthScale: 0.13, planeW: 1.05 },
  "p-vitruvian-man": { depthScale: 0.14, planeW: 1.0 },
  "c-anatomy-7": { depthScale: 0.18, planeW: 0.95 },
  "c-anatomy-8": { depthScale: 0.17, planeW: 0.95 },
  "c-anatomy-2": { depthScale: 0.16 },
  "c-anatomy-3": { depthScale: 0.15 },
  "c-eng-1": { depthScale: 0.15, planeW: 1.15 },
  "c-eng-5": { depthScale: 0.14, planeW: 1.12 },
  "c-eng-2": { depthScale: 0.13, planeW: 1.1 },
  "c-eng-4": { depthScale: 0.14 },
  "c-eng-7": { depthScale: 0.12, planeW: 1.2 },
};

export function tuningForFolio(folioId: string, stage: StageMode): Folio3DTuning {
  const base =
    stage === "dissection"
      ? { reliefProfile: "anatomy" as const, depthScale: 0.17, planeW: 0.92, ...ANATOMY }
      : stage === "workshop"
        ? { reliefProfile: "workshop" as const, depthScale: 0.14, planeW: 1.05, ...WORKSHOP }
        : { reliefProfile: "portrait" as const, depthScale: 0.13, planeW: 0.98, ...PORTRAIT };

  return { ...base, ...OVERRIDES[folioId] };
}

/** Folios needing crop/depth follow-up — audit list for museum QA. */
export const ATELIER_3D_AUDIT: { folioId: string; issue: string; priority: "high" | "medium" }[] = [
  { folioId: "p-mona-lisa", issue: "Was reading as floating relief blob; tuned for sfumato face on panel", priority: "high" },
  { folioId: "p-last-supper", issue: "Wide crop includes too much table — shallow depth on group", priority: "medium" },
  { folioId: "p-battle-anghiari", issue: "Motion blur in source fights displacement; edges too rocky", priority: "medium" },
  { folioId: "c-anatomy-7", issue: "Foot/calf needs ink-line relief not lump; priority folio", priority: "high" },
  { folioId: "c-anatomy-8", issue: "Bear foot similar — paper mask bleeds", priority: "high" },
  { folioId: "c-anatomy-4", issue: "Small eye crop — high edge noise", priority: "medium" },
  { folioId: "c-eng-1", issue: "Ornithopter wings read as cardboard; needs workshop curl", priority: "high" },
  { folioId: "c-eng-5", issue: "Flying machine — same workshop lift issue", priority: "high" },
  { folioId: "c-eng-3", issue: "Water vortex low contrast — weak depth", priority: "medium" },
  { folioId: "c-eng-7", issue: "Bridge span very wide — flat extrusion", priority: "medium" },
  { folioId: "p-annunciation", issue: "Two figures in one crop — muddy silhouette", priority: "medium" },
  { folioId: "p-virgin-rocks", issue: "Dark background confuses paper detection", priority: "medium" },
];
