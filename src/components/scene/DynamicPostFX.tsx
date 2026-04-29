'use client';

import { useFrame } from '@react-three/fiber';
import {
  Bloom,
  ChromaticAberration,
  EffectComposer,
  Vignette,
} from '@react-three/postprocessing';
import { KernelSize } from 'postprocessing';
import { useRef } from 'react';
import * as THREE from 'three';
import { useHubStore, type HubMode } from '@/store/hub';

type BloomLike = { intensity: number };
type CALike = {
  offset: { x: number; y: number; set: (x: number, y: number) => unknown };
};

const ZERO_OFFSET = new THREE.Vector2(0, 0);

const BLOOM_BY_MODE: Record<HubMode, number> = {
  hub: 0.7,
  hover: 1.3,
  project: 0.55,
  about: 0.55,
  contact: 0.55,
};

const CA_BY_MODE: Record<HubMode, number> = {
  hub: 0,
  hover: 0.0028,
  project: 0.0012,
  about: 0,
  contact: 0,
};

// Glitch CA spike envelope — 350ms, ease-out
const GLITCH_PEAK = 0.0065;
const GLITCH_DURATION_MS = 350;

export default function DynamicPostFX() {
  const bloomRef = useRef<BloomLike>(null);
  const caRef = useRef<CALike>(null);
  const prevMode = useRef<HubMode>('hub');
  const modeChangedAt = useRef(0);

  useFrame(() => {
    const mode = useHubStore.getState().mode;
    if (mode !== prevMode.current) {
      modeChangedAt.current = performance.now();
      prevMode.current = mode;
    }

    const targetBloom = BLOOM_BY_MODE[mode];
    const baseCA = CA_BY_MODE[mode];

    // Glitch spike on mode transition: CA briefly jumps then decays
    const elapsed = performance.now() - modeChangedAt.current;
    let glitchAdd = 0;
    if (elapsed < GLITCH_DURATION_MS) {
      const t = elapsed / GLITCH_DURATION_MS;
      // ease-out cubic — peak at start, decays to 0
      glitchAdd = GLITCH_PEAK * Math.pow(1 - t, 3);
    }
    const targetCA = baseCA + glitchAdd;

    if (bloomRef.current) {
      bloomRef.current.intensity = THREE.MathUtils.lerp(
        bloomRef.current.intensity,
        targetBloom,
        0.06,
      );
    }
    if (caRef.current?.offset) {
      const cur = caRef.current.offset.x;
      // Faster lerp during the spike so the glitch reads instantly
      const lerp = elapsed < GLITCH_DURATION_MS ? 0.35 : 0.06;
      const next = THREE.MathUtils.lerp(cur, targetCA, lerp);
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
        kernelSize={KernelSize.MEDIUM}
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
