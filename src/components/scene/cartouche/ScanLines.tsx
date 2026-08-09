// Emericfolio — created by Tomi-Tom, 2026
// Coloured beams sweeping across a project card while the pointer rests on it

'use client';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import type { Mesh, MeshBasicMaterial } from 'three';
import { useHubStore } from '@/store/hub';

export default function ScanLines({
  accent,
  projectId,
}: {
  accent: string;
  /** Card identity, null for the showreel card, which is never hovered. */
  projectId: string | null;
}) {
  const scanARef = useRef<Mesh>(null);
  const scanAMatRef = useRef<MeshBasicMaterial>(null);
  const scanBRef = useRef<Mesh>(null);
  const scanBMatRef = useRef<MeshBasicMaterial>(null);
  const scanCRef = useRef<Mesh>(null);
  const scanCMatRef = useRef<MeshBasicMaterial>(null);

  useFrame(({ clock }) => {
    const { hoveredId, activeId } = useHubStore.getState();
    // Match on identity, not on accent: two projects may share the same color.
    const isLit = !activeId && projectId !== null && hoveredId === projectId;
    const t = clock.elapsedTime;

    // Bottom to top sweep, one pass every ~1.4s while lit.
    if (scanAMatRef.current && scanARef.current) {
      const cycle = ((t * 0.7) % 1) * 1.22 - 0.61;
      scanARef.current.position.y = isLit ? cycle : -2;
      scanAMatRef.current.opacity = THREE.MathUtils.lerp(
        scanAMatRef.current.opacity,
        isLit ? 0.5 : 0,
        0.25,
      );
    }

    // Same sweep, ~3.5s and half a period behind the primary line.
    if (scanBMatRef.current && scanBRef.current) {
      const cycle = ((t * 0.28 + 0.5) % 1) * 1.22 - 0.61;
      scanBRef.current.position.y = isLit ? cycle : -2;
      scanBMatRef.current.opacity = THREE.MathUtils.lerp(
        scanBMatRef.current.opacity,
        isLit ? 0.3 : 0,
        0.25,
      );
    }

    if (scanCMatRef.current && scanCRef.current) {
      // Two desynced sines give a pseudo-random height.
      const jumpY = Math.sin(t * 1.7 + Math.sin(t * 0.4) * 5) * 0.55;
      // Visible only during short flashes.
      const flashWindow = Math.sin(t * 5.3) > 0.7 ? 1 : 0;
      scanCRef.current.position.y = isLit ? jumpY : -2;
      scanCMatRef.current.opacity = THREE.MathUtils.lerp(
        scanCMatRef.current.opacity,
        isLit ? 0.55 * flashWindow : 0,
        0.55,
      );
    }
  });

  return (
    <group position={[0, 0, 0.045]}>
      {/* Primary line: fast sweep */}
      <mesh ref={scanARef}>
        <planeGeometry args={[0.82, 0.012]} />
        <meshBasicMaterial
          ref={scanAMatRef}
          color={accent}
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      {/* Secondary line: slower, phase-offset */}
      <mesh ref={scanBRef} position={[0, 0, 0.001]}>
        <planeGeometry args={[0.82, 0.005]} />
        <meshBasicMaterial
          ref={scanBMatRef}
          color={accent}
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      {/* Tertiary line: erratic glitch */}
      <mesh ref={scanCRef} position={[0, 0, 0.002]}>
        <planeGeometry args={[0.82, 0.003]} />
        <meshBasicMaterial
          ref={scanCMatRef}
          color="#ffffff"
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
