// Emericfolio — created by Tomi-Tom, 2026
// Full sheet of the selected project: story, credits and media gallery
'use client';

import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
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
import { useFocusOnOpen } from '@/lib/useFocusOnOpen';
import { pad2 } from '@/lib/format';
import Lightbox from '@/components/Lightbox';
import AutoVideo from '@/components/AutoVideo';
import PlayGlyph from '@/components/PlayGlyph';
import { libelles } from '@/content/site';

const TOTAL = projects.length;

// Box ratio comes from the item's own width/height so the media is never
// cropped or stretched.
function GalleryTile({
  item,
  accent,
  onOpen,
}: {
  item: GalleryItem;
  accent: string;
  onOpen: () => void;
}) {
  const ratio =
    item.width && item.height ? `${item.width} / ${item.height}` : '16 / 9';
  const tileRef = useRef<HTMLDivElement | null>(null);

  const playInline = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const video = tileRef.current?.querySelector('video');
    if (!video) return;

    video.play().catch(() => {
      // Some mobile browsers reject playback when the media has audio.
      // Falling back to muted keeps the interaction reliable after a tap.
      video.muted = true;
      void video.play();
    });
  };

  return (
    <div
      ref={tileRef}
      className="media-tile relative mb-3 block w-full break-inside-avoid border border-fog/50 hover:border-chrome/70"
      style={{ aspectRatio: ratio }}
    >
      <button
        type="button"
        onClick={onOpen}
        aria-label={libelles.agrandirMedia}
        className="absolute inset-0 z-0 h-full w-full"
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
      </button>

      <span className="media-tile__zoom pointer-events-none relative z-10" aria-hidden>
        ⤢
      </span>

      {item.type === 'video' && (
        <button
          type="button"
          onClick={playInline}
          aria-label={`${libelles.lireProjet} ${item.alt ?? item.category ?? ''}`}
          className="play-breathe absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 flex h-16 w-16 items-center justify-center rounded-full border-2 bg-ink/75 backdrop-blur-md md:hidden"
          style={{
            borderColor: accent,
            boxShadow: `0 0 32px -2px rgba(255,255,255,0.35), 0 0 28px -4px ${accent}, inset 0 0 16px -10px ${accent}`,
          }}
        >
          <PlayGlyph
            className="h-6 w-6"
            style={{
              color: accent,
              filter: `drop-shadow(0 0 10px ${accent})`,
            }}
          />
          <span
            className="absolute -bottom-5 font-mono text-[8px] uppercase tracking-[0.25em] whitespace-nowrap"
            style={{ color: accent, opacity: 0.9 }}
          >
            {libelles.lire}
          </span>
        </button>
      )}

      {item.category && (
        <span className="media-tile__cap pointer-events-none relative z-10" aria-hidden>
          <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-chrome/90 inline-flex items-center gap-1.5">
            {item.type === 'video' && <PlayGlyph className="h-2.5 w-2.5" />}
            {item.category}
          </span>
        </span>
      )}
    </div>
  );
}

