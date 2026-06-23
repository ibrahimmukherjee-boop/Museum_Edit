import { motion } from "framer-motion";
import type { FolioVisual } from "../data/folioVisuals";

const MODERN_FALLBACK: Record<string, string> = {
  "modern-helicopter": "ornithopter",
  "modern-turbine": "water-study",
  "modern-tank": "tank",
  "modern-drone": "eng-4",
  "modern-canal-lock": "eng-5",
  "modern-fossil-display": "eng-2",
};

function artUrl(key: string): string {
  const base = import.meta.env.BASE_URL ?? "./";
  return `${base}art/${key}.jpg`;
}

interface Props {
  visual: FolioVisual;
  alt: string;
}

/**
 * Squirrel-style out-of-frame illusion:
 * - Foreground is a masked subject cutout (ellipse matte), NOT a scaled duplicate of the frame.
 * - Motion uses translateY + rotateX only — no breathing scale (that reads as zoom).
 * - Layer protrudes below the frame and overlaps folio text + composer.
 */
export function LiveForeground({ visual, alt }: Props) {
  const fgSrc = artUrl(visual.foregroundKey);
  const rotateX = visual.rotateX ?? 12;
  const isWorkshop = visual.stage === "workshop";

  return (
    <div
      className="pointer-events-none absolute inset-x-0 z-[70] flex justify-center"
      style={{ top: visual.overlapTop ?? "8.5rem" }}
    >
      <div className="relative w-full max-w-lg px-6" style={{ perspective: "1100px" }}>
        {/* Cast shadow on the UI “floor” beneath the subject */}
        <motion.div
          className="absolute left-1/2 z-0 h-5 w-[58%] -translate-x-1/2 rounded-[100%] bg-black/55 blur-2xl"
          style={{ top: "11.5rem" }}
          animate={{ scaleX: [0.9, 1.05, 0.9], opacity: [0.4, 0.65, 0.4] }}
          transition={{ duration: 4.8, ease: "easeInOut", repeat: Infinity }}
        />

        <motion.div
          className="relative z-10 mx-auto"
          style={{
            width: visual.width ?? "68%",
            transformOrigin: "50% 100%",
            transformStyle: "preserve-3d",
          }}
          animate={{
            y: [28, 4, 28],
            rotateX: [rotateX + 4, rotateX - 2, rotateX + 4],
          }}
          transition={{
            duration: 5,
            ease: [0.45, 0, 0.35, 1],
            repeat: Infinity,
          }}
        >
          <div
            className="relative overflow-visible"
            style={{
              WebkitMaskImage: visual.mask,
              maskImage: visual.mask,
              WebkitMaskSize: "100% 100%",
              maskSize: "100% 100%",
            }}
          >
            <img
              src={fgSrc}
              alt={alt}
              className="block w-full object-cover"
              style={{
                height: isWorkshop ? "15rem" : "13.5rem",
                objectPosition: visual.foregroundPosition,
                transform: "scale(1.45)",
                transformOrigin: visual.foregroundPosition,
                filter: isWorkshop
                  ? "contrast(1.12) saturate(1.15) brightness(1.02)"
                  : visual.stage === "dissection"
                    ? "sepia(0.3) contrast(1.2) brightness(0.98)"
                    : "contrast(1.1) saturate(1.05) brightness(1.04)",
              }}
            onError={(e) => {
              const el = e.currentTarget;
              const fb = MODERN_FALLBACK[visual.foregroundKey];
              if (!el.dataset.fallback && fb) {
                el.dataset.fallback = "1";
                el.src = artUrl(fb);
                return;
              }
              if (el.dataset.fallback !== "2") {
                el.dataset.fallback = "2";
                el.src = artUrl(visual.backgroundKey);
              }
            }}
            />
          </div>

          {/* Rim + depth shadow */}
          <div
            className="pointer-events-none absolute -inset-1"
            style={{
              boxShadow: isWorkshop
                ? "0 48px 80px rgba(0,0,0,0.7), 0 12px 32px rgba(0,0,0,0.45)"
                : visual.stage === "dissection"
                  ? "0 40px 72px rgba(60,15,8,0.6), 0 8px 24px rgba(255,140,60,0.15)"
                  : "0 44px 76px rgba(0,0,0,0.68), 0 10px 28px rgba(255,210,150,0.1)",
            }}
          />
        </motion.div>
      </div>
    </div>
  );
}
