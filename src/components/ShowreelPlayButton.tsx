'use client';

import { useShallow } from 'zustand/react/shallow';
import { useHubStore } from '@/store/hub';
import PlayGlyph from '@/components/PlayGlyph';

// Bouton showreel. Rendu en DOM 2D par-dessus le canvas, et non plus via
// <Html transform> à l'intérieur de la scène : drei rasterisait le bouton à
// travers une transform CSS 3D, ce qui rendait le glyphe et le label flous.
// Centré sur l'écran, ce qui correspond au centre de la relique tant qu'on
// est en mode hub/hover (la caméra n'est décalée qu'en about/contact).
export default function ShowreelPlayButton() {
  const { mode, openShowreel } = useHubStore(
    useShallow((s) => ({ mode: s.mode, openShowreel: s.openShowreel })),
  );

  const visible = mode === 'hub' || mode === 'hover';

  // pointer-events-none sur toute la couche : seul le bouton lui-même reçoit
  // les clics, sinon l'overlay avalerait le survol et la sélection des
  // cartouches rendues dans le canvas en dessous.
  return (
    <div
      className={`pointer-events-none absolute inset-0 z-10 flex items-center justify-center transition-opacity duration-500 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      aria-hidden={!visible}
    >
      {/* Mobile : les cartouches passent en pile plein écran et leur titre
          occupe le bas de la carte. On remonte le bouton pour ne pas écraser
          ce bloc de texte. */}
      <div className="pointer-events-none relative flex h-28 w-28 -translate-y-12 items-center justify-center sm:translate-y-0 md:h-32 md:w-32">
        <span
          className="play-ring absolute inset-0 rounded-full border-2"
          style={{ borderColor: '#F4D8E2' }}
          aria-hidden
        />
        <span
          className="play-ring absolute inset-0 rounded-full border"
          style={{
            borderColor: '#F4D8E2',
            animationDelay: '1.2s',
            opacity: 0.4,
          }}
          aria-hidden
        />
        <button
          type="button"
          onClick={openShowreel}
          tabIndex={visible ? 0 : -1}
          aria-label="Lire le showreel 2025"
          className="play-breathe pointer-events-auto relative flex h-full w-full items-center justify-center rounded-full border border-chrome/40 bg-ink/20 backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:border-chrome/80 hover:bg-ink/50"
          style={{ boxShadow: '0 0 44px -6px #F4D8E2' }}
        >
          <PlayGlyph
            className="h-9 w-9 md:h-11 md:w-11"
            style={{
              color: '#F4D8E2',
              filter: 'drop-shadow(0 0 14px rgba(244,216,226,0.85))',
            }}
          />
        </button>
        {/* Pas de label sous le bouton : l'affiche porte déjà « SHOWREEL
            2025 ». L'intitulé reste dans l'aria-label pour les lecteurs
            d'écran. */}
      </div>
    </div>
  );
}
