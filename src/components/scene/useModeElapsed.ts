// Emericfolio — created by Tomi-Tom, 2026
// Says how long ago the hub changed view, for animations triggered by that change

'use client';

import { useCallback, useRef } from 'react';
import type { HubMode } from '@/store/hub';

/** Stopwatch on the current mode, shared by the camera rig and the post FX.
 * Call it once per frame: it records the change and returns its age in ms. */
export function useModeElapsed(): (mode: HubMode) => number {
  const prevMode = useRef<HubMode>('hub');
  const changedAt = useRef(0);

  return useCallback((mode: HubMode) => {
    if (mode !== prevMode.current) {
      changedAt.current = performance.now();
      prevMode.current = mode;
    }
    return performance.now() - changedAt.current;
  }, []);
}
