'use client';

import { Html } from '@react-three/drei';
import { projects } from '@/data/projects';
import { useHubStore } from '@/store/hub';

// World-space anchor where the active cartouche flies to.
// Must mirror ACTIVE_TARGET in CartoucheOrbit.tsx.
const ANCHOR: [number, number, number] = [0, 0.1, 1.5];
// drei Html transform internally divides the CSS matrix by 40 (default
// distanceFactor=10 → factor = 400/10 = 40). So world size = DOM × scale / 40.
// Target world size ≈ 2.4 × 1.35 (16:9, slightly wider than the active
// cartouche so the video reads as the dominant element).
// 480 × 0.2 / 40 = 2.4 wide, 270 × 0.2 / 40 = 1.35 tall.
const VIDEO_W = 480;
const VIDEO_H = 270;
const HTML_SCALE = 0.2;

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
            width: VIDEO_W,
            height: VIDEO_H,
            background: '#08070C',
            borderRadius: 14,
            overflow: 'hidden',
            boxShadow: '0 0 80px rgba(255, 45, 156, 0.35)',
          }}
        >
          <iframe
            key={project.id}
            src={`https://player.vimeo.com/video/${project.vimeoId}?autoplay=1&muted=1&title=0&byline=0&portrait=0&controls=1&dnt=1`}
            width={VIDEO_W}
            height={VIDEO_H}
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
