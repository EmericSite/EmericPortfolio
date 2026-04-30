'use client';

import { useEffect, useState } from 'react';

export type PerfTier = 'S' | 'A' | 'B' | 'C';

type Nav = Navigator & {
  deviceMemory?: number;
};

function detectTier(): PerfTier {
  if (typeof window === 'undefined') return 'S';

  const nav = navigator as Nav;
  const cores = nav.hardwareConcurrency ?? 4;
  const ram = nav.deviceMemory ?? 8;
  const dpr = window.devicePixelRatio ?? 1;

  const isCoarse = window.matchMedia?.('(pointer: coarse)').matches ?? false;
  const isNoHover = window.matchMedia?.('(hover: none)').matches ?? false;

  if (isCoarse && isNoHover && (cores <= 4 || ram <= 2)) return 'C';
  if (cores >= 6 && ram >= 6 && dpr >= 1) return 'S';
  if (cores >= 4 && ram >= 4) return 'A';
  if (cores >= 2 && ram >= 2) return 'B';
  return 'C';
}

export function usePerformanceTier(): PerfTier {
  const [tier, setTier] = useState<PerfTier>('S');

  useEffect(() => {
    setTier(detectTier());
  }, []);

  return tier;
}

export const tierBudget = {
  S: { dpr: [1, 2] as [number, number], postFX: 'full', fireflies: 1, sparkles: 1, hoverFX: true },
  A: { dpr: [1, 1.5] as [number, number], postFX: 'reduced', fireflies: 0.6, sparkles: 0.6, hoverFX: true },
  B: { dpr: [0.75, 1] as [number, number], postFX: 'minimal', fireflies: 0.3, sparkles: 0.3, hoverFX: false },
  C: { dpr: [0.5, 1] as [number, number], postFX: 'off', fireflies: 0, sparkles: 0.2, hoverFX: false },
} as const;
