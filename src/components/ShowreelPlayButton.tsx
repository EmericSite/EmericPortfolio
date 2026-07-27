'use client';

import { useShallow } from 'zustand/react/shallow';
import { useHubStore } from '@/store/hub';
import { useViewportScale } from '@/lib/useViewportScale';
import { projects } from '@/data/projects';
import PlayGlyph from '@/components/PlayGlyph';

// Rang de la cartouche showreel dans la pile : ajoutée en fin de liste par
// CartoucheOrbit lorsque la disposition est en pile.
const SHOWREEL_INDEX = projects.length;

// Bouton showreel, en DOM 2D par-dessus le canvas. Passé par <Html transform>
// à l'intérieur de la scène, drei le rasterisait à travers une transform CSS
// et le rendait flou.
//
// En orbite il se pose sur le pin, au centre de l'écran, où la caméra le
// laisse tant qu'on est en mode hub ou hover. En pile il appartient à la
// cartouche showreel : il n'apparaît donc que lorsque celle-ci est devant, et
// se fond au fil du glissement plutôt que de surgir d'un coup.
export default function ShowreelPlayButton() {
  const { mode, scrollIndex, dragOffset, cardCount, openShowreel } =
    useHubStore(
      useShallow((s) => ({
        mode: s.mode,
        scrollIndex: s.scrollIndex,
        dragOffset: s.dragOffset,
        cardCount: s.cardCount,
        openShowreel: s.openShowreel,
      })),
    );
  const { layout } = useViewportScale();

  const enScene = mode === 'hub' || mode === 'hover';

  // Distance de la cartouche showreel au centre, en nombre de cartes, repli
  // circulaire compris. Le décalage du doigt la rend continue.
  let ecart = SHOWREEL_INDEX - scrollIndex;
  if (ecart > cardCount / 2) ecart -= cardCount;
  if (ecart < -cardCount / 2) ecart += cardCount;
  const proximite = Math.max(0, 1 - Math.abs(ecart - dragOffset));

  const opacite = !enScene ? 0 : layout === 'stack' ? proximite : 1;
  const cliquable = opacite > 0.6;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center"
      style={{
        opacity: opacite,
        // Pas de transition en pile : l'opacité suit déjà le doigt image par
        // image, une transition la ferait traîner derrière la cartouche.
        transition: layout === 'stack' ? 'none' : 'opacity 500ms',
      }}
      aria-hidden={!cliquable}
    >
      <div className="pointer-events-none relative flex h-28 w-28 items-center justify-center md:h-32 md:w-32">
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
          tabIndex={cliquable ? 0 : -1}
          aria-label="Lire le showreel 2025"
          className={`play-breathe relative flex h-full w-full items-center justify-center rounded-full border border-chrome/40 bg-ink/20 backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:border-chrome/80 hover:bg-ink/50 ${
            cliquable ? 'pointer-events-auto' : 'pointer-events-none'
          }`}
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
      </div>
    </div>
  );
}
