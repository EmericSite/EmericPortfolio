'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import type { PerspectiveCamera } from 'three';
import { useHubStore, type HubMode } from '@/store/hub';
import { usePerformanceTier, tierBudget } from '@/lib/usePerformanceTier';

const TARGETS: Record<HubMode, { pos: THREE.Vector3; fov: number }> = {
  hub: { pos: new THREE.Vector3(0, 0, 4.6), fov: 45 },
  hover: { pos: new THREE.Vector3(0, 0, 4.2), fov: 42 },
  project: { pos: new THREE.Vector3(0, 0.1, 4.5), fov: 36 },
  about: { pos: new THREE.Vector3(2.0, 0.25, 5.0), fov: 38 },
  contact: { pos: new THREE.Vector3(-2.0, 0.45, 5.0), fov: 38 },
};

const POP_DURATION_MS = 350;
const SETTLE_DURATION_MS = 700;
const POP_LERP = 0.13;
const SETTLE_LERP = 0.038;

// ease-out cubic — fast at start, slow at end. Returns 0..1.
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

export default function CameraRig() {
  const { camera } = useThree();
  const tier = usePerformanceTier();
  const hoverFXEnabled = tierBudget[tier].hoverFX;

  // Stable Vector3 refs hoisted out of useFrame to avoid per-frame allocs
  const lookAtTarget = useRef(new THREE.Vector3(0, 0, 0));
  const currentLook = useRef(new THREE.Vector3(0, 0, 0));
  const tmpVec = useRef(new THREE.Vector3());
  const shakeVec = useRef(new THREE.Vector3());
  const prevMode = useRef<HubMode>('hub');
  const modeChangedAt = useRef(0);

  useFrame(({ clock }) => {
    const { mode, hoveredId, activeId } = useHubStore.getState();
    if (mode !== prevMode.current) {
      modeChangedAt.current = performance.now();
      prevMode.current = mode;
    }

    const elapsed = performance.now() - modeChangedAt.current;
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
    // target.pos is a constant Vector3 from TARGETS — lerp reads it, no alloc.
    // We still copy into tmpVec to keep a stable target alias for any future math.
    tmpVec.current.copy(t.pos);
    camera.position.lerp(tmpVec.current, lerpFactor);

    // Camera lens shake on hover — high-frequency multi-axis jitter applied
    // AFTER the lerp so it sits as an oscillation around the target pose.
    // Disabled on low-tier devices (no hoverFX budget).
    const isHovering = hoverFXEnabled && hoveredId !== null && !activeId;
    if (isHovering) {
      const ct = clock.elapsedTime;
      const shakeX =
        Math.sin(ct * 67) * 0.012 + Math.sin(ct * 23) * 0.008;
      const shakeY =
        Math.cos(ct * 53) * 0.01 + Math.sin(ct * 41) * 0.007;
      // Occasional kick — pseudo-glitch lens punch
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
      // FOV breathing on hover — tiny push/pull to feel like the lens
      // is reframing
      if (isHovering) {
        nextFov += Math.sin(clock.elapsedTime * 7) * 0.25;
      }
      if (Math.abs(persp.fov - nextFov) > 0.01) {
        persp.fov = nextFov;
        persp.updateProjectionMatrix();
      }
    }

    currentLook.current.lerp(lookAtTarget.current, lerpFactor);
    camera.lookAt(currentLook.current);
  });

  return null;
}
