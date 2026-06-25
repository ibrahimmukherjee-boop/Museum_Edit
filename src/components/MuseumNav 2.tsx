import { Link, useLocation, useNavigate } from "react-router-dom";
import { clearSession } from "../lib/auth";

interface Props {
  theme?: "dark" | "light";
}

export function MuseumNav({ theme = "dark" }: Props) {
  const loc = useLocation();
  const navigate = useNavigate();
  const path = loc.pathname;

  const link = (to: string, label: string) => {
    const active = path === to || path.startsWith(to + "/");
    const dark = active
      ? "text-amber-100 border-amber-200/35 bg-white/10"
      : "text-amber-200/50 border-transparent hover:text-amber-100/90 hover:bg-white/6";
    const light = active
      ? "text-[#2a2218] border-[#2a2218]/20 bg-white/50"
      : "text-[#2a2218]/50 border-transparent hover:text-[#2a2218]/80";
    return (
      <Link
        to={to}
        className={`rounded border px-3 py-1 font-[Cinzel] text-[0.7rem] tracking-wider uppercase no-underline ${theme === "dark" ? dark : light}`}
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
        onClick={() => {
          clearSession();
          navigate("/login");
        }}
        className={`rounded border px-3 py-1 font-[Cinzel] text-[0.7rem] tracking-wider uppercase ${
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
