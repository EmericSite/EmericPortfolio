// Emericfolio — created by Tomi-Tom, 2026
// Flies the 3D camera between the hub, project, about and contact viewpoints

'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import type { PerspectiveCamera } from 'three';
import { useHubStore, type HubMode } from '@/store/hub';
import { usePerformanceTier, tierBudget } from '@/lib/usePerformanceTier';
import { useModeElapsed } from './useModeElapsed';

const TARGETS: Record<HubMode, { pos: THREE.Vector3; fov: number }> = {
  hub: { pos: new THREE.Vector3(0, 0, 4.6), fov: 45 },
  hover: { pos: new THREE.Vector3(0, 0, 4.2), fov: 42 },
  project: { pos: new THREE.Vector3(0, 0, 4.4), fov: 34 },
  about: { pos: new THREE.Vector3(2.0, 0.25, 5.0), fov: 38 },
  contact: { pos: new THREE.Vector3(-2.0, 0.45, 5.0), fov: 38 },
};

const POP_DURATION_MS = 350;
const SETTLE_DURATION_MS = 700;
const POP_LERP = 0.13;
const SETTLE_LERP = 0.038;

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

// The camera always aims at the scene center, whatever the mode.
const ORIGIN = new THREE.Vector3(0, 0, 0);

export default function CameraRig() {
  const { camera } = useThree();
  const tier = usePerformanceTier();
  const hoverFXEnabled = tierBudget[tier].hoverFX;

  // Hoisted out of useFrame so no Vector3 is allocated per frame.
  const tmpVec = useRef(new THREE.Vector3());
  const shakeVec = useRef(new THREE.Vector3());
  const sinceModeChange = useModeElapsed();

  useFrame(({ clock }) => {
    const { mode, hoveredId, activeId } = useHubStore.getState();
    const elapsed = sinceModeChange(mode);

    let lerpFactor: number;
    if (elapsed < POP_DURATION_MS) {
      lerpFactor = POP_LERP;
    } else if (elapsed < POP_DURATION_MS + SETTLE_DURATION_MS) {
      const t = (elapsed - POP_DURATION_MS) / SETTLE_DURATION_MS;
      lerpFactor = THREE.MathUtils.lerp(POP_LERP, SETTLE_LERP, easeOutCubic(t));
    } else {
      lerpFactor = SETTLE_LERP;
    }

    const t = TARGETS[mode];
    tmpVec.current.copy(t.pos);
    camera.position.lerp(tmpVec.current, lerpFactor);

    // Lens shake runs after the lerp so it oscillates around the target pose.
    const isHovering = hoverFXEnabled && hoveredId !== null && !activeId;
    if (isHovering) {
      const ct = clock.elapsedTime;
      const shakeX =
        Math.sin(ct * 67) * 0.012 + Math.sin(ct * 23) * 0.008;
      const shakeY =
        Math.cos(ct * 53) * 0.01 + Math.sin(ct * 41) * 0.007;
      // Rare punch that breaks the regular oscillation.
      const kick = Math.sin(ct * 3.1) > 0.92 ? 0.04 : 0;
      shakeVec.current.set(
        shakeX + kick * Math.sin(ct * 91),
        shakeY + kick * Math.cos(ct * 73),
        0,
      );
      camera.position.add(shakeVec.current);
    }

    const persp = camera as PerspectiveCamera;
    if (persp.isPerspectiveCamera) {
      let nextFov = THREE.MathUtils.lerp(persp.fov, t.fov, lerpFactor);
      // Tiny breathing so the lens feels like it is reframing.
      if (isHovering) {
        nextFov += Math.sin(clock.elapsedTime * 7) * 0.25;
      }
      if (Math.abs(persp.fov - nextFov) > 0.01) {
        persp.fov = nextFov;
        persp.updateProjectionMatrix();
      }
    }

    camera.lookAt(ORIGIN);
  });

  return null;
}
