'use client';

import Image from 'next/image';
import { useShallow } from 'zustand/react/shallow';
import { projects } from '@/data/projects';
import { useHubStore } from '@/store/hub';

export default function FallbackHub() {
  const { hoveredId, activeId, scrollIndex, setHovered, setActive } =
    useHubStore(
      useShallow((s) => ({
        hoveredId: s.hoveredId,
        activeId: s.activeId,
        scrollIndex: s.scrollIndex,
        setHovered: s.setHovered,
        setActive: s.setActive,
      })),
    );

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center px-4 sm:px-8 md:px-16 pointer-events-none">
      <div className="relative w-full max-w-6xl pointer-events-auto">
        <div className="absolute inset-x-0 -top-24 sm:-top-28 flex justify-center pointer-events-none">
          <div className="relative h-24 w-24 sm:h-32 sm:w-32 opacity-90">
            <Image
              src="/logo.png"
              alt=""
              fill
              sizes="128px"
              className="object-contain"
              priority
            />
          </div>
        </div>

        <ul
          aria-label="Projets"
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
                  onClick={() => setActive(project.id)}
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
                  aria-label={`Ouvrir ${project.title}`}
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
                      {String(i + 1).padStart(2, '0')}
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
          mode allégé · ton GPU ne supporte pas la scène 3D
        </p>
      </div>
    </div>
  );
}
