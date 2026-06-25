import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { GlassPanel } from "../components/GlassPanel";
import { MuseumNav } from "../components/MuseumNav";
import { TypewriterText } from "../components/TypewriterText";
import { demoLeonardoReply } from "../lib/demoResponses";
import { askLeonardo } from "../lib/leonardoChat";
import { stripMuseumNavMarkers } from "../lib/museumNavigation";
import { LEONARDO_GREETING, STARTER_QUESTIONS } from "../lib/prompt";
import { DEFAULT_SETTINGS, loadSettings, saveSettings, type KioskSettings } from "../lib/settings";

interface Turn {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function ConversationPage() {
  const [settings, setSettings] = useState<KioskSettings>(loadSettings);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([
    { id: "greeting", role: "assistant", content: LEONARDO_GREETING },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [typingId, setTypingId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const userTurns = turns.filter((t) => t.role === "user").length;

  const scrollBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollBottom();
  }, [turns, loading, scrollBottom]);

  useEffect(() => {
    const ms = settings.inactivityTimeoutMs;
    const id = window.setTimeout(() => {
      setTurns([{ id: "greeting", role: "assistant", content: LEONARDO_GREETING }]);
      setInput("");
      setTypingId(null);
    }, ms);
    return () => window.clearTimeout(id);
  }, [turns, settings.inactivityTimeoutMs]);

  const send = async (text: string) => {
    const t = text.trim();
    if (!t || loading) return;
    if (userTurns >= settings.maxTurns) return;

    const userId = `u-${Date.now()}`;
    const nextTurns: Turn[] = [...turns, { id: userId, role: "user", content: t }];
    setTurns(nextTurns);
    setInput("");
    setLoading(true);

    let reply: string;
    try {
      if (settings.devMode) {
        reply = demoLeonardoReply(t);
      } else {
        const history = nextTurns.map((m) => ({ role: m.role, content: m.content }));
        const result = await askLeonardo({ question: t, history, useLlmPolish: true });
        reply = result.reply || demoLeonardoReply(t);
      }
    } catch {
      reply = demoLeonardoReply(t);
    }

    reply = stripMuseumNavMarkers(reply);
    const aid = `a-${Date.now()}`;
    setTurns((prev) => [...prev, { id: aid, role: "assistant", content: reply }]);
    setTypingId(aid);
    setLoading(false);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void send(input);
  };

  const reset = () => {
    setTurns([{ id: "greeting", role: "assistant", content: LEONARDO_GREETING }]);
    setInput("");
    setTypingId(null);
  };

  const patchSettings = (patch: Partial<KioskSettings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    saveSettings(next);
  };

  return (
    <div className="journey-ambient flex min-h-screen flex-col">
      <header className="relative z-10 px-4 pt-4 pb-2">
        <MuseumNav theme="dark" />
        <div className="mx-auto mt-4 flex max-w-2xl items-start justify-between gap-4">
          <div>
            <p className="font-[Cinzel] text-[0.65rem] tracking-[0.2em] text-amber-200/50 uppercase">In Conversation With</p>
            <h1 className="font-[Cinzel] text-2xl text-amber-50">Leonardo da Vinci</h1>
          </div>
          <div className="flex shrink-0 items-center gap-2 text-sm text-amber-200/60">
            <span>
              {userTurns} / {settings.maxTurns}
            </span>
            <button type="button" className="text-amber-300/80 underline-offset-2 hover:underline" onClick={reset}>
              New
            </button>
            <button
              type="button"
              className="rounded border border-white/15 px-2 py-1 text-amber-100/80"
              aria-label="Settings"
              onClick={() => setSettingsOpen(true)}
            >
              ⚙
            </button>
          </div>
        </div>
      </header>

      <section className="relative z-10 mx-auto w-full max-w-2xl flex-1 space-y-4 overflow-y-auto px-4 py-4" aria-label="Conversation">
        {turns.map((turn) =>
          turn.role === "user" ? (
            <div key={turn.id} className="ml-auto max-w-[88%] rounded-2xl rounded-br-sm border border-amber-200/20 bg-amber-100/15 px-4 py-3 text-right font-serif text-base text-amber-50 backdrop-blur-md">
              {turn.content}
            </div>
          ) : (
            <GlassPanel key={turn.id} variant="cream" className="max-w-[92%] p-4">
              <span className="block font-[Cinzel] text-[0.65rem] tracking-[0.18em] text-[#2a2218]/45 uppercase">Leonardo</span>
              {turn.id === typingId ? (
                <TypewriterText
                  text={turn.content}
                  speedMs={settings.typewriterSpeedMs}
                  onComplete={() => setTypingId(null)}
                  className="mt-1 font-serif text-lg leading-relaxed text-[#2a2218] first-letter:float-left first-letter:font-[Cinzel] first-letter:text-4xl first-letter:pr-2 first-letter:text-[#2a2218]/75"
                />
              ) : (
                <p className="mt-1 font-serif text-lg leading-relaxed text-[#2a2218] first-letter:float-left first-letter:font-[Cinzel] first-letter:text-4xl first-letter:pr-2 first-letter:text-[#2a2218]/75">
                  {turn.content}
                </p>
              )}
            </GlassPanel>
          ),
        )}
        {loading && (
          <GlassPanel variant="cream" className="max-w-[92%] p-4">
            <span className="block font-[Cinzel] text-[0.65rem] tracking-[0.18em] text-[#2a2218]/45 uppercase">Leonardo</span>
            <p className="mt-1 italic text-[#2a2218]/50">✒ …</p>
          </GlassPanel>
        )}
        {turns.length === 1 && !loading && (
          <div className="space-y-2 pt-2">
            <p className="text-sm text-amber-200/50">Or begin with…</p>
            {STARTER_QUESTIONS.map((q) => (
              <button
                key={q}
                type="button"
                className="block w-full rounded border border-white/12 bg-white/6 px-3 py-2.5 text-left text-sm text-amber-50 hover:bg-white/12"
                onClick={() => void send(q)}
              >
                &ldquo;{q}&rdquo;
              </button>
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </section>

      <form
        className="relative z-20 flex gap-2 border-t border-white/10 bg-stone-950/75 px-4 py-3 backdrop-blur-xl"
        onSubmit={onSubmit}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Leonardo…"
          disabled={loading || userTurns >= settings.maxTurns}
          aria-label="Your question for Leonardo"
          className="flex-1 rounded border border-white/10 bg-white/8 px-3 py-3 font-serif text-base text-amber-50 placeholder:text-amber-200/40 focus:outline-none focus:ring-1 focus:ring-amber-400/40"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          aria-label="Send"
          className="w-12 rounded bg-amber-700/90 text-amber-50 disabled:opacity-35"
        >
          ➤
        </button>
      </form>
      <p className="relative z-20 pb-2 text-center text-xs text-amber-200/35">Press Enter to send</p>

      {settingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-6 backdrop-blur-sm" role="dialog">
          <GlassPanel variant="cream" className="w-full max-w-md p-6 text-[#2a2218]">
            <h2 className="font-[Cinzel] text-lg">Curator Settings</h2>
            <p className="mt-1 text-sm text-[#2a2218]/55">Adjust the kiosk experience.</p>
            <label className="mt-4 flex items-center justify-between gap-3 text-sm">
              <span>Demo Mode (bypass CORTEX)</span>
              <input type="checkbox" checked={settings.devMode} onChange={(e) => patchSettings({ devMode: e.target.checked })} />
            </label>
            <p className="mt-1 text-xs text-[#2a2218]/50">CORTEX is on by default. Enable Demo for offline canned replies.</p>
            <label className="mt-4 block text-sm">
              Typewriter: {settings.typewriterSpeedMs} ms/char
              <input
                type="range"
                className="mt-1 w-full"
                min={8}
                max={80}
                value={settings.typewriterSpeedMs}
                onChange={(e) => patchSettings({ typewriterSpeedMs: Number(e.target.value) })}
              />
            </label>
            <label className="mt-4 block text-sm">
              Inactivity reset: {Math.round(settings.inactivityTimeoutMs / 60_000)} min
              <input
                type="range"
                className="mt-1 w-full"
                min={60_000}
                max={900_000}
                step={60_000}
                value={settings.inactivityTimeoutMs}
                onChange={(e) => patchSettings({ inactivityTimeoutMs: Number(e.target.value) })}
              />
            </label>
            <div className="mt-6 flex gap-2">
              <button type="button" className="text-sm underline" onClick={() => patchSettings({ ...DEFAULT_SETTINGS })}>
                Restore defaults
              </button>
              <button
                type="button"
                className="ml-auto rounded bg-[#2a2218] px-4 py-2 text-sm text-amber-50"
                onClick={() => setSettingsOpen(false)}
              >
                Close
              </button>
            </div>
          </GlassPanel>
        </div>
      )}

      <footer className="relative z-10 pb-4 text-center text-sm">
        <Link to="/" className="text-amber-300/70 no-underline hover:text-amber-200">
          ← Museum home
        </Link>
      </footer>
    </div>
  );
}
