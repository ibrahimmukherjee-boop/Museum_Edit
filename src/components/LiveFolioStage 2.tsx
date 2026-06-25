import { hotspotsForFolio, type Hotspot } from "../lib/hotspots";
import { visualForFolio } from "../data/folioVisuals";
import { LiveForeground } from "./LiveForeground";

interface Props {
  folioId: string;
  imageKey: string;
  title: string;
  onHotspot: (prompt: string, label: string) => void;
}

export function LiveFolioStage({ folioId, imageKey, title, onHotspot }: Props) {
  const hotspots = hotspotsForFolio(folioId);
  const visual = visualForFolio(folioId, imageKey);
  const bgSrc = `${import.meta.env.BASE_URL}art/${visual.backgroundKey}.jpg`;
  const bgPng = `${import.meta.env.BASE_URL}art/${visual.backgroundKey}.png`;

  const frameClass =
    visual.stage === "dissection"
      ? "border-red-900/35 shadow-[inset_0_0_90px_rgba(100,25,10,0.4)]"
      : visual.stage === "workshop"
        ? "border-amber-800/30 shadow-[inset_0_0_55px_rgba(0,0,0,0.45)]"
        : "border-amber-200/25 shadow-[inset_0_0_65px_rgba(0,0,0,0.38)]";

  return (
    <div className="relative z-30 my-3 min-h-[17rem] overflow-visible">
      {/* Video-frame rectangle — background only, dimmed & soft */}
      <div
        className={`relative z-10 mx-auto h-44 max-w-full overflow-hidden rounded-sm border md:h-48 ${frameClass}`}
        style={{
          maskImage: "linear-gradient(black 85%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(black 85%, transparent 100%)",
        }}
      >
        <img
          className="h-full w-full scale-105 object-cover blur-[0.5px] brightness-[0.72] saturate-[0.85]"
          src={bgSrc}
          alt={title}
          style={{ objectPosition: visual.backgroundPosition ?? "50% 40%" }}
          onError={(e) => {
            const el = e.currentTarget;
            if (!el.dataset.fallback) {
              el.dataset.fallback = "1";
              el.src = bgPng;
            }
          }}
        />
        {visual.stage === "dissection" && (
          <>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-amber-400/20 via-transparent to-red-950/50" />
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-2/5 bg-gradient-to-t from-stone-950/80 to-transparent" />
            <div className="pointer-events-none absolute left-3 top-3 h-16 w-16 rounded-full bg-amber-300/25 blur-2xl" />
          </>
        )}
        {visual.stage === "workshop" && (
          <div className="pointer-events-none absolute inset-0 bg-amber-950/25 mix-blend-multiply" />
        )}
        <div className="absolute inset-0 z-20">
          {hotspots.map((h: Hotspot) => (
            <button
              key={h.id}
              type="button"
              className="absolute cursor-pointer border-0 bg-transparent p-0"
              style={{ left: `${h.x}%`, top: `${h.y}%`, width: `${h.w}%`, height: `${h.h}%` }}
              onClick={() => onHotspot(h.prompt, h.label)}
              aria-label={h.label}
            >
              <span className="absolute inset-[10%] animate-pulse rounded-full border-2 border-amber-300/90 shadow-[0_0_18px_rgba(255,200,120,0.65)]" />
              <span className="pointer-events-none absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-stone-950/85 px-2 py-0.5 text-[0.65rem] text-amber-100">
                {h.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Masked subject breaks OUT — overlaps text & composer below */}
      <LiveForeground visual={visual} alt={title} />

      {visual.modernLabel ? (
        <p className="relative z-[65] mt-[10.5rem] text-center font-[Cinzel] text-[0.65rem] tracking-wide text-amber-900/75 uppercase">
          Leonardo&apos;s sketch → {visual.modernLabel} today
        </p>
      ) : null}

      <p className="relative z-10 mt-3 text-center text-xs italic text-[#2a2218]/50">
        Tap a glowing point to ask Leonardo
      </p>
    </div>
  );
}
