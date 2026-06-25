import type { ReactNode } from "react";
import { LuminousShimmerOverlay } from "./LuminousShimmerOverlay";

interface Props {
  children: ReactNode;
  className?: string;
}

/** Glassmorphic folio card — reference: luminous glass UI boards. */
export function FolioGlassCard({ children, className = "" }: Props) {
  return (
    <article
      className={`folio-glass-card relative overflow-visible rounded-3xl border border-white/80 bg-white/58 p-5 pl-12 shadow-[0_20px_60px_rgba(255,210,150,0.22),0_4px_20px_rgba(42,34,24,0.06),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-md ${className}`}
    >
      <LuminousShimmerOverlay radius={24} active={false} />
      <div
        className="pointer-events-none absolute inset-0 rounded-3xl opacity-60"
        style={{
          background:
            "linear-gradient(145deg, rgba(255,255,255,0.55) 0%, transparent 42%, transparent 58%, rgba(255,230,190,0.2) 100%)",
        }}
      />
      <div className="absolute bottom-3 left-11 top-3 w-px bg-gradient-to-b from-transparent via-red-900/25 to-transparent" aria-hidden />
      <div className="relative z-10">{children}</div>
    </article>
  );
}
