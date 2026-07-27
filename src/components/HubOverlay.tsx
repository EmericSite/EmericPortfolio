'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { useShallow } from 'zustand/react/shallow';
import { useHubStore } from '@/store/hub';
import {
  projects,
  GALLERY_CATEGORIES,
  categoriesFor,
  galleryFor,
  type GalleryItem,
} from '@/data/projects';
import { useFocusTrap } from '@/lib/useFocusTrap';
import Lightbox from '@/components/Lightbox';
import AutoVideo from '@/components/AutoVideo';
import PlayGlyph from '@/components/PlayGlyph';

const TOTAL = projects.length;
const pad2 = (n: number) => n.toString().padStart(2, '0');

// Une vignette de galerie : conserve le ratio réel du média, zoom au survol,
// clic pour agrandir. La hauteur de boîte suit width/height de l'item.
function GalleryTile({
  item,
  onOpen,
}: {
  item: GalleryItem;
  onOpen: () => void;
}) {
  const ratio =
    item.width && item.height ? `${item.width} / ${item.height}` : '16 / 9';
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label="Agrandir le média"
      className="media-tile mb-3 block w-full break-inside-avoid border border-fog/50 hover:border-chrome/70"
      style={{ aspectRatio: ratio }}
    >
      {item.type === 'video' ? (
        <AutoVideo src={item.src} poster={item.poster} />
      ) : (
        <Image
          src={item.src}
          alt={item.alt ?? ''}
          width={item.width ?? 1600}
          height={item.height ?? 900}
          sizes="(max-width: 768px) 90vw, 30vw"
          className="object-cover"
        />
      )}
      <span className="media-tile__zoom" aria-hidden>
        ⤢
      </span>
      {item.category && (
        <span className="media-tile__cap" aria-hidden>
          <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-chrome/90 inline-flex items-center gap-1.5">
            {item.type === 'video' && <PlayGlyph className="h-2.5 w-2.5" />}
            {item.category}
          </span>
        </span>
      )}
    </button>
  );
}

