'use client';

import dynamic from 'next/dynamic';

const HubScene = dynamic(() => import('@/components/HubScene'), {
  ssr: false,
  loading: () => null,
});

type HomeHubProps = {
  showCartouches?: boolean;
};

export default function HomeHub({ showCartouches }: HomeHubProps) {
  return <HubScene showCartouches={showCartouches} />;
}
