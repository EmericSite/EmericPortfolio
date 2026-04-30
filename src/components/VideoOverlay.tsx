'use client';

import { useEffect, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { projects } from '@/data/projects';
import { useHubStore } from '@/store/hub';

export default function VideoOverlay() {
  const { activeId, videoStarted, stopVideo } = useHubStore(
    useShallow((s) => ({
      activeId: s.activeId,
      videoStarted: s.videoStarted,
      stopVideo: s.stopVideo,
    })),
  );
  const [iframeError, setIframeError] = useState(false);

  const project = activeId
    ? projects.find((p) => p.id === activeId) ?? null
    : null;

  useEffect(() => {
    setIframeError(false);
  }, [activeId, videoStarted]);

  useEffect(() => {
    if (!videoStarted) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') stopVideo();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [videoStarted, stopVideo]);

  if (!videoStarted || !project) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Lecture de ${project.title}`}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-ink/95 backdrop-blur-md"
    >
      <button
        type="button"
        onClick={stopVideo}
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
          style={{ background: project.accent }}
        />
        <span>{project.shortTitle}</span>
      </div>

      <div className="relative w-full h-full md:h-auto md:max-h-[90vh] md:w-[min(90vw,1600px)] aspect-video md:rounded-sm overflow-hidden bg-ink border-0 md:border md:border-fog">
        {!iframeError ? (
          <iframe
            key={project.id}
            src={`https://player.vimeo.com/video/${project.vimeoId}?autoplay=1&title=0&byline=0&portrait=0&controls=1&dnt=1`}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            onError={() => setIframeError(true)}
            className="absolute inset-0 h-full w-full border-0"
            title={project.title}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-ink/90 px-6 text-center">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-chrome/80">
              Lecture impossible ici
            </p>
            <a
              href={`https://vimeo.com/${project.vimeoId}`}
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
