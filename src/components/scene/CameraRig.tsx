'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import type { PerspectiveCamera } from 'three';
import { useHubStore, type HubMode } from '@/store/hub';

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
  const lookAtTarget = useRef(new THREE.Vector3(0, 0, 0));
  const currentLook = useRef(new THREE.Vector3(0, 0, 0));
  const prevMode = useRef<HubMode>('hub');
  const modeChangedAt = useRef(0);

  useFrame(() => {
    const mode = useHubStore.getState().mode;
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
    camera.position.lerp(t.pos, lerpFactor);

    const persp = camera as PerspectiveCamera;
    if (persp.isPerspectiveCamera) {
      const next = THREE.MathUtils.lerp(persp.fov, t.fov, lerpFactor);
      if (Math.abs(persp.fov - next) > 0.01) {
        persp.fov = next;
        persp.updateProjectionMatrix();
      }
    }

    currentLook.current.lerp(lookAtTarget.current, lerpFactor);
    camera.lookAt(currentLook.current);
  });

  return null;
}
