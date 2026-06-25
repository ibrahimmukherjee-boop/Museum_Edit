import { useEffect, useRef } from "react";

export type Soundscape = "studio" | "dissection" | "workshop" | "water" | "flight";

interface Props {
  soundscape: Soundscape;
  muted?: boolean;
}

/**
 * Procedural ambient soundscape using the Web Audio API.
 * No external audio files — everything is synthesised in the browser.
 */
export function AmbientSoundscape({ soundscape, muted = false }: Props) {
  const ctxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<{
    gain: GainNode;
    filters: BiquadFilterNode[];
    oscillators: OscillatorNode[];
    noise?: AudioBufferSourceNode;
    noiseGain?: GainNode;
  } | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (muted) return;

    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    ctxRef.current = ctx;

    const master = ctx.createGain();
    master.gain.value = 0.0001;
    master.connect(ctx.destination);

    const lowPass = ctx.createBiquadFilter();
    lowPass.type = "lowpass";
    lowPass.frequency.value = 800;
    lowPass.connect(master);

    nodesRef.current = { gain: master, filters: [lowPass], oscillators: [] };

    // Fade in
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 1.5);

    const now = ctx.currentTime;

    if (soundscape === "studio") {
      // Soft brush strokes + gentle hum of a painter's room
      const hum = ctx.createOscillator();
      hum.type = "sine";
      hum.frequency.value = 110;
      const humGain = ctx.createGain();
      humGain.gain.value = 0.03;
      hum.connect(humGain);
      humGain.connect(lowPass);
      hum.start(now);
      nodesRef.current.oscillators.push(hum);

      // Occasional soft "brush" swells
      let brushCount = 0;
      intervalRef.current = window.setInterval(() => {
        if (ctx.state !== "running") return;
        const brush = ctx.createOscillator();
        brush.type = "triangle";
        const f = 120 + Math.random() * 80;
        brush.frequency.setValueAtTime(f, ctx.currentTime);
        brush.frequency.exponentialRampToValueAtTime(f * 0.5, ctx.currentTime + 0.6);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, ctx.currentTime);
        g.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 0.15);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.9);
        brush.connect(g);
        g.connect(lowPass);
        brush.start(ctx.currentTime);
        brush.stop(ctx.currentTime + 1);
        if (++brushCount > 40) {
          if (intervalRef.current) window.clearInterval(intervalRef.current);
        }
      }, 2800 + Math.random() * 2000);
    } else if (soundscape === "dissection") {
      // Candle crackle + low drone
      const drone = ctx.createOscillator();
      drone.type = "sine";
      drone.frequency.value = 60;
      const droneGain = ctx.createGain();
      droneGain.gain.value = 0.08;
      drone.connect(droneGain);
      droneGain.connect(lowPass);
      drone.start(now);
      nodesRef.current.oscillators.push(drone);

      const crackleGain = ctx.createGain();
      crackleGain.gain.value = 0.02;
      crackleGain.connect(lowPass);
      nodesRef.current.noiseGain = crackleGain;

      intervalRef.current = window.setInterval(() => {
        if (ctx.state !== "running") return;
        const t = ctx.currentTime;
        for (let i = 0; i < 3; i++) {
          const crack = ctx.createOscillator();
          crack.type = "square";
          crack.frequency.value = 600 + Math.random() * 900;
          const g = ctx.createGain();
          g.gain.setValueAtTime(0, t + i * 0.03);
          g.gain.linearRampToValueAtTime(0.015, t + i * 0.03 + 0.005);
          g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.03 + 0.08);
          crack.connect(g);
          g.connect(crackleGain);
          crack.start(t + i * 0.03);
          crack.stop(t + i * 0.03 + 0.1);
        }
      }, 700 + Math.random() * 1200);
    } else if (soundscape === "workshop") {
      // Low mechanical rumble + metallic ticks
      const rumble = ctx.createOscillator();
      rumble.type = "sawtooth";
      rumble.frequency.value = 45;
      const rumbleGain = ctx.createGain();
      rumbleGain.gain.value = 0.025;
      const rumbleFilter = ctx.createBiquadFilter();
      rumbleFilter.type = "lowpass";
      rumbleFilter.frequency.value = 180;
      rumble.connect(rumbleGain);
      rumbleGain.connect(rumbleFilter);
      rumbleFilter.connect(master);
      rumble.start(now);
      nodesRef.current.oscillators.push(rumble);

      intervalRef.current = window.setInterval(() => {
        if (ctx.state !== "running") return;
        const tick = ctx.createOscillator();
        tick.type = "sine";
        tick.frequency.value = 800 + Math.random() * 600;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, ctx.currentTime);
        g.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 0.005);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);
        tick.connect(g);
        g.connect(lowPass);
        tick.start(ctx.currentTime);
        tick.stop(ctx.currentTime + 0.15);
      }, 1400 + Math.random() * 2200);
    } else if (soundscape === "water") {
      // Flowing water drone + gentle bubbles
      const flow = ctx.createOscillator();
      flow.type = "sine";
      flow.frequency.value = 90;
      const flowGain = ctx.createGain();
      flowGain.gain.value = 0.05;
      flow.connect(flowGain);
      flowGain.connect(lowPass);
      flow.start(now);
      nodesRef.current.oscillators.push(flow);

      // LFO for water movement
      const lfo = ctx.createOscillator();
      lfo.type = "sine";
      lfo.frequency.value = 0.25;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.04;
      lfo.connect(lfoGain);
      lfoGain.connect(flowGain.gain);
      lfo.start(now);
      nodesRef.current.oscillators.push(lfo);

      intervalRef.current = window.setInterval(() => {
        if (ctx.state !== "running") return;
        const bubble = ctx.createOscillator();
        bubble.type = "sine";
        bubble.frequency.value = 250 + Math.random() * 300;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, ctx.currentTime);
        g.gain.linearRampToValueAtTime(0.025, ctx.currentTime + 0.1);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
        bubble.connect(g);
        g.connect(lowPass);
        bubble.start(ctx.currentTime);
        bubble.stop(ctx.currentTime + 0.7);
      }, 900 + Math.random() * 1600);
    } else if (soundscape === "flight") {
      // Wind + occasional wing flap
      const wind = ctx.createOscillator();
      wind.type = "sine";
      wind.frequency.value = 140;
      const windGain = ctx.createGain();
      windGain.gain.value = 0.035;
      wind.connect(windGain);
      windGain.connect(lowPass);
      wind.start(now);
      nodesRef.current.oscillators.push(wind);

      const lfo = ctx.createOscillator();
      lfo.type = "sine";
      lfo.frequency.value = 0.4;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.03;
      lfo.connect(lfoGain);
      lfoGain.connect(windGain.gain);
      lfo.start(now);
      nodesRef.current.oscillators.push(lfo);

      intervalRef.current = window.setInterval(() => {
        if (ctx.state !== "running") return;
        const flap = ctx.createOscillator();
        flap.type = "triangle";
        flap.frequency.setValueAtTime(180, ctx.currentTime);
        flap.frequency.exponentialRampToValueAtTime(90, ctx.currentTime + 0.25);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, ctx.currentTime);
        g.gain.linearRampToValueAtTime(0.045, ctx.currentTime + 0.05);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
        flap.connect(g);
        g.connect(lowPass);
        flap.start(ctx.currentTime);
        flap.stop(ctx.currentTime + 0.45);
      }, 4200 + Math.random() * 3000);
    }

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      const g = nodesRef.current?.gain;
      if (g && ctx.state !== "closed") {
        g.gain.cancelScheduledValues(ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
      }
      window.setTimeout(() => {
        nodesRef.current?.oscillators.forEach((o) => {
          try {
            o.stop();
          } catch {}
        });
        ctx.close().catch(() => {});
      }, 700);
    };
  }, [soundscape, muted]);

  return null;
}
