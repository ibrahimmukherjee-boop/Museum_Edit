import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import type { FolioVisual } from "../data/folioVisuals";
import { tuningForFolio } from "../data/folio3D";
import { buildIsolatedSubjectMesh, loadNotebookTexture } from "../lib/displaceGeometry";

function artUrl(key: string): string {
  return `${import.meta.env.BASE_URL}art/${key}.jpg`;
}

interface SubjectProps {
  visual: FolioVisual;
  folioId: string;
}

function segmentsForFolio(folioId: string, stage: FolioVisual["stage"]): number {
  if (folioId === "c-anatomy-7" || folioId === "c-anatomy-8") return 40;
  if (stage === "dissection") return 36;
  return 32;
}

function cameraForFolio(folioId: string): { position: [number, number, number]; fov: number } {
  if (folioId === "p-mona-lisa" || folioId === "p-lady-ermine") {
    return { position: [0, 0.12, 2.15], fov: 36 };
  }
  if (folioId === "c-anatomy-7" || folioId === "c-anatomy-8") {
    return { position: [0.05, 0.02, 2.35], fov: 38 };
  }
  if (folioId === "p-vitruvian-man") {
    return { position: [0, 0.05, 2.75], fov: 40 };
  }
  return { position: [0, 0.08, 2.55], fov: 40 };
}

function depthForFolio(folioId: string, stage: FolioVisual["stage"]): number {
  return tuningForFolio(folioId, stage).depthScale;
}

function IsolatedSubject({ visual, folioId }: SubjectProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [meshData, setMeshData] = useState<{
    geometry: THREE.BufferGeometry;
    texture: THREE.CanvasTexture;
  } | null>(null);

  const depth = depthForFolio(folioId, visual.stage);
  const segments = segmentsForFolio(folioId, visual.stage);
  const tune = tuningForFolio(folioId, visual.stage);

  useEffect(() => {
    let cancelled = false;
    let geom: THREE.BufferGeometry | null = null;
    let tex: THREE.CanvasTexture | null = null;

    buildIsolatedSubjectMesh({
      imageUrl: artUrl(visual.foregroundKey),
      crop: visual.subjectCrop,
      planeW: tune.planeW,
      segments,
      depthScale: depth,
      stage: visual.stage,
      edgeWeight: tune.edgeWeight,
      lumWeight: tune.lumWeight,
      pageCurl: tune.pageCurl,
    })
      .then((data) => {
        if (cancelled) {
          data.geometry.dispose();
          data.texture.dispose();
          return;
        }
        geom = data.geometry;
        tex = data.texture;
        setMeshData(data);
      })
      .catch(() => {
        if (!cancelled) setMeshData(null);
      });

    return () => {
      cancelled = true;
      geom?.dispose();
      tex?.dispose();
    };
  }, [visual.foregroundKey, visual.subjectCrop, visual.stage, depth, segments, folioId, tune]);

  const yPos = (0.48 - visual.subjectCrop.cy) * 1.15;
  const xPos = (visual.subjectCrop.cx - 0.5) * 0.38;
  const shadowR = Math.max(0.28, visual.subjectCrop.rx * 1.1);
  const zLift = tune.zLift;
  const tilt = folioId === "p-mona-lisa" ? 0.06 : 0.1;

  if (!meshData) {
    return (
      <mesh position={[xPos, yPos, 0.15]}>
        <planeGeometry args={[0.6, 0.7]} />
        <meshBasicMaterial color="#e8dcc8" transparent opacity={0.35} />
      </mesh>
    );
  }

  return (
    <group position={[xPos, yPos, 0]} rotation={[tilt, 0, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.38, 0.02]}>
        <circleGeometry args={[shadowR, 28]} />
        <meshBasicMaterial color="#2a1a0c" transparent opacity={0.28} depthWrite={false} />
      </mesh>
      <mesh ref={meshRef} geometry={meshData.geometry} position={[0, 0, zLift]} castShadow receiveShadow>
        <meshStandardMaterial
          map={meshData.texture}
          roughness={0.52}
          metalness={0.008}
          side={THREE.DoubleSide}
          transparent
          alphaTest={0.05}
          depthWrite
          emissive="#fff8ee"
          emissiveIntensity={folioId === "p-mona-lisa" ? 0.04 : 0.02}
          normalScale={new THREE.Vector2(0.35, 0.35)}
        />
      </mesh>
    </group>
  );
}

