// Emericfolio — created by Tomi-Tom, 2026
// Play button laid over the canvas on the showreel card of the hub
'use client';

import { useShallow } from 'zustand/react/shallow';
import { useHubStore } from '@/store/hub';
import { useViewportScale } from '@/lib/useViewportScale';
import { wrappedRank } from '@/lib/wrappedRank';
import {
  showreelAccent,
  showreelAccentRgba,
  showreelCard,
  showreelIndex,
} from '@/data/showreel';
import PlayGlyph from '@/components/PlayGlyph';
import { libelles } from '@/content/site';

// Plain DOM over the canvas: inside the scene, drei's <Html transform> rasterizes
// it through a CSS transform and blurs it.
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

  const onStage = mode === 'hub' || mode === 'hover';

  const rank = wrappedRank(showreelIndex, scrollIndex, cardCount);
  // The finger offset keeps it continuous, so the button fades in with the card
  // instead of popping.
  const proximity = Math.max(0, 1 - Math.abs(rank - dragOffset));

  const opacity = !onStage ? 0 : layout === 'stack' ? proximity : 1;
  const clickable = opacity > 0.6;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center"
      style={{
        opacity,
        // No transition in stack layout: opacity already tracks the finger
        // frame by frame, a transition would lag behind the card.
        transition: layout === 'stack' ? 'none' : 'opacity 500ms',
      }}
      aria-hidden={!clickable}
    >
      <div className="pointer-events-none relative flex h-28 w-28 items-center justify-center md:h-32 md:w-32">
        <span
          className="play-ring absolute inset-0 rounded-full border-2"
          style={{ borderColor: showreelAccent }}
          aria-hidden
        />
        <span
          className="play-ring absolute inset-0 rounded-full border"
          style={{
            borderColor: showreelAccent,
            animationDelay: '1.2s',
            opacity: 0.4,
          }}
          aria-hidden
        />
        <button
          type="button"
          onClick={openShowreel}
          tabIndex={clickable ? 0 : -1}
          aria-label={`${libelles.lirePrefixe} ${showreelCard.title}`}
          className={`play-breathe relative flex h-full w-full items-center justify-center rounded-full border border-chrome/40 bg-ink/20 backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:border-chrome/80 hover:bg-ink/50 ${
            clickable ? 'pointer-events-auto' : 'pointer-events-none'
          }`}
          style={{ boxShadow: `0 0 44px -6px ${showreelAccent}` }}
        >
          <PlayGlyph
            className="h-9 w-9 md:h-11 md:w-11"
            style={{
              color: showreelAccent,
              filter: `drop-shadow(0 0 14px ${showreelAccentRgba(0.85)})`,
            }}
          />
        </button>
      </div>
    </div>
  );
}
