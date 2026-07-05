export interface KioskSettings {
  devMode: boolean;
  typewriterSpeedMs: number;
  inactivityTimeoutMs: number;
  maxTurns: number;
  analyticsEnabled: boolean;
  localModelUrl: string;
  localModelName: string;
  useLocalModel: boolean;
}

const KEY = "leonardo.settings.v1";

export const DEFAULT_SETTINGS: KioskSettings = {
  devMode: false,
  typewriterSpeedMs: 30,
  inactivityTimeoutMs: 300_000,
  maxTurns: 12,
  analyticsEnabled: false,
  localModelUrl: "http://127.0.0.1:11434",
  localModelName: "leonardo-museum",
  useLocalModel: false,
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