function NotebookPage({ visual }: { visual: FolioVisual }) {
  const [tex, setTex] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    let t: THREE.CanvasTexture | null = null;
    loadNotebookTexture(artUrl(visual.backgroundKey), visual.subjectCrop, visual.stage)
      .then((loaded) => {
        t = loaded;
        setTex(loaded);
      })
      .catch(() => setTex(null));
    return () => {
      t?.dispose();
    };
  }, [visual.backgroundKey, visual.subjectCrop, visual.stage]);

  const pageColor =
    visual.stage === "dissection" ? "#f0e4d4" : visual.stage === "workshop" ? "#ece4cc" : "#f7f0e4";

  if (!tex) {
    return (
      <mesh position={[0, 0.02, -0.38]} rotation={[0.1, 0, 0]}>
        <planeGeometry args={[2.35, 1.48]} />
        <meshStandardMaterial color={pageColor} roughness={0.95} />
      </mesh>
    );
  }

  return (
    <group position={[0, 0.02, -0.38]} rotation={[0.1, 0, 0]}>
      <mesh receiveShadow>
        <planeGeometry args={[2.35, 1.48]} />
        <meshStandardMaterial
          map={tex}
          roughness={0.96}
          metalness={0}
          color={pageColor}
        />
      </mesh>
      {/* Codex margin line */}
      <mesh position={[-1.05, 0, 0.01]}>
        <planeGeometry args={[0.012, 1.42]} />
        <meshBasicMaterial color={visual.stage === "dissection" ? "#8b2500" : "#c4a882"} transparent opacity={0.35} />
      </mesh>
      {/* Parchment edge + binding */}
      <mesh position={[0, -0.76, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
        <boxGeometry args={[2.38, 0.05, 0.06]} />
        <meshStandardMaterial color="#d8ccb5" roughness={0.92} />
      </mesh>
      {visual.stage === "dissection" ? (
        <pointLight position={[-0.8, 0.6, 0.4]} intensity={0.35} color="#ffb870" distance={3} />
      ) : null}
    </group>
  );
}

interface Props {
  visual: FolioVisual;
  folioId: string;
  showBlink?: boolean;
}

function Scene({ visual, folioId }: Props) {
  const bg =
    visual.stage === "dissection" ? "#1a100c" : visual.stage === "workshop" ? "#14120e" : "#12100e";

  return (
    <>
      <color attach="background" args={[bg]} />
      <hemisphereLight intensity={0.42} color="#fff8f0" groundColor="#2a2018" />
      <ambientLight intensity={0.38} color="#fff8f0" />
      <directionalLight position={[2.5, 4, 2.5]} intensity={1.1} color="#fff5e8" castShadow />
      <directionalLight position={[-1.5, 2, 1.5]} intensity={0.32} color="#c8b8ff" />
      <spotLight
        position={[0.4, 1.2, 1.8]}
        angle={0.35}
        penumbra={0.6}
        intensity={0.45}
        color="#ffe8c8"
        castShadow={false}
      />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.92, 0]} receiveShadow>
        <planeGeometry args={[4.5, 2.2]} />
        <meshStandardMaterial color="#2a2218" roughness={0.96} />
      </mesh>
      <NotebookPage visual={visual} />
      <IsolatedSubject visual={visual} folioId={folioId} />
      <OrbitControls
        enablePan={false}
        minDistance={1.7}
        maxDistance={4}
        minPolarAngle={Math.PI / 4.2}
        maxPolarAngle={Math.PI / 1.9}
        target={[0, 0.05, 0.1]}
        autoRotate
        autoRotateSpeed={0.22}
      />
    </>
  );
}

/** Flat notebook + one isolated 3D element per folio (orbit to inspect). */
export function SubjectScene3D({ visual, folioId, showBlink }: Props) {
  const cam = cameraForFolio(folioId);
  const blinkClass =
    folioId === "p-saint-john" ? "mona-live-eyes--john" : "mona-live-eyes--mona";

  return (
    <div className={`subject-scene-3d subject-scene-3d--${visual.stage} relative h-[16rem] w-full overflow-hidden rounded-xl border border-white/70 md:h-[17rem]`}>
      <Canvas
        shadows
        camera={{ position: cam.position, fov: cam.fov }}
        dpr={[1, 1.25]}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <Suspense fallback={null}>
          <Scene visual={visual} folioId={folioId} />
        </Suspense>
      </Canvas>
      {showBlink ? (
        <div className="pointer-events-none absolute inset-0 z-10" aria-hidden>
          <div className={`mona-live-eyes ${blinkClass}`}>
            <div className="mona-blink-lid mona-blink-lid--left" />
            <div className="mona-blink-lid mona-blink-lid--right" />
          </div>
        </div>
      ) : null}
      <p className="pointer-events-none absolute inset-x-0 bottom-1 z-10 text-center text-[0.58rem] text-white/50">
        {visual.subjectElement} · drag to orbit
      </p>
    </div>
  );
}
