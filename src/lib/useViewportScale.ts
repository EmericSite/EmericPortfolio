'use client';

import { useEffect, useState } from 'react';

export type ViewportScale = {
  hubScale: number;
  orbitRadius: number;
  cartoucheScale: number;
  cameraZ: number;
  isCompact: boolean;
};

const DEFAULT_SCALE: ViewportScale = {
  hubScale: 1,
  orbitRadius: 2.3,
  cartoucheScale: 1,
  cameraZ: 4.6,
  isCompact: false,
};

function computeScale(width: number, height: number): ViewportScale {
  const minDim = Math.min(width, height);
  const aspect = width / Math.max(height, 1);
  const isPortrait = aspect < 1;

  if (width < 640) {
    return {
      hubScale: 0.5,
      orbitRadius: 1.55,
      cartoucheScale: 0.78,
      cameraZ: 5.1,
      isCompact: true,
    };
  }
  if (width < 768) {
    return {
      hubScale: 0.6,
      orbitRadius: 1.75,
      cartoucheScale: 0.85,
      cameraZ: 4.9,
      isCompact: true,
    };
  }
  if (width < 1024) {
    return {
      hubScale: isPortrait ? 0.7 : 0.8,
      orbitRadius: isPortrait ? 1.95 : 2.05,
      cartoucheScale: 0.9,
      cameraZ: 4.7,
      isCompact: false,
    };
  }
  if (width < 1280) {
    return {
      hubScale: 0.85,
      orbitRadius: 1.95,
      cartoucheScale: 0.92,
      cameraZ: 4.7,
      isCompact: false,
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
