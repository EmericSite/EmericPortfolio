'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import type { Project } from '@/data/projects';

export default function ProjectVideoPlayer({ project }: { project: Project }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPseudoFullscreen, setIsPseudoFullscreen] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset to poster state whenever the project changes
  useEffect(() => {
    setIsPlaying(false);
    setIsPseudoFullscreen(false);
    setIframeError(false);
  }, [project.id]);

  // Drop out of "playing" when the user exits native fullscreen
  useEffect(() => {
    const handler = () => {
      const fsEl =
        document.fullscreenElement ||
        (document as Document & { webkitFullscreenElement?: Element })
          .webkitFullscreenElement;
      if (!fsEl) {
        setIsPlaying(false);
      }
    };
    document.addEventListener('fullscreenchange', handler);
    document.addEventListener('webkitfullscreenchange', handler);
    return () => {
      document.removeEventListener('fullscreenchange', handler);
      document.removeEventListener('webkitfullscreenchange', handler);
    };
  }, []);

  // ESC key exits pseudo-fullscreen
  useEffect(() => {
    if (!isPseudoFullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        exitPseudoFullscreen();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPseudoFullscreen]);

  const exitPseudoFullscreen = () => {
    setIsPseudoFullscreen(false);
    setIsPlaying(false);
    setIframeError(false);
  };

  const handlePlay = () => {
    setIsPlaying(true);
    setIframeError(false);

    const isIOS =
      typeof navigator !== 'undefined' &&
      /iPhone|iPad|iPod/i.test(navigator.userAgent);

    requestAnimationFrame(() => {
      const el = containerRef.current;
      if (!el) return;

      const req = el.requestFullscreen?.bind(el);

      if (!req || isIOS) {
        // No native fullscreen on this element (iOS Safari) — pseudo-fullscreen
        setIsPseudoFullscreen(true);
        return;
      }

      req().catch(() => {
        // Native fullscreen rejected — fall back to pseudo-fullscreen
        setIsPseudoFullscreen(true);
      });
    });
  };

  const containerClass = isPseudoFullscreen
    ? 'fixed inset-0 z-[9999] bg-ink overflow-hidden'
    : 'relative aspect-video w-full overflow-hidden rounded-sm border border-fog bg-ink';

  return (
    <div ref={containerRef} className={containerClass}>
      {!isPlaying && (
        <button
          type="button"
          onClick={handlePlay}
          aria-label={`Lire ${project.title}`}
          className="group absolute inset-0 z-10 flex items-center justify-center cursor-pointer"
        >
          <Image
            src={project.posterUrl}
            alt={project.title}
            fill
            sizes="(max-width: 768px) 100vw, 480px"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
          <div
            className="absolute top-3 left-3 z-10 h-2 w-2 rounded-full"
            style={{ background: project.accent }}
          />
          <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full border border-chrome/40 bg-ink/60 backdrop-blur transition-all duration-300 group-hover:scale-110 group-hover:border-cyanglitch group-hover:bg-ink/80">
            <span
              className="ml-1 text-2xl"
              style={{ color: project.accent, textShadow: `0 0 18px ${project.accent}` }}
            >
              ▶
            </span>
          </div>
          <div className="absolute bottom-3 right-3 z-10 font-mono text-[10px] uppercase tracking-[0.25em] text-chrome/80">
            plein écran ↗
          </div>
        </button>
      )}
      {isPlaying && !iframeError && (
        <iframe
          key={project.id}
          src={`https://player.vimeo.com/video/${project.vimeoId}?autoplay=1&title=0&byline=0&portrait=0&controls=1&dnt=1`}
          frameBorder={0}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          onError={() => setIframeError(true)}
          className="absolute inset-0 h-full w-full border-0 bg-ink"
          title={project.title}
        />
      )}
      {isPlaying && iframeError && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-ink/90 px-6 text-center">
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
      {isPseudoFullscreen && (
        <button
          type="button"
          onClick={exitPseudoFullscreen}
          aria-label="Fermer le plein écran"
          className="absolute top-4 right-4 z-[10000] flex h-10 w-10 items-center justify-center rounded-full border border-chrome/40 bg-ink/70 text-chrome backdrop-blur transition-colors hover:border-cyanglitch hover:text-cyanglitch"
        >
          <span className="text-lg leading-none">✕</span>
        </button>
      )}
    </div>
  );
}
