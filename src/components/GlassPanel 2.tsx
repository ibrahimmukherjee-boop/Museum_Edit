import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  variant?: "dark" | "light" | "cream";
}

/** Luminous glassmorphic panel — variant controls text contrast. */
export function GlassPanel({ children, className = "", variant = "dark" }: Props) {
  const styles = {
    dark: "bg-stone-950/55 text-amber-50 border-white/15 shadow-[0_8px_40px_rgba(0,0,0,0.45)]",
    light: "bg-white/12 text-amber-50 border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.35)]",
    cream: "bg-[#f4ecd8]/92 text-[#2a2218] border-amber-900/15 shadow-[0_8px_32px_rgba(0,0,0,0.25)]",
  };

  return (
    <div
      className={`backdrop-blur-xl border rounded-sm ${styles[variant]} ${className}`}
    >
      {children}
    </div>
  );
}
