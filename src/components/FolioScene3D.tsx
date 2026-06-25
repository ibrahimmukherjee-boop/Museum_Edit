import { Canvas, useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { Suspense, useRef, useState } from "react";
import * as THREE from "three";
import type { FolioVisual } from "../data/folioVisuals";
import type { Hotspot } from "../lib/hotspots";
import { EmergentSubject } from "./EmergentSubject3D";
import { LuminousShimmerOverlay } from "./LuminousShimmerOverlay";

function artUrl(key: string): string {
  return `${import.meta.env.BASE_URL}art/${key}.jpg`;
}

interface PageProps {
  imageKey: string;
  pointer: { x: number; y: number };
  stage: FolioVisual["stage"];
}

function CodexPage({ imageKey, pointer, stage }: PageProps) {
  const group = useRef<THREE.Group>(null);
  const tex = useTexture(artUrl(imageKey));
  tex.colorSpace = THREE.SRGBColorSpace;

  useFrame((_, delta) => {
    if (!group.current) return;
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, pointer.x * 0.18, delta * 4);
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, pointer.y * 0.1 + 0.12, delta * 4);
  });

  const pageColor = stage === "dissection" ? "#f5ebe0" : stage === "workshop" ? "#f2ecd8" : "#faf6ee";

  return (
    <group ref={group} position={[0, -0.05, -0.25]}>
      <ambientLight intensity={0.9} color="#fff8f0" />
      <directionalLight position={[2, 5, 4]} intensity={1.35} color="#fff5e6" castShadow />
      <directionalLight position={[-2, 2, 3]} intensity={0.45} color="#e0d0ff" />
      <hemisphereLight args={["#fff8f0", "#d8ccb8", 0.55]} />

      <mesh receiveShadow rotation={[0.08, 0, 0]}>
        <planeGeometry args={[2.6, 1.7]} />
        <meshStandardMaterial map={tex} roughness={0.85} metalness={0} transparent opacity={0.92} />
      </mesh>
      <mesh position={[0, -0.9, 0.04]} rotation={[Math.PI / 2, 0, 0]}>
        <boxGeometry args={[2.6, 0.04, 0.08]} />
        <meshStandardMaterial color={pageColor} roughness={0.92} />
      </mesh>
    </group>
  );
}

interface SceneProps {
  visual: FolioVisual;
  folioId: string;
  pointer: { x: number; y: number };
}

function FolioScene({ visual, folioId, pointer }: SceneProps) {
  return (
    <>
      <color attach="background" args={["#faf6ee"]} />
      <fog attach="fog" args={["#faf6ee", 4, 9]} />
      <CodexPage imageKey={visual.backgroundKey} pointer={pointer} stage={visual.stage} />
      <EmergentSubject
        imageKey={visual.foregroundKey}
        folioId={folioId}
        pointer={pointer}
        stage={visual.stage}
      />
    </>
  );
}

interface Props {
  visual: FolioVisual;
  folioId: string;
  title: string;
  hotspots: Hotspot[];
  onHotspot: (prompt: string, label: string) => void;
}

export function FolioScene3D({ visual, folioId, title, hotspots, onHotspot }: Props) {
  const [pointer, setPointer] = useState({ x: 0, y: 0 });

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPointer({
      x: (e.clientX - rect.left) / rect.width - 0.5,
      y: (e.clientY - rect.top) / rect.height - 0.5,
    });
  };

  const frameClass =
    visual.stage === "dissection"
      ? "folio-3d-frame--dissection"
      : visual.stage === "workshop"
        ? "folio-3d-frame--workshop"
        : "folio-3d-frame--studio";

  const showBlink = folioId === "p-mona-lisa" || folioId === "p-saint-john";

  return (
    <div className={`folio-3d-wrap relative my-3 min-h-[24rem] overflow-visible ${frameClass}`}>
      <LuminousShimmerOverlay radius={18} />
      <div
        className="folio-3d-canvas relative z-10 mx-auto h-[22rem] max-w-full overflow-hidden rounded-2xl border border-white/70 bg-[#faf6ee] glow-amber"
        onMouseMove={onMove}
        onMouseLeave={() => setPointer({ x: 0, y: 0 })}
      >
        <Canvas
          shadows
          camera={{ position: [0, -0.05, 2.65], fov: 36, near: 0.1, far: 12 }}
          gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
          dpr={[1, 1.5]}
        >
          <Suspense fallback={null}>
            <FolioScene visual={visual} folioId={folioId} pointer={pointer} />
          </Suspense>
        </Canvas>

        {showBlink ? (
          <div className="pointer-events-none absolute inset-0 z-[50]" aria-hidden>
            <div className="mona-blink-lid mona-blink-lid--left" style={{ top: "38%", left: "42%", width: "10%", height: "5%" }} />
            <div className="mona-blink-lid mona-blink-lid--right" style={{ top: "38%", right: "42%", width: "10%", height: "5%" }} />
          </div>
        ) : null}

        <div className="folio-3d-hotspots absolute inset-0 z-[80]">
          {hotspots.map((h) => (
            <button
              key={h.id}
              type="button"
              className="folio-hotspot-btn group"
              style={{ left: `${h.x}%`, top: `${h.y}%`, width: `${h.w}%`, height: `${h.h}%` }}
              onClick={(e) => {
                e.stopPropagation();
                onHotspot(h.prompt, h.label);
              }}
              aria-label={h.label}
            >
              <span className="folio-hotspot-ring" />
              <span className="folio-hotspot-label">{h.label}</span>
            </button>
          ))}
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-12 bg-gradient-to-t from-[#faf6ee] to-transparent" />
      </div>

      {visual.modernLabel ? (
        <p className="relative z-[15] mt-2 text-center font-[Cinzel] text-[0.65rem] tracking-[0.12em] text-amber-900/70 uppercase">
          Leonardo&apos;s sketch → {visual.modernLabel} today
        </p>
      ) : null}

      <p className="relative z-10 mt-1 text-center text-xs italic text-[#2a2218]/45">
        Subject emerges from the folio — grounded, walking toward you
      </p>
    </div>
  );
}
