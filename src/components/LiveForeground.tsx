import type { FolioVisual } from "../data/folioVisuals";

function artUrl(key: string): string {
  return `${import.meta.env.BASE_URL ?? "./"}art/${key}.jpg`;
}

export type SubjectMotion = "blink" | "walk" | "rise" | "breakout";

export function motionForFolio(folioId: string): SubjectMotion {
  if (folioId === "p-mona-lisa" || folioId === "p-saint-john") return "blink";
  if (folioId.startsWith("c-anatomy") || folioId.includes("anatomy")) return "walk";
  if (folioId.startsWith("c-eng")) return "rise";
  return "breakout";
}

interface Props {
  visual: FolioVisual;
  folioId: string;
  alt: string;
}

/**
 * Out-of-bounds subject — breaks the video frame like the squirrel / Google Arts depth.
 * Background stays clipped inside the frame; the figure overlaps UI below.
 */
export function LiveForeground({ visual, folioId, alt }: Props) {
  const fgSrc = artUrl(visual.foregroundKey);
  const motionKind = motionForFolio(folioId);
  const isWorkshop = visual.stage === "workshop";
  const isDissection = visual.stage === "dissection";
  const isMona = folioId === "p-mona-lisa";

  const imgFilter = isWorkshop
    ? "contrast(1.16) saturate(1.2) brightness(1.1)"
    : isDissection
      ? "sepia(0.06) contrast(1.24) brightness(1.06)"
      : "contrast(1.14) saturate(1.16) brightness(1.12)";

  return (
    <div className="oob-subject-layer pointer-events-none absolute inset-x-0 z-[220]" aria-hidden={false}>
      {/* Contact shadow on the "floor" below the frame */}
      <div className="oob-contact-shadow" />

      <div
        className="oob-subject-rig mx-auto"
        style={{ width: visual.width ?? "78%", perspective: "1100px" }}
      >
        {/* Depth echo layers — volume, not flat zoom */}
        <div
          className={`oob-subject-motion oob-subject-motion--${motionKind}`}
          style={{ transformOrigin: "50% 92%" }}
        >
          {[0.55, 0.3].map((op, i) => (
            <div
              key={i}
              className="oob-depth-layer absolute inset-0"
              style={{
                opacity: op,
                transform: `translateZ(${-18 + i * 8}px) scale(${1.02 + i * 0.02})`,
                WebkitMaskImage: visual.mask,
                maskImage: visual.mask,
                backgroundImage: `url(${fgSrc})`,
                backgroundSize: "cover",
                backgroundPosition: visual.foregroundPosition,
                filter: "blur(1.5px)",
              }}
            />
          ))}

          <div
            className="oob-subject-matte relative"
            style={{
              WebkitMaskImage: visual.mask,
              maskImage: visual.mask,
              WebkitMaskSize: "100% 100%",
              maskSize: "100% 100%",
              filter:
                "drop-shadow(0 28px 48px rgba(30,18,6,0.55)) drop-shadow(0 8px 20px rgba(0,0,0,0.35))",
            }}
          >
            <img
              src={fgSrc}
              alt={alt}
              className="oob-subject-img block w-full object-cover"
              loading="eager"
              decoding="async"
              style={{
                height: isWorkshop ? "20rem" : isMona ? "19rem" : "18rem",
                objectPosition: visual.foregroundPosition,
                transform: "scale(1.62)",
                transformOrigin: visual.foregroundPosition,
                filter: imgFilter,
              }}
              onError={(e) => {
                const el = e.currentTarget;
                if (el.dataset.fallback !== "1") {
                  el.dataset.fallback = "1";
                  el.src = artUrl(visual.backgroundKey);
                }
              }}
            />

            {motionKind === "blink" ? (
              <div className={`mona-live-eyes ${isMona ? "mona-live-eyes--mona" : "mona-live-eyes--john"}`}>
                <div className="mona-blink-lid mona-blink-lid--left" />
                <div className="mona-blink-lid mona-blink-lid--right" />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
