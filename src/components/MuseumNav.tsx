import { Link, useLocation, useNavigate } from "react-router-dom";
import { useWaterAmbience } from "../context/WaterAmbienceContext";
import { clearSession } from "../lib/auth";

interface Props {
  theme?: "dark" | "light";
}

export function MuseumNav({ theme = "dark" }: Props) {
  const loc = useLocation();
  const navigate = useNavigate();
  const path = loc.pathname;
  const { started, muted, toggleMuted, startWater } = useWaterAmbience();

  const link = (to: string, label: string) => {
    const active = path === to || path.startsWith(to + "/");
    const dark = active
      ? "text-amber-100 border-amber-200/35 bg-white/10 shadow-[0_0_16px_rgba(255,200,120,0.12)]"
      : "text-amber-200/50 border-transparent hover:text-amber-100/90 hover:bg-white/6";
    const light = active
      ? "text-[#2a2218] border-[#2a2218]/20 bg-white/50 shadow-[0_0_12px_rgba(255,210,150,0.15)]"
      : "text-[#2a2218]/50 border-transparent hover:text-[#2a2218]/80";
    return (
      <Link
        to={to}
        className={`rounded-full border px-3.5 py-1.5 font-[Cinzel] text-[0.7rem] tracking-wider uppercase no-underline transition ${theme === "dark" ? dark : light}`}
      >
        {label}
      </Link>
    );
  };

  return (
    <nav className="flex flex-wrap items-center justify-center gap-2">
      {link("/", "Home")}
      {link("/parlor", "Parlor")}
      {link("/atelier", "Atelier")}
      <button
        type="button"
        onClick={() => (started ? toggleMuted() : startWater())}
        title="Ambience sound"
        aria-label="Ambience sound"
        className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 font-[Cinzel] text-[0.7rem] tracking-wider uppercase transition ${
          theme === "dark"
            ? "border-transparent text-amber-200/40 hover:text-amber-100"
            : "border-transparent text-[#2a2218]/40 hover:text-[#2a2218]"
        }`}
      >
        <span>Ambience sound</span>
        <span aria-hidden>{started && !muted ? "🔊" : "🔇"}</span>
      </button>
      <button
        type="button"
        onClick={() => {
          clearSession();
          navigate("/login");
        }}
        className={`rounded-full border px-3.5 py-1.5 font-[Cinzel] text-[0.7rem] tracking-wider uppercase transition ${
          theme === "dark"
            ? "border-transparent text-amber-200/40 hover:text-amber-100"
            : "border-transparent text-[#2a2218]/40 hover:text-[#2a2218]"
        }`}
      >
        Sign out
      </button>
    </nav>
  );
}
