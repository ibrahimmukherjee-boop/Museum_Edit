import { Link } from "react-router-dom";
import { GlassPanel } from "../components/GlassPanel";
import { MuseumNav } from "../components/MuseumNav";
import { getSession } from "../lib/auth";

export default function HomePage() {
  const name = getSession()?.name ?? "Guest";

  return (
    <div className="journey-ambient min-h-screen">
      <div className="mx-auto max-w-lg px-4 pb-16 pt-6">
        <MuseumNav theme="dark" />
        <GlassPanel variant="dark" className="mt-8 overflow-hidden p-8 text-center">
          <p className="font-[Cinzel] text-[0.65rem] tracking-[0.22em] text-amber-200/55 uppercase">Leonardo da Vinci Museum</p>
          <h1 className="mt-2 font-[Cinzel] text-3xl text-amber-50 text-glow">Speak with Leonardo</h1>
          <div className="mx-auto mt-6 max-w-md overflow-hidden rounded-xl border border-white/15 shadow-[0_0_40px_rgba(255,210,150,0.12)]">
            <img
              src={`${import.meta.env.BASE_URL}art/annunciation.jpg`}
              alt="The Annunciation"
              className="block w-full object-cover"
            />
          </div>
          <p className="mt-6 font-serif text-lg leading-relaxed text-amber-100/85">
            Welcome, {name}. &ldquo;Ask me anything. I have been waiting five centuries for new questions.&rdquo;
          </p>
          <p className="mt-2 font-[Cinzel] text-xs tracking-widest text-amber-200/45">Anno Domini MMXXVI</p>
          <div className="mt-8 flex flex-col gap-3">
            <Link
              to="/parlor"
              className="block rounded-xl border-2 border-amber-50 bg-stone-950 px-6 py-3.5 font-[Cinzel] text-sm font-semibold tracking-wide text-amber-50 shadow-[0_4px_24px_rgba(0,0,0,0.45),0_0_30px_rgba(255,200,120,0.15)] no-underline ring-2 ring-amber-400/50 transition hover:bg-stone-900 hover:text-white"
            >
              Enter the Parlor
            </Link>
            <Link
              to="/atelier"
              className="block rounded-xl border border-amber-200/30 bg-white/8 px-6 py-3.5 font-[Cinzel] text-sm tracking-wide text-amber-50 no-underline transition hover:bg-white/14 hover:glow-amber"
            >
              Enter the Atelier
            </Link>
          </div>
          <p className="mt-6 text-sm italic text-amber-200/50">
            Tap glowing hotspots on paintings and notebooks in the Atelier to speak with Leonardo.
          </p>
        </GlassPanel>
      </div>
    </div>
  );
}
