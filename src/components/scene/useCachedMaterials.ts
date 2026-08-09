// Emericfolio — created by Tomi-Tom, 2026
// Lists the surfaces of a 3D object once so the animation loop stays cheap

'use client';

import { useEffect, useRef, type RefObject } from 'react';
import type { Material, Object3D } from 'three';
import { collectMaterials } from './materials';

/** Materials under `root`, collected once so per-frame updates skip the tree walk. */
export function useCachedMaterials(
  root: RefObject<Object3D | null>,
): RefObject<Material[]> {
  const mats = useRef<Material[]>([]);
  useEffect(() => {
    mats.current = collectMaterials(root.current);
  }, [root]);
  return mats;
}
