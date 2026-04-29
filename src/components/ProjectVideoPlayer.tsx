'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import type { Project } from '@/data/projects';

export default function ProjectVideoPlayer({ project }: { project: Project }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset to poster state whenever the project changes
  useEffect(() => {
    setIsPlaying(false);
  }, [project.id]);

  // Drop out of "playing" when the user exits fullscreen
  useEffect(() => {
    const handler = () => {
      if (!document.fullscreenElement) {
        setIsPlaying(false);
      }
    };
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const handlePlay = () => {
    setIsPlaying(true);
    // Request fullscreen on the container — gives Vimeo's player full surface
    requestAnimationFrame(() => {
      const el = containerRef.current;
      if (!el) return;
      const req = el.requestFullscreen?.bind(el);
      if (req) {
        req().catch(() => {
          // Fullscreen denied — fall back to inline playback
        });
      }
    });
  };

  return (
    <div
      ref={containerRef}
      className="relative aspect-video w-full overflow-hidden rounded-sm border border-fog bg-ink"
    >
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
      {isPlaying && (
        <iframe
          key={project.id}
          src={`https://player.vimeo.com/video/${project.vimeoId}?autoplay=1&title=0&byline=0&portrait=0&controls=1&dnt=1`}
          frameBorder={0}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0 bg-ink"
          title={project.title}
        />
      )}
    </div>
  );
}
