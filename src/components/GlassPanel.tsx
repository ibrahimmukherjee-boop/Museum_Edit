import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  variant?: "dark" | "light" | "cream";
}

/** Luminous glassmorphic panel — soft, airy, museum-quality. */
export function GlassPanel({ children, className = "", variant = "dark" }: Props) {
  const styles = {
    dark: "bg-stone-950/40 text-amber-50 border-white/[0.10] shadow-[0_8px_48px_rgba(0,0,0,0.45),0_0_80px_rgba(255,200,120,0.10),inset_0_1px_1px_rgba(255,255,255,0.08)]",
    light: "bg-white/[0.06] text-amber-50 border-white/[0.16] shadow-[0_8px_40px_rgba(0,0,0,0.35),0_0_60px_rgba(255,200,120,0.08),inset_0_1px_1px_rgba(255,255,255,0.08)]",
    cream: "bg-[#faf5eb]/88 text-[#2a2218] border-amber-900/10 shadow-[0_8px_40px_rgba(0,0,0,0.18),0_0_60px_rgba(255,210,150,0.18),inset_0_1px_1px_rgba(255,255,255,0.5)]",
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border backdrop-blur-2xl ${styles[variant]} ${className}`}
    >
      {/* Soft inner sheen — top-left highlight */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.14) 0%, transparent 35%, transparent 60%, rgba(255,255,255,0.06) 100%)",
        }}
      />
      {/* Bottom glow wash */}
      <div
        className="pointer-events-none absolute -bottom-1/2 left-0 right-0 h-full opacity-30"
        style={{
          background: "radial-gradient(ellipse at center, rgba(255,200,120,0.14), transparent 60%)",
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
