export interface KioskSettings {
  devMode: boolean;
  typewriterSpeedMs: number;
  inactivityTimeoutMs: number;
  maxTurns: number;
  analyticsEnabled: boolean;
}

const KEY = "leonardo.settings.v1";

/** CORTEX on by default. Enable Demo Mode in settings for canned offline replies. */
export const DEFAULT_SETTINGS: KioskSettings = {
  devMode: false,
  typewriterSpeedMs: 35,
  inactivityTimeoutMs: 300_000,
  maxTurns: 10,
  analyticsEnabled: false,
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
