import { FormEvent, useCallback, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { GlassPanel } from "../components/GlassPanel";
import { LiveFolioStage } from "../components/LiveFolioStage";
import { MuseumNav } from "../components/MuseumNav";
import { TypewriterText } from "../components/TypewriterText";
import type { LeonardoZone } from "../cortex/types";
import { askLeonardo } from "../lib/leonardoChat";
import { foliosForDomain, type WebFolio } from "../lib/folios";

export default function AtelierRoomPage() {
  const { domain } = useParams<{ domain: string }>();
  const d = (domain ?? "art") as LeonardoZone;
  const folios = foliosForDomain(d);
  const [pageIndex, setPageIndex] = useState(0);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [dialogues, setDialogues] = useState<Record<string, { q: string; a: string; streaming: boolean }>>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  const folio = folios[pageIndex] ?? null;
  const dlg = folio ? dialogues[folio.id] : undefined;

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const h = el.clientHeight;
    const idx = Math.round(el.scrollTop / h);
    setPageIndex(Math.max(0, Math.min(folios.length - 1, idx)));
  };

  const send = useCallback(
    async (text: string, label?: string) => {
      if (!folio || !text.trim() || loading) return;
      const id = folio.id;
      setDialogues((p) => ({ ...p, [id]: { q: text, a: "", streaming: true } }));
      setInput("");
      setLoading(true);
      const history =
        dlg?.q && dlg?.a
          ? [
              { role: "user" as const, content: dlg.q },
              { role: "assistant" as const, content: dlg.a },
            ]
          : [];
      const { reply } = await askLeonardo({
        question: text,
        history,
        folioContext: { title: folio.title, body: folio.body, domain: folio.domain },
        hotspotLabel: label,
        useLlmPolish: true,
      });
      setDialogues((p) => ({ ...p, [id]: { q: text, a: reply, streaming: false } }));
      setLoading(false);
    },
    [folio, loading, dlg],
  );

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void send(input);
  };

  if (!folios.length) {
    return (
      <div className="journey-ambient min-h-screen p-8 text-amber-50">
        <p>Workshop not found.</p>
        <Link to="/atelier" className="text-amber-300 underline">
          ← Atelier
        </Link>
      </div>
    );
  }

  return (
    <div className="journey-ambient flex min-h-screen flex-col">
      <header className="relative z-40 px-4 pt-3 pb-2">
        <MuseumNav theme="dark" />
        <p className="mt-2 font-serif text-base italic text-amber-100/80">
          {folio?.presenceLine ?? "Leonardo works beside you."}
        </p>
      </header>

      <div className="relative z-10 flex-1 overflow-y-auto scroll-smooth snap-y snap-mandatory" ref={scrollRef} onScroll={onScroll}>
        {folios.map((f: WebFolio, i) => {
          const d0 = dialogues[f.id];
          return (
            <section key={f.id} className="relative flex h-[calc(100vh-8.5rem)] snap-start flex-col overflow-visible px-3 pb-28 pt-2">
              <GlassPanel variant="cream" className="relative z-10 mx-auto flex h-full max-w-lg flex-col overflow-visible p-5 pl-12">
                <div className="absolute bottom-0 left-10 top-0 w-0.5 bg-red-900/25" aria-hidden />
                <div className="mb-2 flex justify-between text-xs text-red-900/50">
                  <span>
                    Fol. {i + 1}r · {i + 1} of {folios.length}
                  </span>
                  {f.year ? <span>{f.year}</span> : null}
                </div>
                <h2 className="font-[Cinzel] text-xl text-[#2a2218]">{f.title}</h2>
                {f.provenance ? <p className="mt-1 text-sm italic text-[#2a2218]/60">{f.provenance}</p> : null}

                <LiveFolioStage
                  folioId={f.id}
                  imageKey={f.imageKey}
                  title={f.title}
                  onHotspot={(prompt, label) => void send(prompt, label)}
                />

                <div className="relative z-10 mt-2 flex-1 overflow-y-auto">
                <p className="font-serif text-base leading-relaxed text-[#2a2218]">{f.body}</p>
                {f.attribution ? (
                  <p className="mt-2 text-[0.65rem] text-[#2a2218]/45">{f.attribution}</p>
                ) : null}
                {d0?.q ? <p className="mt-4 text-right text-sm italic text-[#2a2218]/70">{d0.q}</p> : null}
                {d0?.streaming && !d0.a ? <p className="italic text-[#2a2218]/45">✒ …</p> : null}
                {d0?.a ? (
                  <div className="mt-2 text-[#2a2218]">
                    <TypewriterText text={d0.a} isStreaming={d0.streaming} />
                  </div>
                ) : null}
                {!d0 && f.prompts[0] ? (
                  <button
                    type="button"
                    className="mt-4 w-full rounded border border-[#2a2218]/12 bg-white/40 px-3 py-2 text-left text-sm text-[#2a2218] hover:bg-white/60"
                    onClick={() => void send(f.prompts[0])}
                  >
                    {f.prompts[0]}
                  </button>
                ) : null}
                <p className="mt-6 text-center text-xs text-red-900/30">↑ turn the page ↑</p>
                </div>
              </GlassPanel>
            </section>
          );
        })}
      </div>

      <form
        className="relative z-50 flex gap-2 border-t border-white/10 bg-stone-950/80 px-4 py-3 backdrop-blur-xl"
        onSubmit={onSubmit}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Whisper to Leonardo…"
          disabled={loading}
          className="flex-1 rounded border border-white/10 bg-white/8 px-3 py-3 font-serif text-base text-amber-50 placeholder:text-amber-200/40 focus:outline-none focus:ring-1 focus:ring-amber-400/40"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="w-12 rounded bg-amber-700/90 text-amber-50 disabled:opacity-35"
        >
          ➤
        </button>
      </form>
    </div>
  );
}
