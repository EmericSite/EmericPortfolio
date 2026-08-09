// Emericfolio — created by Tomi-Tom, 2026
// Decorative wall of repeated text scrolling behind the hub

import { marquee } from '@/content/site';

const PHRASE = marquee;
const PHRASE_REPEATS = 40;
const LINE_COUNT = 24;
const TRACK = PHRASE.repeat(PHRASE_REPEATS);

export default function MarqueeBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-[1] overflow-hidden flex flex-col select-none font-mono font-bold tracking-widest text-chrome leading-none"
      style={{ fontSize: 'clamp(0.85rem, 3.2svh, 1.85rem)', opacity: 0.1 }}
    >
      {Array.from({ length: LINE_COUNT }, (_, i) => (
        <div
          key={i}
          className="flex-1 flex items-center overflow-hidden"
        >
          <div
            className={`marquee-track ${i % 2 === 1 ? 'marquee-track-reverse' : ''}`}
          >
            <span className="shrink-0 whitespace-nowrap">{TRACK}</span>
            <span aria-hidden className="shrink-0 whitespace-nowrap">{TRACK}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
