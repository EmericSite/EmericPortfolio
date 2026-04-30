'use client';

import { useEffect, useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useHubStore } from '@/store/hub';
import { projects } from '@/data/projects';
import { useFocusTrap } from '@/lib/useFocusTrap';

const TOTAL = projects.length;
const pad2 = (n: number) => n.toString().padStart(2, '0');

export default function HubOverlay() {
  const { mode, activeId, scrollIndex, setMode, scrollNext, scrollPrev } =
    useHubStore(
      useShallow((s) => ({
        mode: s.mode,
        activeId: s.activeId,
        scrollIndex: s.scrollIndex,
        setMode: s.setMode,
        scrollNext: s.scrollNext,
        scrollPrev: s.scrollPrev,
      }))
    );

  const active = activeId
    ? projects.find((p) => p.id === activeId) ?? null
    : null;

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
        closeButtonRef.current?.focus({ preventScroll: true });
      }, 0);
      return () => window.clearTimeout(id);
    }
  }, [active]);

  return (
    <>
      {/* Bottom-right: project counter + scroll nav */}
      <div
        className={`absolute bottom-4 right-4 md:bottom-12 md:right-12 z-20 transition-opacity duration-500 ${
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
        <div className="hidden md:block font-mono text-[9px] uppercase tracking-[0.3em] text-mist/50 mt-3 text-center">
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
          <div className="relative h-full overflow-y-auto bg-ink/85 backdrop-blur-md border-l border-fog">
            {/* Sticky header — back to hub + close */}
            <div className="sticky top-0 z-30 flex items-center justify-between gap-3 px-6 md:px-12 py-4 bg-ink/85 backdrop-blur-md border-b border-fog/50">
              <button
                type="button"
                onClick={() => setMode('hub')}
                className="group inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-chrome hover:text-cyanglitch transition-colors"
              >
                <span className="transition-transform group-hover:-translate-x-1">
                  ←
                </span>
                retour
              </button>
              <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.25em] text-mist/70">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: active.accent }}
                />
                <span>
                  {pad2(scrollIndex + 1)} / {pad2(TOTAL)}
                </span>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={() => setMode('hub')}
                aria-label="Fermer"
                className="h-8 w-8 flex items-center justify-center rounded-full border border-fog text-chrome hover:border-magentaglitch hover:text-magentaglitch transition-colors"
              >
                <span className="font-mono text-xs">×</span>
              </button>
            </div>

            <div className="px-6 md:px-12 pt-8 pb-24 md:pb-32">
              <div className="flex items-center gap-3 mb-6 font-mono text-[10px] uppercase tracking-[0.25em] text-mist">
                <span>{active.year}</span>
                <span className="text-mist/40">·</span>
                <span>{active.tag}</span>
              </div>

              <h2
                id="project-title"
                className="font-display text-3xl md:text-5xl leading-[1.05] text-pearl mb-8"
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
            </div>
          </div>
        )}
      </div>
    </>
  );
}
