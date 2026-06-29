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

function createNoiseBuffer(ctx: AudioContext, seconds: number, brown = true): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const length = Math.floor(sampleRate * seconds);
  const buffer = ctx.createBuffer(2, length, sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch);
    let last = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      last = brown ? (last + 0.02 * white) / 1.02 : white;
      data[i] = last * (brown ? 5.5 : 0.35);
    }
  }
  return buffer;
}

/** Fountain — basin flow + periodic upward gush and splash. */
function FountainWaterEngine({ active }: { active: boolean }) {
  const engineRef = useRef<{
    ctx: AudioContext;
    nodes: AudioNode[];
    intervals: number[];
  } | null>(null);

  useEffect(() => {
    if (!active) {
      const engine = engineRef.current;
      if (engine) {
        engine.intervals.forEach((id) => window.clearInterval(id));
        engine.ctx.close().catch(() => {});
        engineRef.current = null;
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
    volume.gain.value = 0.38;
    master.connect(volume);
    volume.connect(ctx.destination);

    const nodes: AudioNode[] = [master, volume];
    const intervals: number[] = [];

    // Basin — low continuous flow into pool
    const basinBuf = createNoiseBuffer(ctx, 6, true);
    const basin = ctx.createBufferSource();
    basin.buffer = basinBuf;
    basin.loop = true;
    const basinFilter = ctx.createBiquadFilter();
    basinFilter.type = "lowpass";
    basinFilter.frequency.value = 420;
    const basinGain = ctx.createGain();
    basinGain.gain.value = 0.42;
    basin.connect(basinFilter);
    basinFilter.connect(basinGain);
    basinGain.connect(master);
    basin.start();
    nodes.push(basin, basinFilter, basinGain);

    // Jet — mid band continuous pour
    const jetBuf = createNoiseBuffer(ctx, 4, false);
    const jet = ctx.createBufferSource();
    jet.buffer = jetBuf;
    jet.loop = true;
    const jetFilter = ctx.createBiquadFilter();
    jetFilter.type = "bandpass";
    jetFilter.frequency.value = 880;
    jetFilter.Q.value = 0.9;
    const jetGain = ctx.createGain();
    jetGain.gain.value = 0.22;
    jet.connect(jetFilter);
    jetFilter.connect(jetGain);
    jetGain.connect(master);
    jet.start(0, Math.random());
    nodes.push(jet, jetFilter, jetGain);

    // Periodic fountain gush — swell then splash
    const gush = () => {
      if (ctx.state !== "running") return;
      const t = ctx.currentTime;
      const swell = ctx.createGain();
      swell.gain.setValueAtTime(0.0001, t);
      swell.gain.exponentialRampToValueAtTime(0.55, t + 0.35);
      swell.gain.exponentialRampToValueAtTime(0.12, t + 1.4);
      swell.gain.exponentialRampToValueAtTime(0.0001, t + 2.2);
      swell.connect(master);

      const splashFilter = ctx.createBiquadFilter();
      splashFilter.type = "bandpass";
      splashFilter.frequency.setValueAtTime(1200, t);
      splashFilter.frequency.exponentialRampToValueAtTime(2200, t + 0.25);
      splashFilter.frequency.exponentialRampToValueAtTime(600, t + 1.1);
      splashFilter.Q.value = 1.2;
      splashFilter.connect(swell);

      const splashBuf = createNoiseBuffer(ctx, 2.5, false);
      const splash = ctx.createBufferSource();
      splash.buffer = splashBuf;
      splash.connect(splashFilter);
      splash.start(t);
      splash.stop(t + 2.3);
    };

    gush();
    intervals.push(window.setInterval(gush, 2800 + Math.random() * 1400));

    // Light shimmer on surface
    const shimmer = ctx.createOscillator();
    shimmer.type = "sine";
    shimmer.frequency.value = 0.18;
    const shimmerGain = ctx.createGain();
    shimmerGain.gain.value = 0.05;
    shimmer.connect(shimmerGain);
    shimmerGain.connect(volume.gain);
    shimmer.start();
    nodes.push(shimmer, shimmerGain);

    master.gain.exponentialRampToValueAtTime(1, ctx.currentTime + 2.5);
    void ctx.resume();
    engineRef.current = { ctx, nodes, intervals };

    return () => {
      intervals.forEach((id) => window.clearInterval(id));
      try {
        shimmer.stop();
        basin.stop();
        jet.stop();
      } catch {
        /* noop */
      }
      ctx.close().catch(() => {});
      engineRef.current = null;
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
      {started && !muted ? <FountainWaterEngine active /> : null}
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
