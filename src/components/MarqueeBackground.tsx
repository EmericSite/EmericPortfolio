'use client';

const PHRASE = '·EMERIC.RESSY';
const REPEATS_PER_TRACK = 36;
const LINE_COUNT = 48;

function Track({ ariaHidden }: { ariaHidden?: boolean }) {
  return (
    <span
      aria-hidden={ariaHidden ? 'true' : undefined}
      className="shrink-0 whitespace-nowrap"
    >
      {PHRASE.repeat(REPEATS_PER_TRACK)}
    </span>
  );
}

export default function MarqueeBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden flex flex-col select-none font-mono font-bold tracking-widest text-chrome opacity-15 leading-none"
      style={{ fontSize: 'clamp(0.6rem, 0.95vw, 1.05rem)' }}
    >
      {Array.from({ length: LINE_COUNT }, (_, i) => {
        const reverse = i % 2 === 1;
        const duration = 220 + ((i * 17) % 90);
        return (
          <div
            key={i}
            className="flex-1 flex items-center overflow-hidden"
          >
            <div
              className="flex shrink-0"
              style={{
                animation: `marquee ${duration}s linear infinite${reverse ? ' reverse' : ''}`,
                willChange: 'transform',
              }}
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
