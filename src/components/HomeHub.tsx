// Emericfolio — created by Tomi-Tom, 2026
// Home stage: loads the 3D hub, or the flat grid when the machine cannot render it
'use client';

import dynamic from 'next/dynamic';
import { useSyncExternalStore } from 'react';
import FallbackHub from '@/components/FallbackHub';
import ShowreelPlayButton from '@/components/ShowreelPlayButton';
import { isSoftwareRenderer } from '@/lib/usePerformanceTier';

const HubScene = dynamic(() => import('@/components/HubScene'), {
  ssr: false,
  loading: () => null,
});

const subscribe = () => () => {};
// Probe WebGL once and cache it: getSnapshot must return a stable value or
// useSyncExternalStore loops forever.
let clientMode: 'webgl' | 'fallback' | null = null;
function getClientMode(): 'webgl' | 'fallback' {
  if (clientMode === null) {
    clientMode = isSoftwareRenderer() ? 'fallback' : 'webgl';
  }
  return clientMode;
}
const getServerMode = () => 'pending' as const;

export default function HomeHub() {
  // 'pending' on SSR and first hydration keeps the markup empty, then it
  // switches to the client value.
  const mode = useSyncExternalStore(subscribe, getClientMode, getServerMode);

  if (mode === 'pending') return null;
  if (mode === 'fallback') return <FallbackHub />;
  return (
    <>
      <HubScene />
      <ShowreelPlayButton />
    </>
  );
}
