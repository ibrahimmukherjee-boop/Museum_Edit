import { useEffect, useRef } from "react";
import { GlassPanel } from "./GlassPanel";
import { ProviderBadge } from "./ProviderBadge";
import { LuminousShimmerOverlay } from "./LuminousShimmerOverlay";
import { TypewriterText } from "./TypewriterText";

export interface ChatTurn {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface Props {
  folioTitle: string;
  turns: ChatTurn[];
  loading: boolean;
  typingId: string | null;
  expanded: boolean;
  provider?: string;
  onToggleExpand: () => void;
  onTypingComplete: (id: string) => void;
  onStarter?: (text: string) => void;
  starters?: string[];
}

const ASSISTANT_CLASS =
  "mt-1 font-serif text-base leading-relaxed text-[#2a2218] first-letter:float-left first-letter:font-[Cinzel] first-letter:text-3xl first-letter:pr-1.5 first-letter:text-[#2a2218]/75";

/** ChatGPT-style thread — multi-turn, scrollable, expandable (Parlour parity). */
export function AtelierChatPanel({
  folioTitle,
  turns,
  loading,
  typingId,
  expanded,
  provider,
  onToggleExpand,
  onTypingComplete,
  onStarter,
  starters = [],
}: Props) {
  const endRef = useRef<HTMLDivElement>(null);
  const userCount = turns.filter((t) => t.role === "user").length;
  const showStarters = userCount === 0 && !loading && starters.length > 0;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns, loading]);

  return (
    <div
      className={`atelier-chat-panel relative z-[65] mx-2 flex flex-col overflow-hidden rounded-2xl border border-white/75 bg-white/78 shadow-[0_12px_48px_rgba(255,210,150,0.25)] backdrop-blur-2xl transition-[height] duration-300 ${
        expanded ? "h-[min(42vh,22rem)]" : "h-[3.25rem]"
      }`}
    >
      <LuminousShimmerOverlay radius={16} />
      <button
        type="button"
        className="relative z-20 flex w-full items-center justify-between px-4 py-2.5 text-left"
        onClick={onToggleExpand}
      >
        <span className="font-[Cinzel] text-[0.65rem] tracking-[0.16em] text-[#2a2218]/50 uppercase">
          Leonardo · {folioTitle}
        </span>
        <span className="flex items-center gap-2 text-xs text-[#2a2218]/40">
          {provider ? <ProviderBadge provider={provider} /> : null}
          {expanded ? "▼" : "▲"} Chat
        </span>
      </button>

      {expanded ? (
        <div className="relative z-10 flex-1 overflow-y-auto px-3 pb-3" aria-label="Conversation with Leonardo">
          <div className="space-y-3">
            {turns.map((turn) =>
              turn.role === "user" ? (
                <div
                  key={turn.id}
                  className="ml-auto max-w-[88%] rounded-2xl rounded-br-sm border border-[#2c3e5c]/15 bg-[#2c3e5c]/92 px-3.5 py-2.5 text-right shadow-[0_4px_20px_rgba(44,62,92,0.15)]"
                >
                  <p className="font-serif text-base leading-relaxed text-[#f0ebe3]">{turn.content}</p>
                </div>
              ) : (
                <GlassPanel key={turn.id} variant="cream" className="relative max-w-[92%] overflow-hidden p-3">
                  <LuminousShimmerOverlay radius={12} />
                  <span className="relative z-10 block font-[Cinzel] text-[0.55rem] tracking-[0.14em] text-[#2a2218]/38 uppercase">
                    Leonardo
                  </span>
                  {turn.id === typingId ? (
                    <TypewriterText
                      text={turn.content}
                      isStreaming
                      speedMs={16}
                      onComplete={() => onTypingComplete(turn.id)}
                      className={`relative z-10 ${ASSISTANT_CLASS}`}
                    />
                  ) : (
                    <p className={`relative z-10 ${ASSISTANT_CLASS}`}>{turn.content}</p>
                  )}
                </GlassPanel>
              ),
            )}
            {loading ? (
              <GlassPanel variant="cream" className="max-w-[92%] p-3">
                <span className="block font-[Cinzel] text-[0.55rem] tracking-[0.14em] text-[#2a2218]/38 uppercase">
                  Leonardo
                </span>
                <p className="mt-1 font-serif text-base italic text-[#2a2218]/55">Leonardo is thinking…</p>
              </GlassPanel>
            ) : null}
            {showStarters && onStarter ? (
              <div className="space-y-2 pt-1">
                <p className="text-sm text-[#2a2218]/45">Or ask about this folio…</p>
                {starters.map((q) => (
                  <button
                    key={q}
                    type="button"
                    className="block w-full rounded-xl border border-amber-900/10 bg-white/65 px-3 py-2 text-left text-sm text-[#2a2218] transition hover:bg-white/90"
                    onClick={() => onStarter(q)}
                  >
                    &ldquo;{q}&rdquo;
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <div ref={endRef} />
        </div>
      ) : null}
    </div>
  );
}
