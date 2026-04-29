'use client';

const PHRASE = '·EMERIC.RESSY';
const REPEATS_PER_TRACK = 24;
const LINE_COUNT = 16;

function Track({ ariaHidden }: { ariaHidden?: boolean }) {
  return (
    <span
      aria-hidden={ariaHidden ? 'true' : undefined}
      className="flex shrink-0 whitespace-nowrap"
    >
      {Array.from({ length: REPEATS_PER_TRACK }, (_, i) => (
        <span key={i} className="pr-4">
          {PHRASE}
        </span>
      ))}
    </span>
  );
}

export default function MarqueeBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden flex flex-col select-none font-mono font-bold tracking-widest text-chrome opacity-[0.07]"
      style={{ fontSize: 'clamp(1.1rem, 2.2vw, 2.5rem)' }}
    >
      {Array.from({ length: LINE_COUNT }, (_, i) => {
        const reverse = i % 2 === 1;
        // Deterministic per-line speed variance keeps lines from syncing up
        const duration = 70 + ((i * 11) % 32);
        return (
          <div
            key={i}
            className="flex-1 flex items-center overflow-hidden"
          >
            <div
              className={`flex shrink-0 ${
                reverse ? 'animate-marquee-reverse' : 'animate-marquee'
              }`}
              style={{ animationDuration: `${duration}s` }}
            >
              <Track />
              <Track ariaHidden />
            </div>
          </div>
        );
      })}
    </div>
  );
}
