import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

interface WaterAmbienceValue {
  started: boolean;
  muted: boolean;
  startWater: () => void;
  setMuted: (muted: boolean) => void;
  toggleMuted: () => void;
}

const WaterAmbienceContext = createContext<WaterAmbienceValue | null>(null);

function createBrownNoiseBuffer(ctx: AudioContext, seconds = 4): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const length = Math.floor(sampleRate * seconds);
  const buffer = ctx.createBuffer(2, length, sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch);
    let last = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 6.5;
    }
  }
  return buffer;
}

function RunningWaterEngine({ active }: { active: boolean }) {
  const engineRef = useRef<{
    ctx: AudioContext;
    sources: AudioBufferSourceNode[];
    master: GainNode;
  } | null>(null);

  useEffect(() => {
    if (!active) {
      const engine = engineRef.current;
      if (engine) {
        engine.master.gain.exponentialRampToValueAtTime(0.0001, engine.ctx.currentTime + 0.8);
        window.setTimeout(() => {
          engine.sources.forEach((s) => {
            try {
              s.stop();
            } catch {
              /* already stopped */
            }
          });
          engine.ctx.close().catch(() => {});
          engineRef.current = null;
        }, 900);
      }
      return;
    }

    const AudioCtor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtor) return;

    const ctx = new AudioCtor();
    const master = ctx.createGain();
    master.gain.value = 0.0001;
    const volume = ctx.createGain();
    volume.gain.value = 0.32;
    master.connect(volume);
    volume.connect(ctx.destination);

    const noise = createBrownNoiseBuffer(ctx, 5);

    const sources: AudioBufferSourceNode[] = [];
    const bands: { freq: number; q: number; gain: number }[] = [
      { freq: 280, q: 0.55, gain: 0.5 },
      { freq: 420, q: 0.45, gain: 0.38 },
      { freq: 160, q: 0.7, gain: 0.28 },
    ];

    for (const band of bands) {
      const src = ctx.createBufferSource();
      src.buffer = noise;
      src.loop = true;
      src.playbackRate.value = 0.92 + Math.random() * 0.08;
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = band.freq;
      filter.Q.value = band.q;
      const gain = ctx.createGain();
      gain.gain.value = band.gain;
      src.connect(filter);
      filter.connect(gain);
      gain.connect(master);
      src.start(0, Math.random() * 2);
      sources.push(src);
    }

    const swell = ctx.createOscillator();
    swell.type = "sine";
    swell.frequency.value = 0.12;
    const swellGain = ctx.createGain();
    swellGain.gain.value = 0.06;
    swell.connect(swellGain);
    swellGain.connect(volume.gain);
    swell.start();

    master.gain.exponentialRampToValueAtTime(1, ctx.currentTime + 2);
    void ctx.resume();

    engineRef.current = { ctx, sources, master };

    return () => {
      swell.stop();
      if (engineRef.current) {
        const { master: m, ctx: c, sources: s } = engineRef.current;
        m.gain.cancelScheduledValues(c.currentTime);
        m.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.6);
        window.setTimeout(() => {
          s.forEach((node) => {
            try {
              node.stop();
            } catch {
              /* noop */
            }
          });
          c.close().catch(() => {});
        }, 700);
        engineRef.current = null;
      }
    };
  }, [active]);

  return null;
}

export function WaterAmbienceProvider({ children }: { children: ReactNode }) {
  const [started, setStarted] = useState(false);
  const [muted, setMuted] = useState(false);

  const startWater = useCallback(() => setStarted(true), []);
  const toggleMuted = useCallback(() => setMuted((m) => !m), []);

  useEffect(() => {
    if (started) return;
    const onGesture = () => setStarted(true);
    window.addEventListener("pointerdown", onGesture, { once: true, passive: true });
    window.addEventListener("keydown", onGesture, { once: true });
    return () => {
      window.removeEventListener("pointerdown", onGesture);
      window.removeEventListener("keydown", onGesture);
    };
  }, [started]);

  return (
    <WaterAmbienceContext.Provider
      value={{ started, muted, startWater, setMuted, toggleMuted }}
    >
      {started && !muted ? <RunningWaterEngine active /> : null}
      {children}
    </WaterAmbienceContext.Provider>
  );
}

export function useWaterAmbience(): WaterAmbienceValue {
  const ctx = useContext(WaterAmbienceContext);
  if (!ctx) {
    return {
      started: false,
      muted: true,
      startWater: () => {},
      setMuted: () => {},
      toggleMuted: () => {},
    };
  }
  return ctx;
}
