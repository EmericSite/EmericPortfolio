// Emericfolio — created by Tomi-Tom, 2026
// Fullscreen Vimeo player for a project film or for the showreel
'use client';

import { useEffect, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { projects } from '@/data/projects';
import { showreelCard } from '@/data/showreel';
import { useHubStore } from '@/store/hub';
import { libelles, showreel } from '@/content/site';

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
  // Store which vimeoId failed rather than resetting a boolean from an effect
  // when the source changes.
  const [erroredId, setErroredId] = useState<string | null>(null);

  const project = activeId
    ? projects.find((p) => p.id === activeId) ?? null
    : null;

  let source: Source | null = null;
  let close: () => void = stopVideo;
  if (showreelOpen) {
    source = {
      vimeoId: showreelCard.vimeoId,
      title: showreelCard.title,
      // Longer than the card title, which has to fit on the 3D cartouche.
      shortTitle: showreel.titreCourt,
      accent: showreelCard.accent,
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

  // Depend on the id, not on `source`: that object is rebuilt at every render
  // and would re-subscribe the listener for nothing.
  const sourceId = source?.vimeoId ?? null;

  useEffect(() => {
    if (!sourceId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sourceId, close]);

  if (!source) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${libelles.lectureEnCours} ${source.title}`}
      className="fixed inset-0 z-[9999] flex min-h-[100svh] items-center justify-center overflow-auto bg-ink/95 p-0 backdrop-blur-md"
    >
      <button
        type="button"
        onClick={close}
        aria-label={libelles.fermerLecture}
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

      <div className="relative aspect-video w-full max-w-[1600px] overflow-hidden bg-ink border-0 md:max-h-[90vh] md:w-[min(90vw,1600px)] md:rounded-sm md:border md:border-fog">
        {!iframeError ? (
          <iframe
            key={source.vimeoId}
            src={`https://player.vimeo.com/video/${source.vimeoId}?autoplay=1&playsinline=1&title=0&byline=0&portrait=0&controls=1&dnt=1`}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            onError={() => setErroredId(source.vimeoId)}
            className="absolute inset-0 h-full w-full border-0"
            title={source.title}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-ink/90 px-6 text-center">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-chrome/80">
              {libelles.lectureImpossible}
            </p>
            <a
              href={`https://vimeo.com/${source.vimeoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-sm border border-chrome/40 bg-ink/60 px-4 py-2 font-mono text-xs uppercase tracking-[0.25em] text-chrome transition-colors hover:border-cyanglitch hover:text-cyanglitch"
            >
              {libelles.ouvrirSurVimeo}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
