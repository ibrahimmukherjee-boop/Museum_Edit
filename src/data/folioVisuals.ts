/** Per-folio visual config: true out-of-frame pop-out (not full-image zoom). */
export type StageMode = "studio" | "dissection" | "workshop";

/** Normalised ellipse crop — one subject element per folio (foot, face, machine…). */
export interface SubjectCrop {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
}

export interface FolioVisual {
  stage: StageMode;
  /** Image inside the clipped frame */
  backgroundKey: string;
  backgroundPosition?: string;
  /** Isolated subject that breaks OUT of the frame */
  foregroundKey: string;
  foregroundPosition: string;
  /** CSS mask isolates subject silhouette (ellipse), like the squirrel matte */
  mask?: string;
  /** 3D mesh crop region (matches mask ellipse) */
  subjectCrop: SubjectCrop;
  /** Human label for the isolated 3D element */
  subjectElement: string;
  width?: string;
  /** Where the foreground layer anchors — top offset from frame bottom edge */
  overlapTop?: string;
  rotateX?: number;
  /** Workshop only: label for sketch → today mapping */
  modernLabel?: string;
}

const ELLIPSE = (x: string, y: string, w: string, h: string) =>
  `radial-gradient(ellipse ${w} ${h} at ${x} ${y}, #000 58%, transparent 72%)`;

const CROP = (x: string, y: string, w: string, h: string): SubjectCrop => ({
  cx: parseFloat(x) / 100,
  cy: parseFloat(y) / 100,
  rx: (parseFloat(w) / 100) * 0.5,
  ry: (parseFloat(h) / 100) * 0.5,
});

