import { Link } from "react-router-dom";
import { GlassPanel } from "../components/GlassPanel";
import { LuminousShimmerOverlay } from "../components/LuminousShimmerOverlay";
import { MuseumNav } from "../components/MuseumNav";
import { getSession } from "../lib/auth";

const ROOMS = [
  { domain: "art", title: "The Studio", sub: "North light, wet pigment, panels that breathe", art: "annunciation" },
  { domain: "anatomy", title: "The Dissection Table", sub: "Candlelight at Santa Maria Nuova", art: "anatomy-shoulder" },
  { domain: "engineering", title: "The Workshop", sub: "Notebook sketches become machines", art: "ornithopter" },
] as const;

export default function AtelierHubPage() {
  const visitor = getSession()?.name ?? "Guest";

  return (
    <div className="atelier-luminous relative min-h-screen">
      <div className="relative z-10 mx-auto max-w-lg px-4 pb-16 pt-6">
        <MuseumNav theme="light" />
        <GlassPanel variant="cream" className="relative mt-8 overflow-hidden p-8 text-center">
          <LuminousShimmerOverlay radius={16} />
          <p className="font-[Cinzel] text-[0.65rem] tracking-[0.24em] text-[#2a2218]/45 uppercase">The Atelier</p>
          <h1 className="mt-2 font-[Cinzel] text-2xl text-[#2a2218] text-glow">Work beside Leonardo</h1>
          <p className="mt-4 font-serif text-base leading-relaxed text-[#2a2218]/70">
            Welcome, {visitor}. Choose a workshop — tap glowing points on paintings and notebooks. His work will lean toward
            you from the frame.
          </p>
          <div className="mt-8 flex flex-col gap-3 text-left">
            {ROOMS.map((r) => (
              <Link
                key={r.domain}
                to={`/atelier/${r.domain}`}
                className="group atelier-hub-card flex items-center gap-4 rounded-2xl border border-amber-900/10 bg-white/55 p-3 no-underline transition hover:bg-white/80 hover:glow-amber"
              >
                <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl">
                  <img
                    src={`${import.meta.env.BASE_URL}art/${r.art}.jpg`}
                    alt=""
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                  />
                  <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-white/20" />
                </div>
                <div>
                  <h2 className="font-[Cinzel] text-base text-[#2a2218]">{r.title}</h2>
                  <p className="mt-0.5 text-sm italic text-[#2a2218]/50">{r.sub}</p>
                </div>
              </Link>
            ))}
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}
