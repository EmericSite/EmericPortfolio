'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import FallbackHub from '@/components/FallbackHub';
import { isSoftwareRenderer } from '@/lib/usePerformanceTier';

const HubScene = dynamic(() => import('@/components/HubScene'), {
  ssr: false,
  loading: () => null,
});

type HomeHubProps = {
  showCartouches?: boolean;
};

export default function HomeHub({ showCartouches }: HomeHubProps) {
  const [mode, setMode] = useState<'pending' | 'webgl' | 'fallback'>('pending');

  useEffect(() => {
    setMode(isSoftwareRenderer() ? 'fallback' : 'webgl');
  }, []);

  if (mode === 'pending') return null;
  if (mode === 'fallback') return <FallbackHub />;
  return <HubScene showCartouches={showCartouches} />;
}
