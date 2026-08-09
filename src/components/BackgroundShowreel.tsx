// Emericfolio — created by Tomi-Tom, 2026
// Showreel video backdrop sitting behind every page, with its sound toggle
'use client';

import { useEffect, useRef, useState } from 'react';
import { usePerformanceTier } from '@/lib/usePerformanceTier';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import { useIsClient } from '@/lib/useIsClient';
import { showreelAccent, showreelAccentRgba } from '@/data/showreel';
import { libelles, showreel } from '@/content/site';

const SHOWREEL_VIMEO_ID = showreel.vimeoId;
const VIMEO_ORIGIN = 'https://player.vimeo.com';
const SHOWREEL_VOLUME = 0.5;

// Varied durations and delays so the bars never move in sync.
const EQ_BARS = [
  { duration: '0.72s', delay: '0ms' },
  { duration: '1.05s', delay: '180ms' },
  { duration: '0.58s', delay: '90ms' },
  { duration: '0.92s', delay: '300ms' },
];

// Rendered on the server and on the first client render, so hydration matches.
// Also the fallback for mobile, low tier and reduced motion.
function StaticBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      style={{
        background: `radial-gradient(120% 80% at 50% 30%, ${showreelAccentRgba(0.06)} 0%, rgba(8,7,12,0) 60%)`,
      }}
    />
  );
}

export default function BackgroundShowreel() {
  const isClient = useIsClient();
  const tier = usePerformanceTier();
  const reducedMotion = usePrefersReducedMotion();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [soundOn, setSoundOn] = useState(false);

  // The video decodes non stop and competes with the WebGL canvas, so it only
  // loads on fast devices; `isClient` delays that choice until after hydration.
  const playVideo =
    isClient && (tier === 'S' || tier === 'A') && !reducedMotion;

  // The Vimeo player is driven by postMessage, and the click on the button is
  // the user gesture that lets the browser unmute.
  useEffect(() => {
    const win = iframeRef.current?.contentWindow;
    if (!win) return;
    const post = (method: string, value: unknown) =>
      win.postMessage({ method, value }, VIMEO_ORIGIN);
    if (soundOn) {
      post('setVolume', SHOWREEL_VOLUME);
      post('setMuted', false);
    } else {
      post('setMuted', true);
    }
    // playVideo is a dep because the iframe only exists once it flips true.
  }, [soundOn, playVideo]);

  if (!playVideo) return <StaticBackdrop />;

  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
        style={{ opacity: soundOn ? 0.62 : 0.5, transition: 'opacity 600ms ease' }}
      >
        <iframe
          ref={iframeRef}
          src={`${VIMEO_ORIGIN}/video/${SHOWREEL_VIMEO_ID}?background=1&dnt=1&muted=1&playsinline=1`}
          allow="autoplay; fullscreen"
          loading="lazy"
          title=""
          tabIndex={-1}
          onLoad={() => {
            // The iframe may reload while sound is on, so push the state again.
            const win = iframeRef.current?.contentWindow;
            if (win && soundOn) {
              win.postMessage({ method: 'setVolume', value: SHOWREEL_VOLUME }, VIMEO_ORIGIN);
              win.postMessage({ method: 'setMuted', value: false }, VIMEO_ORIGIN);
            }
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-0"
          style={{
            // Full cover without distortion; sized from the fixed container
            // (100% instead of 100vw) to avoid a stray scrollbar.
            width: '177.78dvh',
            height: '100dvh',
            minWidth: '100%',
            minHeight: '177.78%',
          }}
        />
      </div>

      <div className="pointer-events-none fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-[max(1.25rem,env(safe-area-inset-right))] z-50">
        <div className="relative">
          {soundOn && (
            <span
              aria-hidden
              className="radio-halo absolute inset-0 rounded-full"
              style={{ boxShadow: `0 0 0 1px ${showreelAccent}` }}
            />
          )}

          <button
            type="button"
            onClick={() => setSoundOn((v) => !v)}
            aria-label={
              soundOn ? libelles.couperSon : libelles.activerSon
            }
            aria-pressed={soundOn}
            className="group pointer-events-auto relative flex min-h-[44px] items-center gap-2.5 overflow-hidden rounded-full border bg-ink/70 px-3.5 py-2 backdrop-blur-md transition-all duration-300 hover:scale-[1.04] active:scale-95"
            style={{
              borderColor: soundOn
                ? showreelAccentRgba(0.8)
                : 'rgba(232,230,236,0.22)',
              boxShadow: soundOn
                ? `0 0 32px -6px ${showreelAccent}, inset 0 0 18px -12px ${showreelAccent}`
                : '0 6px 20px -10px rgba(0,0,0,0.8)',
            }}
          >
            {soundOn && (
              <span
                aria-hidden
                className="radio-sheen pointer-events-none absolute inset-y-0 w-1/3 -skew-x-12"
                style={{
                  background: `linear-gradient(90deg, transparent, ${showreelAccentRgba(0.28)}, transparent)`,
                }}
              />
            )}

            <span
              className="relative flex h-4 w-[18px] items-end justify-center gap-[2px]"
              aria-hidden
            >
              {soundOn ? (
                EQ_BARS.map((bar, i) => (
                  <span
                    key={i}
                    className="eq-bar w-[2px] rounded-full bg-pearl"
                    style={{
                      height: '100%',
                      animationDuration: bar.duration,
                      animationDelay: bar.delay,
                    }}
                  />
                ))
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4 text-chrome/70 transition-colors group-hover:text-chrome"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M11 5 6 9H3v6h3l5 4z" />
                  <line x1="23" y1="9" x2="17" y2="15" />
                  <line x1="17" y1="9" x2="23" y2="15" />
                </svg>
              )}
            </span>

            <span className="relative flex items-center gap-1.5">
              {soundOn && (
                <span
                  aria-hidden
                  className="live-dot h-1.5 w-1.5 rounded-full bg-magentaglitch"
                  style={{ boxShadow: '0 0 8px #FF2D9C' }}
                />
              )}
              <span
                className="font-mono text-[9px] uppercase tracking-[0.28em] transition-colors"
                style={{
                  color: soundOn ? showreelAccent : 'rgba(232,230,236,0.7)',
                }}
              >
                {soundOn ? libelles.sonActif : libelles.sonCoupe}
              </span>
            </span>
          </button>
        </div>
      </div>
    </>
  );
}
