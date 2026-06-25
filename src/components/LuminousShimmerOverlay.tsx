interface Props {
  active?: boolean;
  radius?: number;
  className?: string;
}

/** Slow luminous shimmer for parchment and glass surfaces (Parlor + Atelier). */
export function LuminousShimmerOverlay({ active = true, radius = 16, className = "" }: Props) {
  if (!active) return null;

  return (
    <div
      className={`luminous-shimmer pointer-events-none absolute inset-0 z-[1] ${className}`}
      style={{ borderRadius: radius }}
      aria-hidden
    />
  );
}
