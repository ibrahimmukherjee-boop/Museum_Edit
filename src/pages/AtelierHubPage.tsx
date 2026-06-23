import { Link } from "react-router-dom";
import { GlassPanel } from "../components/GlassPanel";
import { MuseumNav } from "../components/MuseumNav";
import { getSession } from "../lib/auth";

const ROOMS = [
  { domain: "art", title: "The Studio", sub: "Beside the panel while he paints", art: "annunciation" },
  { domain: "anatomy", title: "The Dissection Table", sub: "Candlelight at Santa Maria Nuova", art: "anatomy-shoulder" },
  { domain: "engineering", title: "The Workshop", sub: "Notebook sketches → machines of today", art: "codex-eng-1" },
] as const;

export default function AtelierHubPage() {
  const visitor = getSession()?.name ?? "Guest";

  return (
    <div className="journey-ambient min-h-screen">
      <div className="mx-auto max-w-lg px-4 pb-16 pt-6">
        <MuseumNav theme="dark" />
        <GlassPanel variant="dark" className="mt-8 p-8 text-center">
          <p className="font-[Cinzel] text-[0.65rem] tracking-[0.22em] text-amber-200/55 uppercase">The Atelier</p>
          <h1 className="mt-2 font-[Cinzel] text-2xl text-amber-50">Work beside Leonardo</h1>
          <p className="mt-4 font-serif text-base leading-relaxed text-amber-100/75">
            Welcome, {visitor}. Choose a workshop — tap glowing points on paintings and notebooks. His work will lean toward
            you from the frame.
          </p>
          <div className="mt-8 flex flex-col gap-3 text-left">
            {ROOMS.map((r) => (
              <Link
                key={r.domain}
                to={`/atelier/${r.domain}`}
                className="flex items-center gap-4 rounded border border-white/12 bg-white/6 p-3 no-underline transition hover:bg-white/12"
              >
                <img
                  src={`${import.meta.env.BASE_URL}art/${r.art}.jpg`}
                  alt=""
                  className="h-16 w-20 shrink-0 rounded object-cover"
                  onError={(e) => {
                    e.currentTarget.src = `${import.meta.env.BASE_URL}art/${r.art}.png`;
                  }}
                />
                <div>
                  <h2 className="font-[Cinzel] text-base text-amber-50">{r.title}</h2>
                  <p className="mt-0.5 text-sm italic text-amber-200/55">{r.sub}</p>
                </div>
              </Link>
            ))}
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}
