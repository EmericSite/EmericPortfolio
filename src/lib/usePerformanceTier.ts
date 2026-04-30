'use client';

import { useState } from 'react';

export type PerfTier = 'S' | 'A' | 'B' | 'C';

type Nav = Navigator & {
  deviceMemory?: number;
  userAgentData?: { platform?: string };
};

function probeWebGLRenderer(): { renderer: string; isWeakGPU: boolean } {
  if (typeof document === 'undefined') return { renderer: '', isWeakGPU: false };
  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return { renderer: '', isWeakGPU: true };
    const dbg = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer =
      (dbg && (gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) as string)) || '';
    const r = renderer.toLowerCase();
    const isWeakGPU =
      r.includes('intel') ||
      r.includes('uhd') ||
      r.includes('iris') ||
      r.includes('hd graphics') ||
      r.includes('swiftshader') ||
      r.includes('llvmpipe') ||
      r.includes('vmware') ||
      r.includes('mesa') ||
      r.includes('microsoft basic render');
    return { renderer, isWeakGPU };
  } catch {
    return { renderer: '', isWeakGPU: false };
  }
}

function detectTier(): PerfTier {
  if (typeof window === 'undefined') return 'A';

  const nav = navigator as Nav;
  const cores = nav.hardwareConcurrency ?? 4;
  const ram = nav.deviceMemory ?? 4;
  const platform = nav.userAgentData?.platform ?? '';
  const isWindows = platform === 'Windows';

  const isCoarse = window.matchMedia?.('(pointer: coarse)').matches ?? false;
  const isNoHover = window.matchMedia?.('(hover: none)').matches ?? false;
  const isMobile = isCoarse && isNoHover;

  if (isMobile) {
    if (cores <= 4 || ram <= 2) return 'C';
    return 'B';
  }

  const { isWeakGPU } = probeWebGLRenderer();

  // Weak GPU (Intel UHD/Iris, Mesa, virtual) caps at tier B regardless of CPU.
  if (isWeakGPU) return 'B';

  // Windows desktop without GPU info: be conservative — many laptops have
  // beefy CPUs but integrated graphics. Downgrade by one notch.
  if (isWindows) {
    if (cores >= 8 && ram >= 8) return 'A';
    if (cores >= 4 && ram >= 4) return 'B';
    return 'C';
  }

  if (cores >= 8 && ram >= 8) return 'S';
  if (cores >= 4 && ram >= 4) return 'A';
  if (cores >= 2 && ram >= 2) return 'B';
  return 'C';
}

export function usePerformanceTier(): PerfTier {
  // Lazy init: detect once, never change. Keeps the EffectComposer tree
  // structurally stable across renders (mounting/unmounting effects mid-
  // session was crashing R3F reconciliation in production).
  const [tier] = useState<PerfTier>(() => detectTier());
  return tier;
}

export const tierBudget = {
  S: { dpr: [1, 1.75] as [number, number], postFX: 'full', fireflies: 1, sparkles: 1, hoverFX: true },
  A: { dpr: [1, 1.25] as [number, number], postFX: 'reduced', fireflies: 0.55, sparkles: 0.6, hoverFX: true },
  B: { dpr: [0.75, 1] as [number, number], postFX: 'off', fireflies: 0, sparkles: 0.15, hoverFX: false },
  C: { dpr: [0.5, 0.85] as [number, number], postFX: 'off', fireflies: 0, sparkles: 0, hoverFX: false },
} as const;

export function getDetectedTier(): PerfTier {
  return detectTier();
}

export function getGPURenderer(): string {
  return probeWebGLRenderer().renderer;
}
