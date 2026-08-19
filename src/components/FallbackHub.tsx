// Emericfolio — created by Tomi-Tom, 2026
// Flat grid of project posters, shown instead of the 3D hub when WebGL is unavailable
'use client';

import Image from 'next/image';
import { useShallow } from 'zustand/react/shallow';
import { projects } from '@/data/projects';
import { showreelCard, showreelPosterUrl } from '@/data/showreel';
import { useHubStore } from '@/store/hub';
import { pad2 } from '@/lib/format';
import { libelles } from '@/content/site';
import PlayGlyph from '@/components/PlayGlyph';

export default function FallbackHub() {
  const { hoveredId, activeId, scrollIndex, setHovered, setActive, openShowreel } =
    useHubStore(
      useShallow((s) => ({
        hoveredId: s.hoveredId,
        activeId: s.activeId,
        scrollIndex: s.scrollIndex,
        setHovered: s.setHovered,
        setActive: s.setActive,
        openShowreel: s.openShowreel,
      })),
    );

  return (
    // The page shell is a fixed-height stage, so the grid has to scroll on its
    // own once enough projects are added; m-auto centers it while it still fits.
    <div className="absolute inset-0 z-10 flex overflow-y-auto overscroll-contain px-4 sm:px-8 md:px-16 py-28 sm:py-32">
      <div className="relative m-auto w-full max-w-6xl">
        <div className="absolute inset-x-0 -top-24 sm:-top-28 flex justify-center pointer-events-none">
          <div className="relative h-24 w-24 sm:h-32 sm:w-32 opacity-90">
            <Image
              src="/logo-mark.png"
              alt=""
              fill
              sizes="128px"
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* The 3D hub puts the showreel at its centre; without a scene it would
            have no entry point at all, so it leads the grid instead. */}
        <button
          type="button"
          onClick={openShowreel}
          aria-label={`${libelles.lirePrefixe} ${showreelCard.title}`}
          className="group relative mb-3 sm:mb-4 md:mb-6 flex w-full items-center gap-4 overflow-hidden rounded-md border border-fog p-3 text-left transition-colors duration-300 hover:border-pearl/60 focus-visible:border-pearl/60"
        >
          <span className="relative h-16 w-24 shrink-0 overflow-hidden rounded-sm sm:h-20 sm:w-32">
            <Image
              src={showreelPosterUrl}
              alt=""
              fill
              sizes="128px"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-display text-lg leading-tight text-pearl sm:text-xl">
              {showreelCard.title}
            </span>
            <span className="mt-1 block font-mono text-[9px] uppercase tracking-[0.2em] text-mist">
              {showreelCard.year}
            </span>
          </span>
          <span
            aria-hidden
            className="mr-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-colors duration-300"
            style={{ borderColor: showreelCard.accent, color: showreelCard.accent }}
          >
            <PlayGlyph className="h-3.5 w-3.5" />
          </span>
        </button>

        <ul
          aria-label={libelles.projets}
          className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6"
        >
          {projects.map((project, i) => {
            const isHovered = hoveredId === project.id;
            const isActive = activeId === project.id;
            const isFocused = scrollIndex === i;
            return (
              <li key={project.id}>
                <button
                  type="button"
                  onClick={(e) => {
                    const bounds = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - bounds.left;
                    const y = e.clientY - bounds.top;
                    const isCenter =
                      window.matchMedia('(max-width: 767px)').matches &&
                      Math.abs(x - bounds.width / 2) < bounds.width * 0.27 &&
                      Math.abs(y - bounds.height / 2) < bounds.height * 0.27;
                    if (isCenter) {
                      useHubStore.getState().startProjectVideo(project.id);
                    } else {
                      setActive(project.id);
                    }
                  }}
                  onMouseEnter={() => setHovered(project.id)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => setHovered(project.id)}
                  onBlur={() => setHovered(null)}
                  className={`group relative w-full aspect-[3/4] overflow-hidden rounded-md border transition-all duration-300 ${
                    isActive
                      ? 'border-cyanglitch shadow-[0_0_20px_-4px_var(--color-cyanglitch)]'
                      : isHovered || isFocused
                        ? 'border-pearl/60'
                        : 'border-fog'
                  }`}
                  aria-label={`${libelles.ouvrirProjet} ${project.title}`}
                >
                  <Image
                    src={project.posterUrl}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 280px"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-x-0 top-0 flex items-center justify-between p-2 font-mono text-[9px] uppercase tracking-[0.2em] text-chrome">
                    <span className="bg-ink/80 px-1.5 py-0.5 rounded-sm">
                      {pad2(i + 1)}
                    </span>
                    <span className="bg-ink/80 px-1.5 py-0.5 rounded-sm">
                      {project.year}
                    </span>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink via-ink/85 to-transparent p-3 text-left">
                    <div
                      className="font-display text-base sm:text-lg leading-tight text-pearl mb-1"
                      style={{
                        textShadow: '0 1px 2px rgba(0,0,0,0.6)',
                      }}
                    >
                      {project.shortTitle}
                    </div>
                    <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-mist truncate">
                      {project.tag}
                    </div>
                  </div>
                  <span
                    className="absolute top-2 right-12 h-1.5 w-1.5 rounded-full"
                    style={{ background: project.accent }}
                    aria-hidden
                  />
                </button>
              </li>
            );
          })}
        </ul>

        <p className="mt-6 sm:mt-8 text-center font-mono text-[10px] uppercase tracking-[0.25em] text-mist/60">
          {libelles.modeAllege}
        </p>
      </div>
    </div>
  );
}
