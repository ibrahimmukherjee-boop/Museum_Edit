import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ProviderBadge } from "../components/ProviderBadge";
import { GlassPanel } from "../components/GlassPanel";
import { LuminousShimmerOverlay } from "../components/LuminousShimmerOverlay";
import { MuseumNav } from "../components/MuseumNav";
import { TypewriterText } from "../components/TypewriterText";
import { demoLeonardoReply } from "../lib/demoResponses";
import { askLeonardo } from "../lib/leonardoChat";
import { stripMuseumNavMarkers } from "../lib/museumNavigation";
import { LEONARDO_GREETING, STARTER_QUESTIONS } from "../lib/prompt";
import { DEFAULT_SETTINGS, loadSettings, saveSettings, type KioskSettings } from "../lib/settings";
import { localLlmReady } from "../cortex/localLlm";

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
  const [lastProvider, setLastProvider] = useState("cortex");
  const [typingId, setTypingId] = useState<string | null>(null);
  const [localModelStatus, setLocalModelStatus] = useState<"unknown" | "ready" | "offline">("unknown");
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

  useEffect(() => {
    if (!settings.useLocalModel) {
      setLocalModelStatus("unknown");
      return;
    }
    let cancelled = false;
    localLlmReady({ baseUrl: settings.localModelUrl }).then((ready) => {
      if (!cancelled) setLocalModelStatus(ready ? "ready" : "offline");
    });
    return () => {
      cancelled = true;
    };
  }, [settings.useLocalModel, settings.localModelUrl, settings.localModelName]);

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
    let provider = "cortex";
    try {
      if (settings.devMode) {
        reply = demoLeonardoReply(t);
      } else {
        const history = nextTurns.map((m) => ({ role: m.role, content: m.content }));
        const result = await askLeonardo({ question: t, history });
        reply = result.reply || demoLeonardoReply(t);
        provider = result.provider;
        setLastProvider(provider);
      }
    } catch {
      reply = demoLeonardoReply(t);
    }

    reply = stripMuseumNavMarkers(reply);
    const aid = `a-${Date.now()}`;
    setTurns((prev) => [...prev, { id: aid, role: "assistant", content: reply }]);
    setTypingId(aid);
    setLoading(false);

    // Surface provider in console for debugging
    console.log(`[leonardo] provider: ${provider}`);
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
    <div className="parlor-luminous flex min-h-screen flex-col">
      <header className="relative z-10 px-4 pt-4 pb-2">
        <MuseumNav theme="light" />
        <div className="mx-auto mt-4 flex max-w-2xl items-start justify-between gap-4">
          <div>
            <p className="font-[Cinzel] text-[0.65rem] tracking-[0.2em] text-[#2a2218]/45 uppercase">In Conversation With</p>
            <h1 className="font-[Cinzel] text-2xl text-[#2a2218] text-glow">Leonardo da Vinci</h1>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1 text-sm text-[#2a2218]/55">
            <ProviderBadge provider={lastProvider} />
            <div className="flex items-center gap-2">
            <span>
              {userTurns} / {settings.maxTurns}
            </span>
            <button type="button" className="text-amber-300/80 underline-offset-2 hover:underline" onClick={reset}>
              New
            </button>
            <button
              type="button"
              className="rounded border border-white/15 px-2 py-1 text-amber-100/80 transition hover:bg-white/10"
              aria-label="Settings"
              onClick={() => setSettingsOpen(true)}
            >
              ⚙
            </button>
            </div>
          </div>
        </div>
      </header>

      <section className="relative z-10 mx-auto w-full max-w-2xl flex-1 space-y-4 overflow-y-auto px-4 py-4" aria-label="Conversation">
        {turns.map((turn) =>
          turn.role === "user" ? (
            <div key={turn.id} className="ml-auto max-w-[88%] rounded-2xl rounded-br-sm border border-[#2c3e5c]/15 bg-[#2c3e5c]/92 px-4 py-3 text-right font-serif text-base text-[#f0ebe3] shadow-[0_4px_20px_rgba(44,62,92,0.15)]">
              {turn.content}
            </div>
          ) : (
            <GlassPanel key={turn.id} variant="cream" className="relative max-w-[92%] overflow-hidden p-4">
              <LuminousShimmerOverlay radius={14} />
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
            <p className="mt-1 font-serif text-base italic text-[#2a2218]/55">Leonardo is thinking…</p>
          </GlassPanel>
        )}
        {turns.length === 1 && !loading && (
          <div className="space-y-2 pt-2">
            <p className="text-sm text-[#2a2218]/45">Or begin with…</p>
            {STARTER_QUESTIONS.map((q) => (
              <button
                key={q}
                type="button"
                className="block w-full rounded-xl border border-amber-900/10 bg-white/65 px-3 py-2.5 text-left text-sm text-[#2a2218] transition hover:bg-white/90 hover:glow-amber"
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
        className="relative z-20 flex gap-2 border-t border-amber-900/10 bg-white/78 px-4 py-3 backdrop-blur-xl"
        onSubmit={onSubmit}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Leonardo…"
          disabled={loading || userTurns >= settings.maxTurns}
          aria-label="Your question for Leonardo"
          className="flex-1 rounded-xl border border-amber-900/12 bg-white/85 px-3 py-3 font-serif text-base text-[#2a2218] placeholder:text-[#2a2218]/35 focus:outline-none focus:ring-1 focus:ring-amber-500/35"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          aria-label="Send"
          className="w-12 rounded-xl bg-amber-700/90 text-amber-50 shadow-[0_0_20px_rgba(180,120,40,0.25)] transition hover:bg-amber-600/90 disabled:opacity-35"
        >
          ➤
        </button>
      </form>
      <p className="relative z-20 pb-2 text-center text-xs text-[#2a2218]/35">Press Enter to send</p>

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

            <label className="mt-4 flex items-center justify-between gap-3 text-sm">
              <span>Enhanced SLM voice (slower ~60s)</span>
              <input
                type="checkbox"
                checked={settings.useLlmPolish}
                onChange={(e) => patchSettings({ useLlmPolish: e.target.checked })}
              />
            </label>
            <p className="mt-1 text-xs text-[#2a2218]/50">
              Off by default for instant CORTEX replies. SLM (qwen2.5:3b) runs on the museum server when enabled.
            </p>

            <label className="mt-4 flex items-center justify-between gap-3 text-sm">
              <span>Use local SLM (Ollama dev)</span>
              <input type="checkbox" checked={settings.useLocalModel} onChange={(e) => patchSettings({ useLocalModel: e.target.checked })} />
            </label>
            <p className="mt-1 text-xs text-[#2a2218]/50">Dev only — polish via browser localhost Ollama.</p>

            {settings.useLocalModel && (
              <>
                <label className="mt-3 block text-sm">
                  Model URL
                  <input
                    type="text"
                    value={settings.localModelUrl}
                    onChange={(e) => patchSettings({ localModelUrl: e.target.value })}
                    className="mt-1 w-full rounded border border-[#2a2218]/20 bg-white/60 px-2 py-1.5 text-sm"
                    placeholder="http://127.0.0.1:11434"
                  />
                </label>
                <label className="mt-2 block text-sm">
                  Model name
                  <input
                    type="text"
                    value={settings.localModelName}
                    onChange={(e) => patchSettings({ localModelName: e.target.value })}
                    className="mt-1 w-full rounded border border-[#2a2218]/20 bg-white/60 px-2 py-1.5 text-sm"
                    placeholder="glm-5.2:cloud"
                  />
                </label>
                <p className="mt-2 text-xs">
                  Status:{" "}
                  <span
                    className={
                      localModelStatus === "ready"
                        ? "text-green-700"
                        : localModelStatus === "offline"
                          ? "text-red-700"
                          : "text-[#2a2218]/50"
                    }
                  >
                    {localModelStatus === "ready" ? "Reachable" : localModelStatus === "offline" ? "Unreachable" : "Checking…"}
                  </span>
                </p>
              </>
            )}

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
        <Link to="/" className="text-amber-800/70 no-underline hover:text-amber-900">
          ← Museum home
        </Link>
      </footer>
    </div>
  );
}
