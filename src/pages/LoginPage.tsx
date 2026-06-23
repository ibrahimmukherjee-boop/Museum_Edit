import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GlassPanel } from "../components/GlassPanel";
import { setSession, verifyCredentials } from "../lib/auth";

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const enter = () => {
    if (!verifyCredentials(username, password)) {
      setError("Invalid username or password.");
      return;
    }
    setError("");
    setSession(name);
    navigate("/");
  };

  return (
    <div className="journey-ambient relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <div
        className="pointer-events-none absolute top-[12%] left-1/2 h-72 w-72 -translate-x-1/2 rounded-full opacity-55 blur-[2px]"
        style={{
          background:
            "radial-gradient(circle at 35% 35%, rgba(255,220,180,0.9), rgba(180,140,255,0.35) 45%, rgba(80,60,120,0.1) 70%)",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute top-[8%] left-1/2 h-[400px] w-[400px] -translate-x-1/2 animate-pulse rounded-full opacity-60"
        style={{ background: "radial-gradient(circle, rgba(200,170,255,0.25), transparent 65%)" }}
        aria-hidden
      />

      <GlassPanel variant="cream" className="relative z-10 mt-24 w-full max-w-md p-9 text-center">
        <p className="font-[Cinzel] text-[0.65rem] tracking-[0.22em] text-[#2a2218]/50 uppercase">Leonardo da Vinci Museum</p>
        <h1 className="mt-2 font-[Cinzel] text-3xl text-[#2a2218]">Enter the Exhibit</h1>
        <p className="mt-3 font-serif text-base leading-relaxed text-[#2a2218]/65">
          Museum access required. Sign in to continue.
        </p>
        <input
          className="mt-5 w-full rounded border border-[#2a2218]/20 bg-white/70 px-3 py-3 text-base text-[#2a2218] placeholder:text-[#2a2218]/40"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
        />
        <input
          type="password"
          className="mt-3 w-full rounded border border-[#2a2218]/20 bg-white/70 px-3 py-3 text-base text-[#2a2218] placeholder:text-[#2a2218]/40"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && enter()}
          autoComplete="current-password"
        />
        <input
          className="mt-3 w-full rounded border border-[#2a2218]/20 bg-white/70 px-3 py-3 text-base text-[#2a2218] placeholder:text-[#2a2218]/40"
          placeholder="Your name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {error ? <p className="mt-3 text-sm text-red-800">{error}</p> : null}
        <button
          type="button"
          className="mt-4 w-full rounded bg-[#2a2218] px-4 py-3.5 font-[Cinzel] text-sm tracking-wide text-amber-50 hover:bg-stone-900"
          onClick={enter}
        >
          Begin
        </button>
      </GlassPanel>
    </div>
  );
}
