import { lazy, Suspense } from "react";
import { hotspotsForFolio, type Hotspot } from "../lib/hotspots";
import { visualForFolio } from "../data/folioVisuals";

const SubjectScene3D = lazy(() =>
  import("./SubjectScene3D").then((m) => ({ default: m.SubjectScene3D })),
);

interface Props {
  folioId: string;
  imageKey: string;
  title: string;
  onHotspot: (prompt: string, label: string) => void;
}

/**
 * Atelier stage — real WebGL mesh you can orbit (not CSS zoom).
 * Background stays in frame; 3D subject is reconstructed from the folio image.
 */
export function LiveFolioStage({ folioId, imageKey, title, onHotspot }: Props) {
  const hotspots = hotspotsForFolio(folioId);
  const visual = visualForFolio(folioId, imageKey);
  const showBlink = folioId === "p-mona-lisa" || folioId === "p-saint-john";

  return (
    <div className="oob-stage relative z-30 my-2">
      <Suspense
        fallback={
          <div className="flex h-[16rem] flex-col items-center justify-center gap-2 rounded-xl border border-white/40 bg-[#1a1510] text-sm text-white/55 md:h-[17rem]">
            <span className="font-[Cinzel] text-[0.62rem] tracking-[0.18em] uppercase">Opening folio</span>
            <span>Reconstructing subject in 3D…</span>
          </div>
        }
      >
        <SubjectScene3D visual={visual} folioId={folioId} showBlink={showBlink} />
      </Suspense>

      <div className="oob-hotspots absolute inset-0 z-[40]">
        {hotspots.map((h: Hotspot) => (
          <button
            key={h.id}
            type="button"
            className="folio-hotspot-btn group"
            style={{ left: `${h.x}%`, top: `${h.y}%`, width: `${h.w}%`, height: `${h.h}%` }}
            onClick={(e) => {
              e.stopPropagation();
              onHotspot(h.prompt, h.label);
            }}
            aria-label={h.label}
          >
            <span className="folio-hotspot-ring" />
            <span className="folio-hotspot-label">{h.label}</span>
          </button>
        ))}
      </div>

      {visual.modernLabel ? (
        <p className="relative z-10 mt-2 text-center font-[Cinzel] text-[0.6rem] tracking-[0.14em] text-amber-900/65 uppercase">
          Leonardo&apos;s sketch → {visual.modernLabel} today
        </p>
      ) : null}
    </div>
  );
}
