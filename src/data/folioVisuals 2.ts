/** Per-folio visual config: true out-of-frame pop-out (not full-image zoom). */
export type StageMode = "studio" | "dissection" | "workshop";

export interface FolioVisual {
  stage: StageMode;
  /** Image inside the clipped frame */
  backgroundKey: string;
  backgroundPosition?: string;
  /** Isolated subject that breaks OUT of the frame — often a different crop or modern pairing */
  foregroundKey: string;
  foregroundPosition: string;
  /** CSS mask isolates subject silhouette (ellipse), like the squirrel matte */
  mask?: string;
  width?: string;
  /** Where the foreground layer anchors — top offset from frame bottom edge */
  overlapTop?: string;
  rotateX?: number;
  /** Workshop only: label for sketch → today mapping */
  modernLabel?: string;
}

const ELLIPSE = (x: string, y: string, w: string, h: string) =>
  `radial-gradient(ellipse ${w} ${h} at ${x} ${y}, #000 58%, transparent 72%)`;

export const FOLIO_VISUALS: Record<string, FolioVisual> = {
  // —— Studio: painting subject pops from panel ——
  "p-annunciation": {
    stage: "studio",
    backgroundKey: "annunciation",
    backgroundPosition: "50% 30%",
    foregroundKey: "annunciation",
    foregroundPosition: "35% 18%",
    mask: ELLIPSE("40%", "28%", "55%", "48%"),
    width: "68%",
    overlapTop: "7.5rem",
    rotateX: 10,
  },
  "p-last-supper": {
    stage: "studio",
    backgroundKey: "last-supper",
    backgroundPosition: "50% 35%",
    foregroundKey: "last-supper",
    foregroundPosition: "48% 22%",
    mask: ELLIPSE("50%", "30%", "50%", "42%"),
    width: "72%",
    overlapTop: "7.5rem",
    rotateX: 9,
  },
  "p-mona-lisa": {
    stage: "studio",
    backgroundKey: "mona-lisa",
    backgroundPosition: "50% 25%",
    foregroundKey: "mona-lisa",
    foregroundPosition: "50% 15%",
    mask: ELLIPSE("50%", "22%", "42%", "38%"),
    width: "58%",
    overlapTop: "7rem",
    rotateX: 11,
  },
  "p-vitruvian-man": {
    stage: "studio",
    backgroundKey: "vitruvian-man",
    backgroundPosition: "50% 50%",
    foregroundKey: "vitruvian-man",
    foregroundPosition: "50% 42%",
    mask: ELLIPSE("50%", "45%", "48%", "55%"),
    width: "70%",
    overlapTop: "7.5rem",
    rotateX: 8,
  },
  "p-lady-ermine": {
    stage: "studio",
    backgroundKey: "lady-ermine",
    backgroundPosition: "55% 35%",
    foregroundKey: "lady-ermine",
    foregroundPosition: "52% 25%",
    mask: ELLIPSE("55%", "30%", "45%", "45%"),
    width: "62%",
    overlapTop: "7.5rem",
    rotateX: 10,
  },
  "p-saint-john": {
    stage: "studio",
    backgroundKey: "saint-john",
    backgroundPosition: "50% 28%",
    foregroundKey: "saint-john",
    foregroundPosition: "48% 18%",
    mask: ELLIPSE("48%", "25%", "44%", "42%"),
    width: "60%",
    overlapTop: "7.5rem",
    rotateX: 10,
  },
  "p-battle-anghiari": {
    stage: "studio",
    backgroundKey: "battle-anghiari",
    backgroundPosition: "45% 50%",
    foregroundKey: "battle-anghiari",
    foregroundPosition: "42% 38%",
    mask: ELLIPSE("45%", "42%", "65%", "40%"),
    width: "78%",
    overlapTop: "8rem",
    rotateX: 7,
  },
  "c-art-1": { stage: "studio", backgroundKey: "codex-art-1", foregroundKey: "codex-art-1", foregroundPosition: "50% 35%", mask: ELLIPSE("50%", "40%", "70%", "50%"), width: "74%", overlapTop: "7.5rem", rotateX: 8 },
  "c-art-2": { stage: "studio", backgroundKey: "codex-art-2", foregroundKey: "codex-art-2", foregroundPosition: "50% 40%", mask: ELLIPSE("50%", "45%", "65%", "48%"), width: "72%", overlapTop: "7.5rem", rotateX: 8 },
  "c-art-3": { stage: "studio", backgroundKey: "codex-art-3", foregroundKey: "codex-art-3", foregroundPosition: "50% 45%", mask: ELLIPSE("50%", "48%", "55%", "52%"), width: "76%", overlapTop: "7.5rem", rotateX: 8 },
  "c-art-4": { stage: "studio", backgroundKey: "codex-art-4", foregroundKey: "codex-art-4", foregroundPosition: "50% 38%", mask: ELLIPSE("50%", "42%", "68%", "46%"), width: "72%", overlapTop: "7.5rem", rotateX: 8 },
  "c-art-5": { stage: "studio", backgroundKey: "codex-art-5", foregroundKey: "codex-art-5", foregroundPosition: "50% 40%", mask: ELLIPSE("50%", "44%", "70%", "48%"), width: "74%", overlapTop: "7.5rem", rotateX: 8 },
  "c-art-6": { stage: "studio", backgroundKey: "codex-art-6", foregroundKey: "codex-art-6", foregroundPosition: "45% 42%", mask: ELLIPSE("45%", "45%", "72%", "42%"), width: "80%", overlapTop: "8rem", rotateX: 7 },

  // —— Dissection: hand/specimen emerges from candlelit table ——
  "p-anatomy-shoulder": {
    stage: "dissection",
    backgroundKey: "anatomy-shoulder",
    backgroundPosition: "50% 55%",
    foregroundKey: "anatomy-shoulder",
    foregroundPosition: "50% 38%",
    mask: ELLIPSE("50%", "35%", "58%", "50%"),
    width: "70%",
    overlapTop: "7rem",
    rotateX: 14,
  },
  "p-skull-sections": {
    stage: "dissection",
    backgroundKey: "skull-sections",
    foregroundKey: "skull-sections",
    foregroundPosition: "50% 42%",
    mask: ELLIPSE("50%", "40%", "50%", "48%"),
    width: "64%",
    overlapTop: "7rem",
    rotateX: 13,
  },
  "p-heart-blood": {
    stage: "dissection",
    backgroundKey: "heart-blood",
    foregroundKey: "heart-blood",
    foregroundPosition: "48% 45%",
    mask: ELLIPSE("48%", "42%", "52%", "46%"),
    width: "66%",
    overlapTop: "7rem",
    rotateX: 13,
  },
  "p-anatomy-eye": {
    stage: "dissection",
    backgroundKey: "anatomy-eye",
    foregroundKey: "anatomy-eye",
    foregroundPosition: "50% 32%",
    mask: ELLIPSE("50%", "30%", "48%", "44%"),
    width: "62%",
    overlapTop: "7rem",
    rotateX: 14,
  },
  "p-anatomy-embryo": {
    stage: "dissection",
    backgroundKey: "anatomy-embryo",
    foregroundKey: "anatomy-embryo",
    foregroundPosition: "50% 50%",
    mask: ELLIPSE("50%", "48%", "54%", "46%"),
    width: "64%",
    overlapTop: "7rem",
    rotateX: 12,
  },
  "c-anatomy-1": { stage: "dissection", backgroundKey: "codex-anatomy-1", foregroundKey: "codex-anatomy-1", foregroundPosition: "50% 36%", mask: ELLIPSE("50%", "34%", "60%", "52%"), width: "72%", overlapTop: "7rem", rotateX: 14 },
  "c-anatomy-2": { stage: "dissection", backgroundKey: "codex-anatomy-2", foregroundKey: "codex-anatomy-2", foregroundPosition: "48% 40%", mask: ELLIPSE("48%", "38%", "55%", "48%"), width: "68%", overlapTop: "7rem", rotateX: 13 },
  "c-anatomy-3": { stage: "dissection", backgroundKey: "codex-anatomy-3", foregroundKey: "codex-anatomy-3", foregroundPosition: "50% 35%", mask: ELLIPSE("50%", "33%", "58%", "50%"), width: "70%", overlapTop: "7rem", rotateX: 14 },
  "c-anatomy-4": { stage: "dissection", backgroundKey: "codex-anatomy-4", foregroundKey: "codex-anatomy-4", foregroundPosition: "50% 30%", mask: ELLIPSE("50%", "28%", "50%", "46%"), width: "64%", overlapTop: "7rem", rotateX: 14 },
  "c-anatomy-5": { stage: "dissection", backgroundKey: "codex-anatomy-5", foregroundKey: "codex-anatomy-5", foregroundPosition: "50% 48%", mask: ELLIPSE("50%", "46%", "52%", "44%"), width: "66%", overlapTop: "7rem", rotateX: 12 },
  "c-anatomy-6": { stage: "dissection", backgroundKey: "codex-anatomy-6", foregroundKey: "codex-anatomy-6", foregroundPosition: "50% 42%", mask: ELLIPSE("50%", "40%", "54%", "48%"), width: "68%", overlapTop: "7rem", rotateX: 13 },

  // —— Workshop: codex sketch in frame → modern machine pops out ——
  "c-eng-1": {
    stage: "workshop",
    backgroundKey: "codex-eng-1",
    backgroundPosition: "50% 45%",
    foregroundKey: "modern-helicopter",
    foregroundPosition: "50% 40%",
    mask: ELLIPSE("50%", "38%", "75%", "48%"),
    width: "82%",
    overlapTop: "6.5rem",
    rotateX: 12,
    modernLabel: "helicopter",
  },
  "c-eng-2": {
    stage: "workshop",
    backgroundKey: "codex-eng-2",
    foregroundKey: "modern-turbine",
    foregroundPosition: "50% 45%",
    mask: ELLIPSE("50%", "42%", "60%", "44%"),
    width: "70%",
    overlapTop: "7rem",
    rotateX: 10,
    modernLabel: "hydroelectric turbine",
  },
  "c-eng-3": {
    stage: "workshop",
    backgroundKey: "codex-eng-3",
    foregroundKey: "modern-tank",
    foregroundPosition: "50% 42%",
    mask: ELLIPSE("50%", "40%", "72%", "46%"),
    width: "78%",
    overlapTop: "6.5rem",
    rotateX: 11,
    modernLabel: "armoured vehicle",
  },
  "c-eng-4": {
    stage: "workshop",
    backgroundKey: "codex-eng-4",
    foregroundKey: "modern-drone",
    foregroundPosition: "50% 35%",
    mask: ELLIPSE("50%", "32%", "55%", "42%"),
    width: "64%",
    overlapTop: "6.5rem",
    rotateX: 13,
    modernLabel: "drone",
  },
  "c-eng-5": {
    stage: "workshop",
    backgroundKey: "codex-eng-5",
    foregroundKey: "modern-canal-lock",
    foregroundPosition: "50% 50%",
    mask: ELLIPSE("50%", "48%", "68%", "40%"),
    width: "74%",
    overlapTop: "7rem",
    rotateX: 9,
    modernLabel: "canal lock",
  },
  "c-eng-6": {
    stage: "workshop",
    backgroundKey: "codex-eng-6",
    foregroundKey: "modern-fossil-display",
    foregroundPosition: "50% 45%",
    mask: ELLIPSE("50%", "42%", "58%", "44%"),
    width: "68%",
    overlapTop: "7rem",
    rotateX: 10,
    modernLabel: "geological specimen",
  },
};

export function visualForFolio(folioId: string, imageKey: string): FolioVisual {
  return (
    FOLIO_VISUALS[folioId] ?? {
      stage: "studio",
      backgroundKey: imageKey,
      foregroundKey: imageKey,
      foregroundPosition: "50% 35%",
      mask: ELLIPSE("50%", "32%", "55%", "48%"),
      width: "68%",
      overlapTop: "7.5rem",
      rotateX: 10,
    }
  );
}
