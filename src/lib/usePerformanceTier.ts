'use client';

import { useState } from 'react';

export type PerfTier = 'S' | 'A' | 'B' | 'C';

type Nav = Navigator & {
  deviceMemory?: number;
  userAgentData?: { platform?: string };
};

function probeWebGLRenderer(): {
  renderer: string;
  isWeakGPU: boolean;
  isStrongGPU: boolean;
  isSoftware: boolean;
} {
  if (typeof document === 'undefined')
    return {
      renderer: '',
      isWeakGPU: false,
      isStrongGPU: false,
      isSoftware: false,
    };
  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl)
      return {
        renderer: '',
        isWeakGPU: true,
        isStrongGPU: false,
        isSoftware: true,
      };
    const dbg = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer =
      (dbg && (gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) as string)) || '';
    const r = renderer.toLowerCase();
    const isSoftware =
      r.includes('microsoft basic render') ||
      r.includes('swiftshader') ||
      r.includes('llvmpipe') ||
      r.includes('software') ||
      r.includes('vmware') ||
      r.includes('warp');
    const isStrongGPU =
      !isSoftware &&
      (r.includes('nvidia') ||
        r.includes('geforce') ||
        r.includes('rtx') ||
        r.includes('gtx') ||
        r.includes('quadro') ||
        r.includes('radeon') ||
        r.includes('rx ') ||
        r.includes('rx5') ||
        r.includes('rx6') ||
        r.includes('rx7') ||
        r.includes('apple m') ||
        r.includes('apple gpu'));
    const isWeakGPU =
      isSoftware ||
      (!isStrongGPU &&
        (r.includes('intel') ||
          r.includes('uhd') ||
          r.includes('iris') ||
          r.includes('hd graphics') ||
          r.includes('mesa')));
    return { renderer, isWeakGPU, isStrongGPU, isSoftware };
  } catch {
    return {
      renderer: '',
      isWeakGPU: false,
      isStrongGPU: false,
      isSoftware: false,
    };
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

  const { isWeakGPU, isStrongGPU, isSoftware } = probeWebGLRenderer();

  // Software renderer (Microsoft Basic Render Driver, SwiftShader, LLVMpipe,
  // WARP) means the browser fell back to CPU rendering — WebGL won't run at
  // any usable framerate. Force tier C so we render the 2D fallback hub.
  if (isSoftware) return 'C';

  // Real GPU detected (NVIDIA / AMD discrete / Apple Silicon): unlock the full
  // experience regardless of platform. CPU heuristics are unreliable signals
  // when the GPU does the heavy lifting.
  if (isStrongGPU) return 'S';

  // Weak GPU (Intel UHD/Iris, Mesa, virtual) caps at tier B regardless of CPU.
  if (isWeakGPU) return 'B';

  // GPU info masked / unknown: fall back to CPU heuristics with Windows
  // penalty (many laptops have beefy CPUs but integrated graphics).
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
  A: { dpr: [1, 1.5] as [number, number], postFX: 'full', fireflies: 0.85, sparkles: 0.85, hoverFX: true },
  B: { dpr: [0.75, 1] as [number, number], postFX: 'off', fireflies: 0, sparkles: 0.15, hoverFX: false },
  C: { dpr: [0.5, 0.85] as [number, number], postFX: 'off', fireflies: 0, sparkles: 0, hoverFX: false },
} as const;

export function getDetectedTier(): PerfTier {
  return detectTier();
}

export function getGPURenderer(): string {
  return probeWebGLRenderer().renderer;
}

export function isSoftwareRenderer(): boolean {
  return probeWebGLRenderer().isSoftware;
}
