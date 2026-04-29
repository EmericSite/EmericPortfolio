'use client';

import { useEffect, useRef } from 'react';
import { useHubStore } from '@/store/hub';
import { projects } from '@/data/projects';
import ProjectVideoPlayer from '@/components/ProjectVideoPlayer';
import { useFocusTrap } from '@/lib/useFocusTrap';

const TOTAL = projects.length;
const pad2 = (n: number) => n.toString().padStart(2, '0');

export default function HubOverlay() {
  const mode = useHubStore((s) => s.mode);
  const hoveredId = useHubStore((s) => s.hoveredId);
  const activeId = useHubStore((s) => s.activeId);
  const scrollIndex = useHubStore((s) => s.scrollIndex);
  const setMode = useHubStore((s) => s.setMode);
  const scrollNext = useHubStore((s) => s.scrollNext);
  const scrollPrev = useHubStore((s) => s.scrollPrev);

  const active = activeId
    ? projects.find((p) => p.id === activeId) ?? null
    : null;
  const hovered = hoveredId
    ? projects.find((p) => p.id === hoveredId) ?? null
    : null;
  const scrollFocused =
    mode === 'hub' || mode === 'hover' ? projects[scrollIndex] : null;

  const focused = active ?? hovered ?? scrollFocused;
  const inHubFlow = mode === 'hub' || mode === 'hover';

  const projectPanelRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useFocusTrap(projectPanelRef, !!active);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMode('hub');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setMode]);

  useEffect(() => {
    if (active) {
      const id = window.setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 0);
      return () => window.clearTimeout(id);
    }
  }, [active]);

  return (
    <>
      {/* Bottom-left: focused project info */}
      <div
        className={`pointer-events-none absolute bottom-6 left-6 md:bottom-12 md:left-12 z-20 max-w-md transition-all duration-500 ${
          inHubFlow && focused
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-3'
        }`}
      >
        {focused && (
          <div className="border border-fog bg-ink/70 backdrop-blur rounded-sm p-5 pointer-events-auto">
            <div className="flex items-center gap-3 mb-2 font-mono text-[10px] uppercase tracking-[0.25em] text-mist">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: focused.accent }}
              />
              <span>{focused.year}</span>
              <span className="text-mist/40">·</span>
              <span>{focused.tag}</span>
            </div>
            <div className="font-display text-2xl md:text-3xl leading-tight text-pearl">
              {focused.title}
            </div>
            <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.25em] text-cyanglitch">
              cliquer pour ouvrir →
            </div>
          </div>
        )}
      </div>

      {/* Bottom-right: project counter + scroll nav */}
      <div
        className={`absolute bottom-6 right-6 md:bottom-12 md:right-12 z-20 transition-opacity duration-500 ${
          mode === 'about' || mode === 'contact'
            ? 'opacity-0 pointer-events-none'
            : 'opacity-100'
        }`}
      >
        <div className="flex items-center gap-4 border border-fog rounded-full bg-ink/40 backdrop-blur px-2 py-2 pointer-events-auto">
          <button
            type="button"
            onClick={scrollPrev}
            aria-label="Projet précédent"
            className="h-8 w-8 flex items-center justify-center rounded-full text-mist hover:text-cyanglitch hover:bg-fog/40 transition-colors"
          >
            <span className="font-mono text-xs">↑</span>
          </button>
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-chrome">
            {pad2(scrollIndex + 1)}{' '}
            <span className="text-mist/50">/ {pad2(TOTAL)}</span>
          </div>
          <button
            type="button"
            onClick={scrollNext}
            aria-label="Projet suivant"
            className="h-8 w-8 flex items-center justify-center rounded-full text-mist hover:text-cyanglitch hover:bg-fog/40 transition-colors"
          >
            <span className="font-mono text-xs">↓</span>
          </button>
        </div>
        <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-mist/50 mt-3 text-center">
          scroll · ← →
        </div>
      </div>

      {/* Project full content (when active) */}
      <div
        ref={projectPanelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-title"
        className={`absolute inset-y-0 right-0 z-20 w-full md:w-[480px] transition-all duration-700 ease-out ${
          active
            ? 'translate-x-0 opacity-100'
            : 'translate-x-12 opacity-0 pointer-events-none'
        }`}
      >
        {active && (
          <div className="h-full overflow-y-auto bg-ink/85 backdrop-blur-md border-l border-fog px-8 md:px-12 py-28 md:py-32">
            <div className="mb-8">
              <ProjectVideoPlayer project={active} />
            </div>

            <div className="flex items-center gap-3 mb-6 font-mono text-[10px] uppercase tracking-[0.25em] text-mist">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: active.accent }}
              />
              <span>{active.year}</span>
              <span className="text-mist/40">·</span>
              <span>{active.tag}</span>
            </div>

            <h2
              id="project-title"
              className="font-display text-4xl md:text-5xl leading-[1.05] text-pearl mb-8"
            >
              {active.title}
            </h2>

            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-cyanglitch mb-3">
              Rôle
            </div>
            <div className="text-chrome mb-8">{active.role}</div>

            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-cyanglitch mb-3">
              Description
            </div>
            <p className="text-mist leading-relaxed mb-10">
              {active.description}
            </p>

            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-cyanglitch mb-4">
              Crédits
            </div>
            <div className="space-y-2 mb-12">
              {active.credits.map((c) => (
                <div
                  key={c.label}
                  className="grid grid-cols-[120px_1fr] gap-4 border-t border-fog/60 pt-2"
                >
                  <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-mist">
                    {c.label}
                  </div>
                  <div className="text-chrome text-sm">{c.value}</div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setMode('hub')}
              className="group inline-flex items-center gap-3 border border-fog rounded-full px-6 py-3 font-mono text-[10px] uppercase tracking-[0.25em] text-chrome hover:border-cyanglitch hover:text-cyanglitch transition-colors"
            >
              <span className="transition-transform group-hover:-translate-x-1">
                ←
              </span>
              retour au hub
            </button>
          </div>
        )}

        {active && (
          <button
            ref={closeButtonRef}
            type="button"
            onClick={() => setMode('hub')}
            aria-label="Fermer"
            className="absolute top-6 right-6 md:top-10 md:right-10 h-10 w-10 flex items-center justify-center border border-fog rounded-full bg-ink/60 backdrop-blur text-chrome hover:border-magentaglitch hover:text-magentaglitch transition-colors z-10"
          >
            <span className="font-mono text-sm">×</span>
          </button>
        )}
      </div>
    </>
  );
}
