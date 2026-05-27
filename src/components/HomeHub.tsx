'use client';

import dynamic from 'next/dynamic';
import { useSyncExternalStore } from 'react';
import FallbackHub from '@/components/FallbackHub';
import { isSoftwareRenderer } from '@/lib/usePerformanceTier';

const HubScene = dynamic(() => import('@/components/HubScene'), {
  ssr: false,
  loading: () => null,
});

type HomeHubProps = {
  showCartouches?: boolean;
};

const subscribe = () => () => {};
// Sonde WebGL une seule fois côté client puis mémoïse : getSnapshot doit
// renvoyer une valeur stable, sinon useSyncExternalStore boucle.
let clientMode: 'webgl' | 'fallback' | null = null;
function getClientMode(): 'webgl' | 'fallback' {
  if (clientMode === null) {
    clientMode = isSoftwareRenderer() ? 'fallback' : 'webgl';
  }
  return clientMode;
}
const getServerMode = () => 'pending' as const;

export default function HomeHub({ showCartouches }: HomeHubProps) {
  // 'pending' au SSR + 1re hydratation → rend null ; puis bascule vers la
  // valeur client (webgl/fallback). Remplace l'ancien useEffect+setState.
  const mode = useSyncExternalStore(subscribe, getClientMode, getServerMode);

  if (mode === 'pending') return null;
  if (mode === 'fallback') return <FallbackHub />;
  return <HubScene showCartouches={showCartouches} />;
}
