export interface KioskSettings {
  devMode: boolean;
  typewriterSpeedMs: number;
  inactivityTimeoutMs: number;
  maxTurns: number;
  analyticsEnabled: boolean;
  localModelUrl: string;
  localModelName: string;
  /** Browser-only local Ollama (dev). */
  useLocalModel: boolean;
  /** When true, POST to /api/leonardo for SLM polish (~30–90s). Off = instant CORTEX (~sub-second). */
  useLlmPolish: boolean;
}

const KEY = "leonardo.settings.v1";

/** Kiosk defaults: fast CORTEX path. SLM on EC2 stays warm for optional polish. */
export const DEFAULT_SETTINGS: KioskSettings = {
  devMode: false,
  typewriterSpeedMs: 30,
  inactivityTimeoutMs: 300_000,
  maxTurns: 12,
  analyticsEnabled: false,
  localModelUrl: "http://127.0.0.1:11434",
  localModelName: "qwen2.5:3b",
  useLocalModel: false,
  useLlmPolish: false,
};

export function loadSettings(): KioskSettings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(s: KioskSettings): void {
  localStorage.setItem(KEY, JSON.stringify(s));
}

/** Production kiosk: instant CORTEX unless visitor enables SLM polish in settings. */
export function wantsLlmPolish(settings: KioskSettings): boolean {
  return settings.useLlmPolish === true && !settings.devMode;
}
