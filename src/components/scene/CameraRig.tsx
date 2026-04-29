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

export default function CameraRig() {
  const { camera } = useThree();
  const lookAtTarget = useRef(new THREE.Vector3(0, 0, 0));
  const currentLook = useRef(new THREE.Vector3(0, 0, 0));

  useFrame(() => {
    const mode = useHubStore.getState().mode;
    const t = TARGETS[mode];
    camera.position.lerp(t.pos, 0.045);

    const persp = camera as PerspectiveCamera;
    if (persp.isPerspectiveCamera) {
      const next = THREE.MathUtils.lerp(persp.fov, t.fov, 0.05);
      if (Math.abs(persp.fov - next) > 0.01) {
        persp.fov = next;
        persp.updateProjectionMatrix();
      }
    }

    currentLook.current.lerp(lookAtTarget.current, 0.05);
    camera.lookAt(currentLook.current);
  });

  return null;
}
