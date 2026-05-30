'use client';

import { useCallback, useEffect } from 'react';
import Image from 'next/image';
import type { GalleryItem } from '@/data/projects';
import AutoVideo from '@/components/AutoVideo';

type LightboxProps = {
  items: GalleryItem[];
  index: number | null;
  accent: string;
  onClose: () => void;
  onNavigate: (next: number) => void;
};

export default function Lightbox({
  items,
  index,
  accent,
  onClose,
  onNavigate,
}: LightboxProps) {
  const open = index !== null && index >= 0 && index < items.length;

  const go = useCallback(
    (dir: number) => {
      if (index === null) return;
      const next = (index + dir + items.length) % items.length;
      onNavigate(next);
    },
    [index, items.length, onNavigate],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    // Bloque le scroll de fond pendant l'ouverture.
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose, go]);

  if (!open || index === null) return null;
  const item = items[index];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Aperçu du média"
      className="fixed inset-0 z-[9998] flex items-center justify-center bg-ink/92 backdrop-blur-xl animate-[fade-in_0.25s_ease-out]"
      onClick={onClose}
    >
      {/* Compteur + fermeture */}
      <div className="absolute top-[max(1.25rem,env(safe-area-inset-top))] left-0 right-0 flex items-center justify-between px-5 md:px-8">
        <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-mist">
          {String(index + 1).padStart(2, '0')} /{' '}
          {String(items.length).padStart(2, '0')}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer l'aperçu"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-chrome/30 bg-ink/60 text-chrome backdrop-blur transition-colors hover:border-magentaglitch hover:text-magentaglitch"
        >
          <span className="text-xl leading-none">×</span>
        </button>
      </div>

      {/* Flèches */}
      {items.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              go(-1);
            }}
            aria-label="Média précédent"
            className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full border border-chrome/25 bg-ink/50 text-chrome backdrop-blur transition-all hover:scale-110 hover:border-chrome/70"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              go(1);
            }}
            aria-label="Média suivant"
            className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full border border-chrome/25 bg-ink/50 text-chrome backdrop-blur transition-all hover:scale-110 hover:border-chrome/70"
          >
            ›
          </button>
        </>
      )}

      {/* Média (le clic dessus ne ferme pas) */}
      <div
        className="relative max-h-[82vh] max-w-[90vw] overflow-hidden rounded-sm"
        style={{ boxShadow: `0 0 80px -20px ${accent}` }}
        onClick={(e) => e.stopPropagation()}
      >
        {item.type === 'video' ? (
          <AutoVideo
            key={item.src}
            src={item.src}
            controls
            className="max-h-[82vh] max-w-[90vw] object-contain"
          />
        ) : (
          <Image
            key={item.src}
            src={item.src}
            alt={item.alt ?? ''}
            width={item.width ?? 1600}
            height={item.height ?? 900}
            sizes="90vw"
            className="max-h-[82vh] w-auto object-contain animate-[fade-in_0.3s_ease-out]"
            priority
          />
        )}
      </div>

      {item.category && (
        <div className="absolute bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-0 right-0 text-center">
          <span
            className="font-mono text-[10px] uppercase tracking-[0.3em]"
            style={{ color: accent }}
          >
            {item.category}
          </span>
        </div>
      )}
    </div>
  );
}
