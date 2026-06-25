import { useEffect, useRef } from "react";
import { TypewriterText } from "./TypewriterText";
import { LuminousShimmerOverlay } from "./LuminousShimmerOverlay";

interface Props {
  folioTitle: string;
  question?: string;
  answer?: string;
  loading: boolean;
  typing: boolean;
  onTypingComplete?: () => void;
}

/** Fixed chat strip — Leonardo always visible above the composer. */
export function AtelierChatDock({
  folioTitle,
  question,
  answer,
  loading,
  typing,
  onTypingComplete,
}: Props) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [question, answer, loading]);

  const hasChat = Boolean(question || answer || loading);

  return (
    <div className="atelier-chat-dock relative z-[60] mx-3 mb-2 overflow-hidden rounded-2xl border border-white/70 bg-white/72 shadow-[0_8px_40px_rgba(255,210,150,0.28),0_2px_12px_rgba(42,34,24,0.08)] backdrop-blur-2xl">
      <LuminousShimmerOverlay radius={16} />
      <div className="relative z-10 max-h-[11rem] overflow-y-auto px-4 py-3">
        <p className="font-[Cinzel] text-[0.6rem] tracking-[0.18em] text-[#2a2218]/40 uppercase">
          Leonardo · {folioTitle}
        </p>

        {!hasChat ? (
          <p className="mt-2 font-serif text-sm italic text-[#2a2218]/45">
            Tap a glowing point on the folio, or whisper a question below.
          </p>
        ) : null}

        {question ? (
          <div className="mt-2 ml-auto max-w-[92%] rounded-xl rounded-br-sm border border-[#2c3e5c]/15 bg-[#2c3e5c]/90 px-3 py-2 text-right">
            <p className="font-serif text-sm leading-relaxed text-[#f0ebe3]">{question}</p>
          </div>
        ) : null}

        {loading && !answer ? (
          <div className="mt-2 rounded-xl border border-amber-900/8 bg-[#fff8ed] px-3 py-2">
            <p className="font-serif text-sm italic text-[#2a2218]/50">✒ Leonardo considers…</p>
          </div>
        ) : null}

        {answer ? (
          <div className="mt-2 rounded-xl border border-amber-900/10 bg-[#fff8ed] px-3 py-2">
            <span className="block font-[Cinzel] text-[0.55rem] tracking-[0.14em] text-[#2a2218]/38 uppercase">
              Leonardo
            </span>
            <TypewriterText
              text={answer}
              isStreaming={typing}
              speedMs={18}
              onComplete={onTypingComplete}
              className="mt-1 font-serif text-sm leading-relaxed text-[#2a2218]"
            />
          </div>
        ) : null}
        <div ref={endRef} />
      </div>
    </div>
  );
}
