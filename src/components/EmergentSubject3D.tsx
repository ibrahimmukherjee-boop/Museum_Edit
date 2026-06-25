import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import type { FolioVisual } from "../data/folioVisuals";

export type EmergenceKind = "figure" | "anatomy" | "machine";

const FOLIO_MOTION: Record<string, { speed: number; zNear: number; zFar: number; sway: number }> = {
  "p-vitruvian-man": { speed: 0.78, zNear: 0.52, zFar: -0.38, sway: 0.055 },
  "p-mona-lisa": { speed: 0.42, zNear: 0.38, zFar: -0.28, sway: 0.02 },
  "c-anatomy-foot": { speed: 0.85, zNear: 0.48, zFar: -0.32, sway: 0.07 },
  "c-eng-flying-machine": { speed: 0.5, zNear: 0.58, zFar: -0.12, sway: 0.03 },
};

function motionFor(folioId: string, kind: EmergenceKind) {
  const custom = FOLIO_MOTION[folioId];
  if (custom) return custom;
  return {
    speed: kind === "figure" ? 0.55 : kind === "anatomy" ? 0.7 : 0.45,
    zNear: kind === "machine" ? 0.55 : 0.42,
    zFar: kind === "machine" ? -0.15 : -0.35,
    sway: kind === "anatomy" ? 0.06 : 0.04,
  };
}

export function emergenceKind(folioId: string): EmergenceKind {
  if (folioId.startsWith("c-eng")) return "machine";
  if (folioId.startsWith("c-anatomy") || folioId.includes("anatomy")) return "anatomy";
  return "figure";
}

interface Props {
  imageKey: string;
  folioId: string;
  pointer: { x: number; y: number };
  stage: FolioVisual["stage"];
}

/**
 * Displacement-mapped mesh — subject emerges from the page and walks toward the viewer.
 * Feet stay grounded; shadow scales with proximity. No floating bob.
 */
export function EmergentSubject({ imageKey, folioId, pointer, stage }: Props) {
  const group = useRef<THREE.Group>(null);
  const shadow = useRef<THREE.Mesh>(null);
  const tex = useTexture(
    `${import.meta.env.BASE_URL}art/${imageKey}.jpg`,
  );
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;

  const kind = emergenceKind(folioId);
  const dispScale = kind === "anatomy" ? 0.22 : kind === "machine" ? 0.16 : 0.18;
  const subjectW = kind === "machine" ? 1.55 : kind === "anatomy" ? 1.35 : 1.25;
  const subjectH = kind === "machine" ? 1.45 : 1.55;

  const material = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      map: tex,
      roughness: 0.58,
      metalness: 0.03,
      side: THREE.DoubleSide,
      transparent: true,
      alphaTest: 0.12,
    });
    mat.onBeforeCompile = (shader) => {
      shader.uniforms.dispScale = { value: dispScale };
      shader.vertexShader = shader.vertexShader.replace(
        "#include <common>",
        `#include <common>
        uniform float dispScale;`,
      );
      shader.vertexShader = shader.vertexShader.replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
        vec4 disp = texture2D(map, uv);
        float h = disp.r * dispScale;
        transformed.z += h * 2.8;
        transformed.y += h * 0.22;`,
      );
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <dithering_fragment>",
        `if (diffuseColor.r > 0.9 && diffuseColor.g > 0.87 && diffuseColor.b > 0.8) discard;
        #include <dithering_fragment>`,
      );
    };
    return mat;
  }, [tex, dispScale]);

  useFrame((state) => {
    if (!group.current || !shadow.current) return;
    const t = state.clock.elapsedTime;
    const kind = emergenceKind(folioId);
    const motion = motionFor(folioId, kind);

    const cycle = t * motion.speed;
    const phase = (Math.sin(cycle) + 1) * 0.5;
    const z = motion.zFar + phase * (motion.zNear - motion.zFar);
    const scale = 0.86 + phase * 0.24;

    const step = Math.sin(cycle * 2.1);
    const swayX = step * motion.sway;
    const swayRotY = step * 0.045 + pointer.x * 0.12;
    const leanX = -0.08 + pointer.y * 0.06 + (kind === "figure" ? step * 0.02 : 0);

    group.current.position.set(swayX, -0.12, z);
    group.current.scale.setScalar(scale);
    group.current.rotation.set(leanX, swayRotY, step * 0.018);

    const shadowScale = 0.55 + phase * 0.45;
    const shadowOpacity = 0.28 + phase * 0.22;
    shadow.current.position.set(swayX * 0.5, -0.88, 0.08);
    shadow.current.scale.set(shadowScale * subjectW * 0.55, shadowScale * 0.28, 1);
    const sm = shadow.current.material as THREE.MeshBasicMaterial;
    sm.opacity = shadowOpacity;
  });

  const baseY = stage === "dissection" ? -0.15 : -0.1;

  return (
    <group position={[0, baseY, 0]}>
      {/* Floor plane — grounds the subject */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.76, 0.05]} receiveShadow>
        <planeGeometry args={[3.2, 1.6]} />
        <meshStandardMaterial color="#ebe3d4" roughness={0.95} metalness={0} />
      </mesh>

      {/* Dynamic contact shadow */}
      <mesh ref={shadow} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1, 32]} />
        <meshBasicMaterial color="#3a2818" transparent opacity={0.35} depthWrite={false} />
      </mesh>

      {/* Displaced subject mesh */}
      <group ref={group}>
        <mesh material={material} castShadow rotation={[0, 0, 0]}>
          <planeGeometry args={[subjectW, subjectH, 56, 56]} />
        </mesh>
      </group>
    </group>
  );
}