export default function HubOverlay() {
  const { activeId, scrollIndex, setMode } = useHubStore(
    useShallow((s) => ({
      activeId: s.activeId,
      scrollIndex: s.scrollIndex,
      setMode: s.setMode,
    })),
  );

  const active = activeId
    ? projects.find((p) => p.id === activeId) ?? null
    : null;

  const projectPanelRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  // Lightbox : index dans la galerie complète (ordre d'affichage par sections).
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useFocusTrap(projectPanelRef, !!active);

  // Sections à afficher pour ce projet, dans l'ordre voulu.
  const sections = useMemo(
    () => (active ? categoriesFor(active) : GALLERY_CATEGORIES),
    [active],
  );

  // Galerie ordonnée par sections (= ordre du lightbox), + indices d'origine.
  const orderedGallery = useMemo<GalleryItem[]>(() => {
    if (!active) return [];
    const media = galleryFor(active);
    if (media.length === 0) return [];
    const cats = [...sections];
    const known = media.filter(
      (it) => it.category && cats.includes(it.category),
    );
    const unknown = media.filter(
      (it) => !it.category || !cats.includes(it.category),
    );
    const sorted = cats.flatMap((c) => known.filter((it) => it.category === c));
    return [...sorted, ...unknown];
  }, [active, sections]);

  // Pas de projet actif => pas de lightbox (dérivation, sans setState en effet).
  const effectiveLightboxIndex = active ? lightboxIndex : null;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Esc ferme d'abord la lightbox (gérée dans Lightbox), sinon le panneau.
      if (e.key === 'Escape' && effectiveLightboxIndex === null) setMode('hub');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setMode, effectiveLightboxIndex]);

  useEffect(() => {
    if (!active) return;
    const id = window.setTimeout(() => {
      closeButtonRef.current?.focus({ preventScroll: true });
    }, 0);
    return () => window.clearTimeout(id);
  }, [active]);

  return (
    <>
      {/* Project full content (when active) — panneau large (~45% de l'écran) */}
      <div
        ref={projectPanelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-title"
        className={`absolute inset-y-0 right-0 z-20 w-full md:w-[46vw] md:min-w-[560px] md:max-w-[860px] transition-all duration-700 ease-out ${
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
                className="h-11 w-11 flex items-center justify-center rounded-full border border-fog text-chrome hover:border-magentaglitch hover:text-magentaglitch transition-colors"
              >
                <span className="font-mono text-xs">×</span>
              </button>
            </div>

            <div className="px-6 md:px-12 pt-10 pb-24 md:pb-32">
              <div className="flex items-center gap-3 mb-6 font-mono text-[10px] uppercase tracking-[0.25em] text-mist">
                <span>{active.year}</span>
                <span className="text-mist/40">·</span>
                <span>{active.tag}</span>
              </div>

              <h2
                id="project-title"
                className="font-display text-4xl md:text-6xl leading-[1.02] text-pearl mb-6"
              >
                {active.title}
              </h2>

              <p className="text-mist/90 text-lg md:text-xl leading-relaxed mb-12 max-w-2xl">
                {active.blurb}
              </p>

              <div className="grid sm:grid-cols-[160px_1fr] gap-x-8 gap-y-3 mb-12 border-t border-fog/40 pt-6">
                <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-cyanglitch pt-1">
                  Rôle
                </div>
                <div className="text-chrome">{active.role}</div>
                <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-cyanglitch pt-1">
                  Description
                </div>
                <p className="text-mist leading-relaxed">
                  {active.description}
                </p>
              </div>

              {orderedGallery.length > 0 && (
                <div className="mb-14 space-y-12">
                  {sections.map((category) => {
                    const items = orderedGallery.filter(
                      (it) => it.category === category,
                    );
                    if (items.length === 0) return null;
                    return (
                      <section key={category}>
                        <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-cyanglitch mb-5 flex items-center justify-between border-b border-fog/40 pb-2">
                          <span>{category}</span>
                          <span className="text-mist/50">
                            {pad2(items.length)}
                          </span>
                        </div>
                        {/* Grille maçonnée : chaque média garde son ratio. */}
                        <div className="columns-2 gap-3 [&>*]:mb-3">
                          {items.map((item) => {
                            const idx = orderedGallery.indexOf(item);
                            return (
                              <GalleryTile
                                key={item.src}
                                item={item}
                                onOpen={() => setLightboxIndex(idx)}
                              />
                            );
                          })}
                        </div>
                      </section>
                    );
                  })}

                  {/* Médias sans catégorie connue — filet de sécurité */}
                  {(() => {
                    const uncategorized = orderedGallery.filter(
                      (it) => !it.category || !sections.includes(it.category),
                    );
                    if (uncategorized.length === 0) return null;
                    return (
                      <section>
                        <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-cyanglitch mb-5 flex items-center justify-between border-b border-fog/40 pb-2">
                          <span>Galerie</span>
                          <span className="text-mist/50">
                            {pad2(uncategorized.length)}
                          </span>
                        </div>
                        <div className="columns-2 gap-3 [&>*]:mb-3">
                          {uncategorized.map((item) => {
                            const idx = orderedGallery.indexOf(item);
                            return (
                              <GalleryTile
                                key={item.src}
                                item={item}
                                onOpen={() => setLightboxIndex(idx)}
                              />
                            );
                          })}
                        </div>
                      </section>
                    );
                  })()}
                </div>
              )}

              <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-cyanglitch mb-4">
                Crédits
              </div>
              <div className="space-y-2 mb-12">
                {active.credits.map((c) => (
                  <div
                    key={c.label}
                    className="grid grid-cols-[140px_1fr] gap-4 border-t border-fog/60 pt-2"
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

      {active && (
        <Lightbox
          items={orderedGallery}
          index={effectiveLightboxIndex}
          accent={active.accent}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}
    </>
  );
}
