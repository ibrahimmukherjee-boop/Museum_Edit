const SESSION_KEY = "leonardo.visitor.v1";
const AUTH_KEY = "leonardo.auth.v1";

const MUSEUM_USER = import.meta.env.VITE_MUSEUM_USER ?? "dvnc.ai";
const MUSEUM_PASS = import.meta.env.VITE_MUSEUM_PASS ?? "ColoradoMuseum";

export interface VisitorSession {
  name: string;
  enteredAt: number;
  sessionId: string;
}

export function verifyCredentials(username: string, password: string): boolean {
  return username.trim() === MUSEUM_USER && password === MUSEUM_PASS;
}

export function getSession(): VisitorSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as VisitorSession;
  } catch {
    return null;
  }
}

export function setSession(name: string): VisitorSession {
  const session: VisitorSession = {
    name: name.trim() || "Guest",
    enteredAt: Date.now(),
    sessionId: `v-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  localStorage.setItem(AUTH_KEY, "1");
  return session;
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(AUTH_KEY);
}

export function isLoggedIn(): boolean {
  return localStorage.getItem(AUTH_KEY) === "1" && getSession() !== null;
}
