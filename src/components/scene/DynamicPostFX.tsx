// Emericfolio — created by Tomi-Tom, 2026
// Full-screen finish on the 3D view: glow, colour fringing, blur and vignette

'use client';

import { useFrame } from '@react-three/fiber';
import {
  Bloom,
  DepthOfField,
  EffectComposer,
  HueSaturation,
  Vignette,
  wrapEffect,
} from '@react-three/postprocessing';
import { type DepthOfFieldEffect, KernelSize } from 'postprocessing';
import { useCallback, useRef } from 'react';
import * as THREE from 'three';
import { usePerformanceTier, tierBudget } from '@/lib/usePerformanceTier';
import { useHubStore, type HubMode } from '@/store/hub';
import { TintedGlitchEffect } from './TintedGlitchEffect';
import { useModeElapsed } from './useModeElapsed';

type BloomLike = { intensity: number };
type HueSatLike = { hue: number; saturation: number };

const TintedGlitch = wrapEffect(TintedGlitchEffect);

// Hue shift in radians, negative goes toward magenta.
const GLITCH_HUE_PEAK = -0.18;
const GLITCH_SAT_PEAK = 0.22;

const BLOOM_BY_MODE: Record<HubMode, number> = {
  hub: 0.7,
  hover: 1.05,
  project: 0.55,
  about: 0.55,
  contact: 0.55,
};

const CA_BY_MODE: Record<HubMode, number> = {
  hub: 0,
  hover: 0.002,
  project: 0.0012,
  about: 0,
  contact: 0,
};

const DOF_BY_MODE: Record<HubMode, number> = {
  hub: 0,
  hover: 0,
  // Active cartouche must stay sharp: blur washes it out while it lerps in.
  project: 0,
  about: 1.5,
  contact: 1.5,
};

const GLITCH_PEAK = 0.0065;
const GLITCH_DURATION_MS = 350;

export default function DynamicPostFX() {
  const tier = usePerformanceTier();
  const budget = tierBudget[tier];

  const bloomRef = useRef<BloomLike>(null);
  const glitchRef = useRef<TintedGlitchEffect>(null);
  const dofRef = useRef<DepthOfFieldEffect>(null);
  const hueSatRef = useRef<HueSatLike>(null);
  const sinceModeChange = useModeElapsed();

  const postFX = budget.postFX;
  const hoverFX = budget.hoverFX;

  // wrapEffect is not forwardRef: under React 19 an object ref lands in the props
  // it memoizes with JSON.stringify and the cycle kills the canvas. Functions do not.
  const setBloom = useCallback((el: BloomLike | null) => {
    bloomRef.current = el;
  }, []);
  const setGlitch = useCallback((el: TintedGlitchEffect | null) => {
    glitchRef.current = el;
  }, []);
  const setHueSat = useCallback((el: HueSatLike | null) => {
    hueSatRef.current = el;
  }, []);

  useFrame(({ clock }) => {
    if (postFX === 'off') return;

    const mode = useHubStore.getState().mode;
    const elapsed = sinceModeChange(mode);

    const targetBloom = BLOOM_BY_MODE[mode];
    const baseCA = CA_BY_MODE[mode];
    const targetDoF = DOF_BY_MODE[mode];

    // Mode change fires a chromatic aberration spike that decays back to base.
    let glitchAdd = 0;
    if (elapsed < GLITCH_DURATION_MS) {
      const t = elapsed / GLITCH_DURATION_MS;
      glitchAdd = GLITCH_PEAK * Math.pow(1 - t, 3);
    }
    // Noise on top of the base level so the fringing never sits still.
    let hoverJitter = 0;
    if (mode === 'hover' && hoverFX) {
      const ct = clock.elapsedTime;
      hoverJitter =
        Math.abs(Math.sin(ct * 19)) * 0.0005 +
        (Math.sin(ct * 4.7) > 0.85 ? 0.001 : 0);
    }
    const targetCA = baseCA + glitchAdd + hoverJitter;

    if (bloomRef.current) {
      bloomRef.current.intensity = THREE.MathUtils.lerp(
        bloomRef.current.intensity,
        targetBloom,
        0.06,
      );
    }
    if (glitchRef.current?.offset) {
      const cur = glitchRef.current.offset.x;
      // Faster lerp during the spike so the glitch reads instantly.
      const lerp = elapsed < GLITCH_DURATION_MS ? 0.35 : 0.06;
      const next = THREE.MathUtils.lerp(cur, targetCA, lerp);
      glitchRef.current.offset.set(next, next);
    }
    if (dofRef.current) {
      dofRef.current.bokehScale = THREE.MathUtils.lerp(
        dofRef.current.bokehScale,
        targetDoF,
        0.06,
      );
    }
    if (hueSatRef.current) {
      const env =
        elapsed < GLITCH_DURATION_MS ? Math.pow(1 - elapsed / GLITCH_DURATION_MS, 3) : 0;
      const lerp = elapsed < GLITCH_DURATION_MS ? 0.35 : 0.12;
      hueSatRef.current.hue = THREE.MathUtils.lerp(
        hueSatRef.current.hue,
        GLITCH_HUE_PEAK * env,
        lerp,
      );
      hueSatRef.current.saturation = THREE.MathUtils.lerp(
        hueSatRef.current.saturation,
        GLITCH_SAT_PEAK * env,
        lerp,
      );
    }
  });

  if (postFX === 'off') return null;

  return (
    <EffectComposer multisampling={0} stencilBuffer={false}>
      <Bloom
        ref={setBloom as React.Ref<BloomLike>}
        intensity={0.7}
        luminanceThreshold={0.6}
        luminanceSmoothing={0.3}
        kernelSize={KernelSize.SMALL}
      />
      <TintedGlitch ref={setGlitch as React.Ref<TintedGlitchEffect>} />
      <HueSaturation
        ref={setHueSat as React.Ref<HueSatLike>}
        hue={0}
        saturation={0}
      />
      <DepthOfField
        ref={dofRef}
        focusDistance={0.003}
        focalLength={0.04}
        bokehScale={0}
      />
      <Vignette eskil={false} offset={0.15} darkness={0.85} />
    </EffectComposer>
  );
}
