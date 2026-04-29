'use client';

import { Html } from '@react-three/drei';
import { projects } from '@/data/projects';
import { useHubStore } from '@/store/hub';

// World-space anchor where the active cartouche flies to.
// Must mirror ACTIVE_TARGET in CartoucheOrbit.tsx.
const ANCHOR: [number, number, number] = [0, 0.1, 1.5];
// drei Html transform maps 1 CSS px → 1 world unit, then we multiply by `scale`.
// We render a 16:9 panel sized to roughly match the active cartouche's height
// (1.83 world). 480 × 0.004 = 1.92 wide ≈ 1.08 tall — video fills the frame
// with no letterboxing.
const VIDEO_W = 480;
const VIDEO_H = 270;
const HTML_SCALE = 0.004;

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
