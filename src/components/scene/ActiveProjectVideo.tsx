'use client';

import { Html } from '@react-three/drei';
import { projects } from '@/data/projects';
import { useHubStore } from '@/store/hub';

// World-space anchor where the active cartouche flies to.
// Must mirror ACTIVE_TARGET in CartoucheOrbit.tsx.
const ANCHOR: [number, number, number] = [0, 0.1, 1.5];
// HTML units → world units. Cartouche active scale is 1.5 and the accent
// panel is 0.84 × 1.22, so target world size is ≈ 1.26 × 1.83.
// 126px × 0.01 = 1.26 world units.
const HTML_SCALE = 0.01;

export default function ActiveProjectVideo() {
  const activeId = useHubStore((s) => s.activeId);
  const project = activeId
    ? projects.find((p) => p.id === activeId) ?? null
    : null;

  if (!project) return null;

  return (
    <group position={ANCHOR}>
      <Html
        transform
        position={[0, 0, 0.06]}
        scale={HTML_SCALE}
        zIndexRange={[100, 0]}
      >
        <div
          style={{
            width: 126,
            height: 183,
            background: '#08070C',
            borderRadius: 8,
            overflow: 'hidden',
            boxShadow: '0 0 60px rgba(255, 45, 156, 0.25)',
          }}
        >
          <iframe
            key={project.id}
            src={`https://player.vimeo.com/video/${project.vimeoId}?autoplay=1&muted=1&title=0&byline=0&portrait=0&controls=1&dnt=1`}
            width="126"
            height="183"
            frameBorder={0}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            style={{
              width: '100%',
              height: '100%',
              border: 0,
              display: 'block',
            }}
            title={project.title}
          />
        </div>
      </Html>
    </group>
  );
}
