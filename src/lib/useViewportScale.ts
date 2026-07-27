'use client';

import { useEffect, useState } from 'react';

export type CartoucheLayout = 'orbit' | 'stack';

export type ViewportScale = {
  hubScale: number;
  orbitRadius: number;
  cartoucheScale: number;
  cameraZ: number;
  isCompact: boolean;
  layout: CartoucheLayout;
};

const DEFAULT_SCALE: ViewportScale = {
  hubScale: 1,
  orbitRadius: 2.3,
  cartoucheScale: 1,
  cameraZ: 4.6,
  isCompact: false,
  layout: 'orbit',
};

function computeScale(width: number, height: number): ViewportScale {
  const aspect = width / Math.max(height, 1);
  const isPortrait = aspect < 1;

  if (width < 640) {
    return {
      hubScale: 0.45,
      orbitRadius: 1.55,
      // Cartouches rétrécies : la carte centrale mangeait tout l'écran et ses
      // voisines n'étaient plus lisibles.
      cartoucheScale: 0.78,
      cameraZ: 5.1,
      isCompact: true,
      layout: 'stack',
    };
  }
  if (width < 768) {
    return {
      hubScale: 0.55,
      orbitRadius: 1.75,
      cartoucheScale: 0.82,
      cameraZ: 4.9,
      isCompact: true,
      layout: 'stack',
    };
  }
  if (width < 1024) {
    return {
      hubScale: isPortrait ? 0.7 : 0.8,
      orbitRadius: isPortrait ? 1.95 : 2.05,
      cartoucheScale: 0.9,
      cameraZ: 4.7,
      isCompact: false,
      layout: 'orbit',
    };
  }
  if (width < 1280) {
    return {
      hubScale: 0.85,
      orbitRadius: 1.95,
      cartoucheScale: 0.92,
      cameraZ: 4.7,
      isCompact: false,
      layout: 'orbit',
    };
  }
  return DEFAULT_SCALE;
}

export function useViewportScale(): ViewportScale {
  const [scale, setScale] = useState<ViewportScale>(DEFAULT_SCALE);

  useEffect(() => {
    const update = () => {
      setScale(computeScale(window.innerWidth, window.innerHeight));
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
    };
  }, []);

  return scale;
}