export default function ProjectPanel() {
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
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  // Index into the ordered gallery, not into the section it was clicked from.
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const sections = useMemo(
    () => (active ? categoriesFor(active) : GALLERY_CATEGORIES),
    [active],
  );

  // Section order also defines the lightbox navigation order.
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

  // Same media, grouped for display: `index` is the position in orderedGallery,
  // which is what the lightbox navigates by.
  const gallerySections = useMemo(() => {
    const groups = new Map<
      string | null,
      { item: GalleryItem; index: number }[]
    >();
    orderedGallery.forEach((item, index) => {
      const key =
        item.category && sections.includes(item.category) ? item.category : null;
      const group = groups.get(key);
      if (group) group.push({ item, index });
      else groups.set(key, [{ item, index }]);
    });
    // A null key means the media has no category, or one the project dropped.
    return [...groups].map(([key, items]) => ({
      key: key ?? '',
      title: key ?? libelles.galerie,
      items,
    }));
  }, [orderedGallery, sections]);

  // Derived rather than reset in an effect when the project closes.
  const effectiveLightboxIndex = active ? lightboxIndex : null;

  // Released while the lightbox is open: it renders outside the panel, so the
  // trap would keep the Tab key from ever reaching it.
  useFocusTrap(projectPanelRef, !!active && effectiveLightboxIndex === null);
  useFocusOnOpen(closeButtonRef, active);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Lightbox handles Escape itself, so only close the panel when it is shut.
      if (e.key === 'Escape' && effectiveLightboxIndex === null) setMode('hub');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setMode, effectiveLightboxIndex]);

  // The panel only covers the right half, so a wheel over the 3D scene would
  // do nothing and the sheet would look frozen.
  useEffect(() => {
    if (!active || effectiveLightboxIndex !== null) return;

    const onWheel = (e: WheelEvent) => {
      const zone = scrollRef.current;
      if (!zone) return;
      // Cursor already over the panel: let the browser scroll it natively.
      if (e.target instanceof Node && zone.contains(e.target)) return;

      // Forward the raw delta and let the browser clamp scrollTop, but convert
      // first: some wheels report lines (Firefox) or pages instead of pixels.
      let pixels = e.deltaY;
      if (e.deltaMode === 1) {
        const lineHeight = parseFloat(getComputedStyle(zone).lineHeight);
        pixels *= Number.isFinite(lineHeight) ? lineHeight : 16;
      } else if (e.deltaMode === 2) {
        pixels *= zone.clientHeight;
      }
      zone.scrollTop += pixels;
    };

    window.addEventListener('wheel', onWheel, { passive: true });
    return () => window.removeEventListener('wheel', onWheel);
  }, [active, effectiveLightboxIndex]);

  return (
    <>
      {/* The outer shell carries the slide transition, so it stays mounted; the
          dialog role goes on the inner node, which only exists with a project. */}
      <div
        ref={projectPanelRef}
        className={`absolute inset-y-0 right-0 z-20 w-full md:w-[46vw] md:min-w-[560px] md:max-w-[860px] transition-all duration-700 ease-out ${
          active
            ? 'translate-x-0 opacity-100'
            : 'translate-x-12 opacity-0 pointer-events-none'
        }`}
      >
        {active && (
          <div
            ref={scrollRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-title"
            className="relative h-full overflow-y-auto bg-ink/85 backdrop-blur-md border-l border-fog"
          >
            <div className="sticky top-0 z-30 flex items-center justify-between gap-3 px-6 md:px-12 py-4 bg-ink/85 backdrop-blur-md border-b border-fog/50">
              <button
                type="button"
                onClick={() => setMode('hub')}
                className="group inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-chrome hover:text-cyanglitch transition-colors"
              >
                <span className="transition-transform group-hover:-translate-x-1">
                  ←
                </span>
                {libelles.retour}
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
                aria-label={libelles.fermer}
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
                  {libelles.role}
                </div>
                <div className="text-chrome">{active.role}</div>
                <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-cyanglitch pt-1">
                  {libelles.natureProjet}
                </div>
                <div className="text-chrome">
                  {active.kind === 'client'
                    ? libelles.projetClient
                    : libelles.projetPersonnel}
                </div>
                <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-cyanglitch pt-1">
                  {libelles.description}
                </div>
                <p className="text-mist leading-relaxed">
                  {active.description}
                </p>
              </div>

              {orderedGallery.length > 0 && (
                <div className="mb-14 space-y-12">
                  {gallerySections.map((section) => (
                    <section key={section.key}>
                      <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-cyanglitch mb-5 flex items-center justify-between border-b border-fog/40 pb-2">
                        <span>{section.title}</span>
                        <span className="text-mist/50">
                          {pad2(section.items.length)}
                        </span>
                      </div>
                      {/* Masonry columns so each media keeps its own ratio. */}
                      <div className="columns-2 gap-3 [&>*]:mb-3">
                        {section.items.map(({ item, index }) => (
                          <GalleryTile
                            key={item.src}
                            item={item}
                            accent={active.accent}
                            onOpen={() => setLightboxIndex(index)}
                          />
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              )}

              <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-cyanglitch mb-4">
                {libelles.credits}
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
