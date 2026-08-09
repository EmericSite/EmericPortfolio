// Emericfolio — created by Tomi-Tom, 2026
// Grades the machine from S to C, and gives the 3D scene a matching quality budget

'use client';

import { useState } from 'react';

export type PerfTier = 'S' | 'A' | 'B' | 'C';

type Nav = Navigator & {
  deviceMemory?: number;
  userAgentData?: { platform?: string };
};

type GPUProbe = {
  isWeakGPU: boolean;
  isStrongGPU: boolean;
  isSoftware: boolean;
};

// Five components ask for the tier, and each probe spends a WebGL context the
// browser never reclaims. Probe once, share the answer.
let probeCache: GPUProbe | null = null;

function probeWebGLRenderer(): GPUProbe {
  if (probeCache) return probeCache;
  probeCache = runProbe();
  return probeCache;
}

function runProbe(): GPUProbe {
  if (typeof document === 'undefined')
    return {
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
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return { isWeakGPU, isStrongGPU, isSoftware };
  } catch {
    return {
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

  // Software renderer means the browser fell back to the CPU: WebGL will never
  // reach a usable framerate, so cap at tier C, the lightest budget.
  if (isSoftware) return 'C';

  // Real GPU: CPU heuristics say little when the GPU does the heavy lifting.
  if (isStrongGPU) return 'S';

  // Integrated or virtual GPU caps at tier B whatever the CPU reports.
  if (isWeakGPU) return 'B';

  // GPU masked: fall back to CPU heuristics, with a Windows penalty since many
  // laptops pair a strong CPU with integrated graphics.
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
  // Detect once and never change: swapping effects mid-session kept the
  // EffectComposer tree unstable and crashed R3F reconciliation in production.
  const [tier] = useState<PerfTier>(() => detectTier());
  return tier;
}

export const tierBudget = {
  S: { dpr: [1, 1.75] as [number, number], postFX: 'full', hoverFX: true },
  A: { dpr: [1, 1.5] as [number, number], postFX: 'full', hoverFX: true },
  B: { dpr: [0.75, 1] as [number, number], postFX: 'off', hoverFX: false },
  C: { dpr: [0.5, 0.85] as [number, number], postFX: 'off', hoverFX: false },
} as const;

export function isSoftwareRenderer(): boolean {
  return probeWebGLRenderer().isSoftware;
}