export const FOLIO_VISUALS: Record<string, FolioVisual> = {
  // —— Studio: painting subjects pop from panel ——
  "p-annunciation": {
    stage: "studio",
    backgroundKey: "annunciation",
    backgroundPosition: "50% 35%",
    foregroundKey: "annunciation",
    foregroundPosition: "35% 20%",
    mask: ELLIPSE("40%", "30%", "55%", "48%"),
    subjectCrop: CROP("40%", "30%", "55%", "48%"),
    subjectElement: "Gabriel & Mary",
    width: "72%",
    overlapTop: "7rem",
    rotateX: 10,
  },
  "p-last-supper": {
    stage: "studio",
    backgroundKey: "last-supper-hires",
    backgroundPosition: "50% 35%",
    foregroundKey: "last-supper-hires",
    foregroundPosition: "48% 22%",
    mask: ELLIPSE("50%", "30%", "50%", "42%"),
    subjectCrop: CROP("50%", "30%", "50%", "42%"),
    subjectElement: "Christ at table",
    width: "76%",
    overlapTop: "7rem",
    rotateX: 9,
  },
  "p-mona-lisa": {
    stage: "studio",
    backgroundKey: "mona-lisa",
    backgroundPosition: "50% 25%",
    foregroundKey: "mona-lisa",
    foregroundPosition: "50% 15%",
    mask: ELLIPSE("50%", "24%", "36%", "34%"),
    subjectCrop: CROP("50%", "24%", "36%", "34%"),
    subjectElement: "Mona Lisa face",
    width: "62%",
    overlapTop: "6.5rem",
    rotateX: 11,
  },
  "p-vitruvian-man": {
    stage: "studio",
    backgroundKey: "vitruvian-man-hires",
    backgroundPosition: "50% 50%",
    foregroundKey: "vitruvian-man-hires",
    foregroundPosition: "50% 42%",
    mask: ELLIPSE("50%", "45%", "48%", "55%"),
    subjectCrop: CROP("50%", "45%", "48%", "55%"),
    subjectElement: "Vitruvian figure",
    width: "74%",
    overlapTop: "7rem",
    rotateX: 8,
  },
  "p-lady-ermine": {
    stage: "studio",
    backgroundKey: "lady-ermine",
    backgroundPosition: "50% 30%",
    foregroundKey: "lady-ermine",
    foregroundPosition: "45% 18%",
    mask: ELLIPSE("48%", "26%", "46%", "50%"),
    subjectCrop: CROP("48%", "26%", "46%", "50%"),
    subjectElement: "Cecilia & ermine",
    width: "66%",
    overlapTop: "6.5rem",
    rotateX: 11,
  },
  "p-saint-john": {
    stage: "studio",
    backgroundKey: "saint-john",
    backgroundPosition: "50% 28%",
    foregroundKey: "saint-john",
    foregroundPosition: "50% 18%",
    mask: ELLIPSE("50%", "26%", "44%", "52%"),
    subjectCrop: CROP("50%", "26%", "44%", "52%"),
    subjectElement: "Saint John",
    width: "64%",
    overlapTop: "6.5rem",
    rotateX: 11,
  },
  "p-battle-anghiari": {
    stage: "studio",
    backgroundKey: "battle-anghiari",
    backgroundPosition: "50% 35%",
    foregroundKey: "battle-anghiari",
    foregroundPosition: "50% 28%",
    mask: ELLIPSE("50%", "30%", "56%", "44%"),
    subjectCrop: CROP("50%", "30%", "56%", "44%"),
    subjectElement: "warriors & horses",
    width: "76%",
    overlapTop: "7rem",
    rotateX: 9,
  },
  "p-virgin-rocks": {
    stage: "studio",
    backgroundKey: "virgin-of-rocks-hires",
    backgroundPosition: "50% 30%",
    foregroundKey: "virgin-of-rocks-hires",
    foregroundPosition: "50% 22%",
    mask: ELLIPSE("50%", "28%", "50%", "46%"),
    subjectCrop: CROP("50%", "28%", "50%", "46%"),
    subjectElement: "Virgin & infants",
    width: "70%",
    overlapTop: "7rem",
    rotateX: 10,
  },

  // —— Dissection: specimen/emerges from candlelit table ——
  "c-anatomy-1": {
    stage: "dissection",
    backgroundKey: "anatomy-shoulder",
    backgroundPosition: "50% 45%",
    foregroundKey: "anatomy-shoulder",
    foregroundPosition: "50% 32%",
    mask: ELLIPSE("50%", "30%", "58%", "52%"),
    subjectCrop: CROP("50%", "30%", "58%", "52%"),
    subjectElement: "shoulder muscles",
    width: "72%",
    overlapTop: "6.5rem",
    rotateX: 14,
  },
  "c-anatomy-2": {
    stage: "dissection",
    backgroundKey: "heart-blood",
    backgroundPosition: "50% 48%",
    foregroundKey: "heart-blood",
    foregroundPosition: "48% 38%",
    mask: ELLIPSE("48%", "36%", "54%", "50%"),
    subjectCrop: CROP("48%", "36%", "54%", "50%"),
    subjectElement: "heart",
    width: "68%",
    overlapTop: "7rem",
    rotateX: 13,
  },
  "c-anatomy-3": {
    stage: "dissection",
    backgroundKey: "skull-sections",
    backgroundPosition: "50% 50%",
    foregroundKey: "skull-sections",
    foregroundPosition: "50% 42%",
    mask: ELLIPSE("50%", "40%", "52%", "48%"),
    subjectCrop: CROP("50%", "40%", "52%", "48%"),
    subjectElement: "skull",
    width: "66%",
    overlapTop: "7rem",
    rotateX: 13,
  },
  "c-anatomy-4": {
    stage: "dissection",
    backgroundKey: "anatomy-eye",
    backgroundPosition: "50% 38%",
    foregroundKey: "anatomy-eye",
    foregroundPosition: "50% 28%",
    mask: ELLIPSE("50%", "26%", "48%", "46%"),
    subjectCrop: CROP("50%", "26%", "48%", "46%"),
    subjectElement: "eye",
    width: "62%",
    overlapTop: "6.5rem",
    rotateX: 14,
  },
  "c-anatomy-5": {
    stage: "dissection",
    backgroundKey: "anatomy-embryo",
    backgroundPosition: "50% 55%",
    foregroundKey: "anatomy-embryo",
    foregroundPosition: "50% 45%",
    mask: ELLIPSE("50%", "44%", "54%", "48%"),
    subjectCrop: CROP("50%", "44%", "54%", "48%"),
    subjectElement: "embryo",
    width: "66%",
    overlapTop: "7rem",
    rotateX: 12,
  },
  "c-anatomy-6": {
    stage: "dissection",
    backgroundKey: "anatomy-thigh",
    backgroundPosition: "50% 45%",
    foregroundKey: "anatomy-thigh",
    foregroundPosition: "50% 32%",
    mask: ELLIPSE("50%", "30%", "54%", "54%"),
    subjectCrop: CROP("50%", "30%", "54%", "54%"),
    subjectElement: "thigh sinews",
    width: "70%",
    overlapTop: "6.5rem",
    rotateX: 14,
  },
  "c-anatomy-7": {
    stage: "dissection",
    backgroundKey: "anatomy-foot-calf",
    backgroundPosition: "50% 42%",
    foregroundKey: "anatomy-foot-calf",
    foregroundPosition: "50% 30%",
    mask: ELLIPSE("50%", "30%", "52%", "56%"),
    subjectCrop: CROP("50%", "32%", "48%", "50%"),
    subjectElement: "foot & calf",
    width: "68%",
    overlapTop: "6.5rem",
    rotateX: 13,
  },
  "c-anatomy-8": {
    stage: "dissection",
    backgroundKey: "anatomy-bears-foot",
    backgroundPosition: "50% 48%",
    foregroundKey: "anatomy-bears-foot",
    foregroundPosition: "50% 35%",
    mask: ELLIPSE("50%", "34%", "56%", "50%"),
    subjectCrop: CROP("50%", "34%", "56%", "50%"),
    subjectElement: "bear's foot",
    width: "70%",
    overlapTop: "7rem",
    rotateX: 13,
  },

  // —— Workshop: codex sketch in frame → machine rises out ——
  "c-eng-1": {
    stage: "workshop",
    backgroundKey: "ornithopter",
    backgroundPosition: "50% 45%",
    foregroundKey: "ornithopter",
    foregroundPosition: "50% 35%",
    mask: ELLIPSE("50%", "32%", "72%", "50%"),
    subjectCrop: CROP("50%", "30%", "66%", "48%"),
    subjectElement: "ornithopter wings",
    width: "80%",
    overlapTop: "6rem",
    rotateX: 12,
    modernLabel: "helicopter",
  },
  "c-eng-2": {
    stage: "workshop",
    backgroundKey: "tank",
    backgroundPosition: "50% 48%",
    foregroundKey: "tank",
    foregroundPosition: "50% 38%",
    mask: ELLIPSE("50%", "36%", "68%", "46%"),
    subjectCrop: CROP("50%", "36%", "68%", "46%"),
    subjectElement: "tank treads",
    width: "78%",
    overlapTop: "6.5rem",
    rotateX: 10,
    modernLabel: "armoured vehicle",
  },
  "c-eng-3": {
    stage: "workshop",
    backgroundKey: "water-study",
    backgroundPosition: "50% 50%",
    foregroundKey: "water-study",
    foregroundPosition: "50% 40%",
    mask: ELLIPSE("50%", "36%", "62%", "48%"),
    subjectCrop: CROP("50%", "36%", "62%", "48%"),
    subjectElement: "water vortex",
    width: "74%",
    overlapTop: "7rem",
    rotateX: 9,
    modernLabel: "hydroelectric turbine",
  },
  "c-eng-4": {
    stage: "workshop",
    backgroundKey: "water-screw",
    backgroundPosition: "50% 45%",
    foregroundKey: "water-screw",
    foregroundPosition: "50% 35%",
    mask: ELLIPSE("50%", "32%", "58%", "50%"),
    subjectCrop: CROP("50%", "32%", "58%", "50%"),
    subjectElement: "Archimedes screw",
    width: "70%",
    overlapTop: "6.5rem",
    rotateX: 11,
    modernLabel: "irrigation pump",
  },
  "c-eng-5": {
    stage: "workshop",
    backgroundKey: "flying-machine",
    backgroundPosition: "50% 42%",
    foregroundKey: "flying-machine",
    foregroundPosition: "50% 32%",
    mask: ELLIPSE("50%", "30%", "64%", "52%"),
    subjectCrop: CROP("50%", "28%", "58%", "46%"),
    subjectElement: "flying machine",
    width: "76%",
    overlapTop: "6rem",
    rotateX: 12,
    modernLabel: "helicopter",
  },
  "c-eng-6": {
    stage: "workshop",
    backgroundKey: "crossbow",
    backgroundPosition: "50% 40%",
    foregroundKey: "crossbow",
    foregroundPosition: "50% 30%",
    mask: ELLIPSE("50%", "30%", "66%", "48%"),
    subjectCrop: CROP("50%", "30%", "66%", "48%"),
    subjectElement: "giant crossbow",
    width: "78%",
    overlapTop: "6.5rem",
    rotateX: 10,
    modernLabel: "siege engine",
  },
  "c-eng-7": {
    stage: "workshop",
    backgroundKey: "bridge",
    backgroundPosition: "50% 45%",
    foregroundKey: "bridge",
    foregroundPosition: "50% 35%",
    mask: ELLIPSE("50%", "34%", "70%", "46%"),
    subjectCrop: CROP("50%", "34%", "70%", "46%"),
    subjectElement: "bridge span",
    width: "78%",
    overlapTop: "7rem",
    rotateX: 9,
    modernLabel: "span bridge",
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
      subjectCrop: CROP("50%", "32%", "55%", "48%"),
      subjectElement: "subject",
      width: "68%",
      overlapTop: "7rem",
      rotateX: 10,
    }
  );
}
