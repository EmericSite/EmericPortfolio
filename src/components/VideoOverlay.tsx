'use client';

import { useEffect, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { projects } from '@/data/projects';
import { useHubStore } from '@/store/hub';

const SHOWREEL_VIMEO_ID = '1172501942';

type Source = {
  vimeoId: string;
  title: string;
  shortTitle: string;
  accent: string;
};

export default function VideoOverlay() {
  const { activeId, videoStarted, showreelOpen, stopVideo, closeShowreel } =
    useHubStore(
      useShallow((s) => ({
        activeId: s.activeId,
        videoStarted: s.videoStarted,
        showreelOpen: s.showreelOpen,
        stopVideo: s.stopVideo,
        closeShowreel: s.closeShowreel,
      })),
    );
  // On mémorise quel vimeoId a échoué plutôt que de réinitialiser un booléen
  // dans un effet quand la source change (dérivation > setState-dans-un-effet).
  const [erroredId, setErroredId] = useState<string | null>(null);

  const project = activeId
    ? projects.find((p) => p.id === activeId) ?? null
    : null;

  let source: Source | null = null;
  let close: () => void = stopVideo;
  if (showreelOpen) {
    source = {
      vimeoId: SHOWREEL_VIMEO_ID,
      title: 'Showreel 2025',
      shortTitle: 'Showreel · 2025',
      accent: '#F4D8E2',
    };
    close = closeShowreel;
  } else if (videoStarted && project) {
    source = {
      vimeoId: project.vimeoId,
      title: project.title,
      shortTitle: project.shortTitle,
      accent: project.accent,
    };
    close = stopVideo;
  }

  const iframeError = source != null && erroredId === source.vimeoId;

  useEffect(() => {
    if (!source) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [source, close]);

  if (!source) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Lecture de ${source.title}`}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-ink/95 backdrop-blur-md"
    >
      <button
        type="button"
        onClick={close}
        aria-label="Fermer la lecture"
        className="absolute top-4 right-4 md:top-6 md:right-6 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-chrome/40 bg-ink/70 text-chrome backdrop-blur transition-colors hover:border-cyanglitch hover:text-cyanglitch"
      >
        <span className="text-lg leading-none">×</span>
      </button>

      <div
        className="absolute top-4 left-4 md:top-6 md:left-6 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.25em] text-mist"
        aria-hidden
      >
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: source.accent }}
        />
        <span>{source.shortTitle}</span>
      </div>

      <div className="relative w-full h-full md:h-auto md:max-h-[90vh] md:w-[min(90vw,1600px)] aspect-video md:rounded-sm overflow-hidden bg-ink border-0 md:border md:border-fog">
        {!iframeError ? (
          <iframe
            key={source.vimeoId}
            src={`https://player.vimeo.com/video/${source.vimeoId}?autoplay=1&title=0&byline=0&portrait=0&controls=1&dnt=1`}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            onError={() => setErroredId(source.vimeoId)}
            className="absolute inset-0 h-full w-full border-0"
            title={source.title}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-ink/90 px-6 text-center">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-chrome/80">
              Lecture impossible ici
            </p>
            <a
              href={`https://vimeo.com/${source.vimeoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-sm border border-chrome/40 bg-ink/60 px-4 py-2 font-mono text-xs uppercase tracking-[0.25em] text-chrome transition-colors hover:border-cyanglitch hover:text-cyanglitch"
            >
              Ouvrir sur Vimeo ↗
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
