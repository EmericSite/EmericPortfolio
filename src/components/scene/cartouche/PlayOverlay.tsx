// Emericfolio — created by Tomi-Tom, 2026
// Glowing play button laid over an opened project card, until its video starts

'use client';

import { Html } from '@react-three/drei';
import { libelles } from '@/content/site';
import { useHubStore } from '@/store/hub';
import PlayGlyph from '@/components/PlayGlyph';

/** DOM play button laid over the active card, until the video starts. */
export default function PlayOverlay({
  accent,
  title,
  projectId,
}: {
  accent: string;
  title: string;
  projectId: string;
}) {
  const startProjectVideo = useHubStore((s) => s.startProjectVideo);

  return (
    <Html
      position={[0, 0, 0.12]}
      center
      zIndexRange={[100, 0]}
      style={{ pointerEvents: 'auto' }}
    >
      <div className="relative flex items-center justify-center">
        <span
          className="play-ring absolute inset-0 rounded-full border-2"
          style={{ borderColor: accent }}
          aria-hidden
        />
        <span
          className="play-ring absolute inset-0 rounded-full border-2"
          style={{ borderColor: accent, animationDelay: '0.8s' }}
          aria-hidden
        />
        <span
          className="play-ring absolute inset-0 rounded-full border-2"
          style={{ borderColor: accent, animationDelay: '1.6s' }}
          aria-hidden
        />
        <span
          className="absolute inset-0 rounded-full blur-2xl pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.18) 45%, rgba(255,255,255,0) 75%)',
            transform: 'scale(1.35)',
          }}
          aria-hidden
        />
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            startProjectVideo(projectId);
          }}
          aria-label={`${libelles.lireProjet} ${title}`}
          className="play-breathe relative flex h-28 w-28 items-center justify-center rounded-full border-2 bg-ink/75 backdrop-blur-md transition-all duration-300 hover:scale-110 hover:bg-ink/90"
          style={{
            borderColor: accent,
            boxShadow: `0 0 60px -2px rgba(255,255,255,0.35), 0 0 48px -4px ${accent}, inset 0 0 24px -12px ${accent}`,
          }}
        >
          <PlayGlyph
            className="h-10 w-10"
            style={{
              color: accent,
              filter: `drop-shadow(0 0 16px ${accent})`,
            }}
          />
          <span
            className="absolute -bottom-7 font-mono text-[9px] uppercase tracking-[0.3em] whitespace-nowrap"
            style={{ color: accent, opacity: 0.85 }}
          >
            {libelles.lire}
          </span>
        </button>
      </div>
    </Html>
  );
}
