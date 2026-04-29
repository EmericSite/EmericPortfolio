'use client';

import { useFrame } from '@react-three/fiber';
import {
  Bloom,
  ChromaticAberration,
  EffectComposer,
  Vignette,
} from '@react-three/postprocessing';
import { useRef } from 'react';
import * as THREE from 'three';
import { useHubStore, type HubMode } from '@/store/hub';

type BloomLike = { intensity: number };
type CALike = {
  offset: { x: number; y: number; set: (x: number, y: number) => unknown };
};

const ZERO_OFFSET = new THREE.Vector2(0, 0);

const BLOOM_BY_MODE: Record<HubMode, number> = {
  hub: 0.75,
  hover: 1.5,
  project: 1.05,
  about: 0.6,
  contact: 0.6,
};

const CA_BY_MODE: Record<HubMode, number> = {
  hub: 0,
  hover: 0.0028,
  project: 0.0012,
  about: 0,
  contact: 0,
};

export default function DynamicPostFX() {
  const bloomRef = useRef<BloomLike>(null);
  const caRef = useRef<CALike>(null);

  useFrame(() => {
    const mode = useHubStore.getState().mode;
    const targetBloom = BLOOM_BY_MODE[mode];
    const targetCA = CA_BY_MODE[mode];

    if (bloomRef.current) {
      bloomRef.current.intensity = THREE.MathUtils.lerp(
        bloomRef.current.intensity,
        targetBloom,
        0.06,
      );
    }
    if (caRef.current?.offset) {
      const cur = caRef.current.offset.x;
      const next = THREE.MathUtils.lerp(cur, targetCA, 0.06);
      caRef.current.offset.set(next, next);
    }
  });

  return (
    <EffectComposer>
      <Bloom
        ref={bloomRef as React.Ref<BloomLike>}
        intensity={0.75}
        luminanceThreshold={0.55}
        luminanceSmoothing={0.3}
        mipmapBlur
      />
      <ChromaticAberration
        ref={caRef as React.Ref<CALike>}
        offset={ZERO_OFFSET}
      />
      <Vignette eskil={false} offset={0.15} darkness={0.85} />
    </EffectComposer>
  );
}
