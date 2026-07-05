import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AtelierChatPanel, type ChatTurn } from "../components/AtelierChatPanel";
import { FolioGlassCard } from "../components/FolioGlassCard";
import { LiveFolioStage } from "../components/LiveFolioStage";
import { MuseumNav } from "../components/MuseumNav";
import type { LeonardoZone } from "../cortex/types";
import { askLeonardo } from "../lib/leonardoChat";
import { demoLeonardoReply } from "../lib/demoResponses";
import { stripMuseumNavMarkers } from "../lib/museumNavigation";
import { foliosForDomain, type WebFolio } from "../lib/folios";

const FOLIO_GREETING =
  "I work at your shoulder — ask what you see before us. I answer from the folio, the panel, the page.";

export default function AtelierRoomPage() {
  const { domain } = useParams<{ domain: string }>();
  const d = (domain ?? "art") as LeonardoZone;
  const folios = foliosForDomain(d);
  const [pageIndex, setPageIndex] = useState(0);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [typingId, setTypingId] = useState<string | null>(null);
  const [chatExpanded, setChatExpanded] = useState(true);
  const [threads, setThreads] = useState<Record<string, ChatTurn[]>>({});
  const [lastProvider, setLastProvider] = useState("cortex");
  const inputRef = useRef<HTMLInputElement>(null);
  const pendingHotspotLabel = useRef<string | undefined>(undefined);

  const folio = folios[pageIndex] ?? null;
  const turns = folio ? (threads[folio.id] ?? []) : [];

  useEffect(() => {
    setPageIndex(0);
  }, [d]);

  const ensureGreeting = useCallback((folioId: string) => {
    setThreads((p) => {
      if (p[folioId]?.length) return p;
      return { ...p, [folioId]: [{ id: `g-${folioId}`, role: "assistant", content: FOLIO_GREETING }] };
    });
  }, []);

  useEffect(() => {
    if (folio) ensureGreeting(folio.id);
  }, [folio, ensureGreeting]);

  const goTo = (idx: number) => {
    const next = Math.max(0, Math.min(folios.length - 1, idx));
    setPageIndex(next);
    const f = folios[next];
    if (f) ensureGreeting(f.id);
  };

  const send = useCallback(
    async (text: string, folioTarget: WebFolio) => {
      const t = text.trim();
      if (!t || loading) return;

      setChatExpanded(true);
      const userId = `u-${Date.now()}`;
      const current = threads[folioTarget.id] ?? [];
      const nextTurns: ChatTurn[] = [...current, { id: userId, role: "user", content: t }];
      setThreads((p) => ({ ...p, [folioTarget.id]: nextTurns }));
      setInput("");
      setLoading(true);

      const history = nextTurns.map((m) => ({ role: m.role, content: m.content }));
      const hotspotLabel = pendingHotspotLabel.current;
      pendingHotspotLabel.current = undefined;

      let reply = "";
      const aid = `a-${Date.now()}`;
      setThreads((p) => ({
        ...p,
        [folioTarget.id]: [...(p[folioTarget.id] ?? nextTurns), { id: aid, role: "assistant", content: "" }],
      }));

      try {
        const result = await askLeonardo({
          question: t,
          history,
          folioContext: {
            title: folioTarget.title,
            body: folioTarget.body,
            domain: folioTarget.domain,
          },
          hotspotLabel,
          onDraft: (draft) => {
            setThreads((p) => ({
              ...p,
              [folioTarget.id]: (p[folioTarget.id] ?? []).map((turn) =>
                turn.id === aid ? { ...turn, content: draft } : turn,
              ),
            }));
          },
          onToken: (_c, full) => {
            setThreads((p) => ({
              ...p,
              [folioTarget.id]: (p[folioTarget.id] ?? []).map((turn) =>
                turn.id === aid ? { ...turn, content: full } : turn,
              ),
            }));
          },
        });
        reply = stripMuseumNavMarkers(result.reply?.trim() || demoLeonardoReply(t));
        setLastProvider(result.provider);
        setThreads((p) => ({
          ...p,
          [folioTarget.id]: (p[folioTarget.id] ?? []).map((turn) =>
            turn.id === aid ? { ...turn, content: reply } : turn,
          ),
        }));
      } catch {
        reply = stripMuseumNavMarkers(demoLeonardoReply(t));
        setThreads((p) => ({
          ...p,
          [folioTarget.id]: (p[folioTarget.id] ?? []).map((turn) =>
            turn.id === aid ? { ...turn, content: reply } : turn,
          ),
        }));
      }

      setTypingId(aid);
      setLoading(false);
      inputRef.current?.focus();
    },
    [loading, threads],
  );

  const onHotspot = useCallback(
    (prompt: string, label: string, folioTarget: WebFolio) => {
      pendingHotspotLabel.current = label;
      void send(prompt, folioTarget);
    },
    [send],
  );

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (folio) void send(input, folio);
  };

  if (!folios.length) {
    return (
      <div className="atelier-luminous min-h-screen p-8 text-[#2a2218]">
        <p>Workshop not found.</p>
        <Link to="/atelier" className="text-amber-800 underline">
          ← Atelier
        </Link>
      </div>
    );
  }

  if (!folio) return null;

  return (
    <div className="atelier-luminous flex h-screen flex-col overflow-hidden">
      <header className="relative z-40 shrink-0 px-4 pt-3 pb-2">
        <MuseumNav theme="light" />
        <div className="mt-2 flex items-center justify-between gap-3">
          <p className="font-serif text-sm italic text-[#2a2218]/75">
            {folio.presenceLine ?? "Leonardo works beside you."}
          </p>
        </div>
      </header>

      <div className="relative z-10 min-h-0 flex-1 overflow-y-auto px-3 py-2">
        <FolioGlassCard key={folio.id} className="atelier-folio-enter mx-auto w-full max-w-lg">
          <div className="mb-1 flex justify-between text-xs text-red-900/45">
            <span>
              Fol. {pageIndex + 1}r · {pageIndex + 1} of {folios.length}
            </span>
            {folio.year ? <span>{folio.year}</span> : null}
          </div>
          <h2 className="font-[Cinzel] text-lg text-[#2a2218]">{folio.title}</h2>
          {folio.provenance ? <p className="mt-0.5 text-xs italic text-[#2a2218]/55">{folio.provenance}</p> : null}

          <LiveFolioStage
            folioId={folio.id}
            imageKey={folio.imageKey}
            title={folio.title}
            onHotspot={(prompt, label) => onHotspot(prompt, label, folio)}
          />

          <p className="mt-1 font-serif text-sm leading-relaxed text-[#2a2218]/75">{folio.body}</p>

          <div className="mt-4 flex items-center justify-between gap-2">
            <button
              type="button"
              disabled={pageIndex === 0}
              onClick={() => goTo(pageIndex - 1)}
              className="rounded-xl border border-amber-900/12 bg-white/70 px-3 py-2 text-sm text-[#2a2218] disabled:opacity-30"
            >
              ← Previous
            </button>
            <span className="text-xs text-[#2a2218]/40">
              {pageIndex + 1} / {folios.length}
            </span>
            <button
              type="button"
              disabled={pageIndex >= folios.length - 1}
              onClick={() => goTo(pageIndex + 1)}
              className="rounded-xl border border-amber-900/12 bg-white/70 px-3 py-2 text-sm text-[#2a2218] disabled:opacity-30"
            >
              Next →
            </button>
          </div>
        </FolioGlassCard>
      </div>

      <AtelierChatPanel
        folioTitle={folio.title}
        turns={turns}
        loading={loading}
        typingId={typingId}
        expanded={chatExpanded}
        provider={lastProvider}
        onToggleExpand={() => setChatExpanded((e) => !e)}
        onTypingComplete={(id) => {
          if (typingId === id) setTypingId(null);
        }}
        onStarter={(q) => void send(q, folio)}
        starters={[
          `What am I seeing in ${folio.title}?`,
          "How did you study this?",
          "What should I notice first?",
        ]}
      />

      <form
        className="atelier-composer relative z-[70] flex shrink-0 gap-2 border-t border-amber-900/10 bg-white/88 px-3 py-2.5 backdrop-blur-2xl"
        onSubmit={onSubmit}
      >
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Message Leonardo…"
          disabled={loading}
          className="flex-1 rounded-xl border border-amber-900/12 bg-white/95 px-3 py-2.5 font-serif text-base text-[#2a2218] placeholder:text-[#2a2218]/35 focus:outline-none focus:ring-1 focus:ring-amber-500/35"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="rounded-xl bg-amber-700/90 px-4 py-2.5 text-amber-50 transition hover:bg-amber-600/90 disabled:opacity-35"
        >
          {loading ? "…" : "Send"}
        </button>
      </form>
    </div>
  );
}
