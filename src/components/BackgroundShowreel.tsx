'use client';

import { useEffect, useRef, useState } from 'react';
import { usePerformanceTier } from '@/lib/usePerformanceTier';
import { usePrefersReducedMotion } from '@/lib/usePrefersReducedMotion';
import { useIsClient } from '@/lib/useIsClient';

const SHOWREEL_VIMEO_ID = '1172501942';
const VIMEO_ORIGIN = 'https://player.vimeo.com';
const SHOWREEL_VOLUME = 0.5;

// Barres d'égaliseur — durées/délais variés pour un mouvement organique.
const EQ_BARS = [
  { duration: '0.72s', delay: '0ms' },
  { duration: '1.05s', delay: '180ms' },
  { duration: '0.58s', delay: '90ms' },
  { duration: '0.92s', delay: '300ms' },
];

// Calque statique sobre — rendu identique côté serveur et au premier rendu
// client, donc aucune divergence d'hydratation. Sert aussi de fallback sur
// mobile / tier faible / reduced-motion.
function StaticBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      style={{
        background:
          'radial-gradient(120% 80% at 50% 30%, rgba(244,216,226,0.06) 0%, rgba(8,7,12,0) 60%)',
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

  // La vidéo de fond décode en continu et concurrence le canvas WebGL : on ne
  // la charge que sur les machines confortables (tier S/A) et hors reduced-motion.
  // `isClient` garantit que SSR + 1er rendu client produisent le même HTML
  // (StaticBackdrop) — la décision dépendante du device n'a lieu qu'après hydratation.
  const playVideo =
    isClient && (tier === 'S' || tier === 'A') && !reducedMotion;

  // Pilotage du player Vimeo (mute/volume) par postMessage — pas de dépendance.
  // Le clic utilisateur sert de "gesture" autorisant la lecture audio.
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
            // Ré-applique l'état son si l'iframe (re)charge alors que le son est actif.
            const win = iframeRef.current?.contentWindow;
            if (win && soundOn) {
              win.postMessage({ method: 'setVolume', value: SHOWREEL_VOLUME }, VIMEO_ORIGIN);
              win.postMessage({ method: 'setMuted', value: false }, VIMEO_ORIGIN);
            }
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-0"
          style={{
            // cover plein écran sans déformation ; unités relatives au conteneur
            // fixed inset-0 (100% au lieu de 100vw) → pas de scrollbar parasite.
            width: '177.78dvh',
            height: '100dvh',
            minWidth: '100%',
            minHeight: '177.78%',
          }}
        />
      </div>

      {/* Petite "radio" flottante — muette par défaut, clic = son du showreel en fond. */}
      <div className="pointer-events-none fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-[max(1.25rem,env(safe-area-inset-right))] z-50">
        <div className="relative">
          {/* Halo pulsé quand on air */}
          {soundOn && (
            <span
              aria-hidden
              className="radio-halo absolute inset-0 rounded-full"
              style={{ boxShadow: '0 0 0 1px #F4D8E2' }}
            />
          )}

          <button
            type="button"
            onClick={() => setSoundOn((v) => !v)}
            aria-label={
              soundOn ? 'Couper le son du showreel' : 'Activer le son du showreel'
            }
            aria-pressed={soundOn}
            className="group pointer-events-auto relative flex min-h-[44px] items-center gap-2.5 overflow-hidden rounded-full border bg-ink/70 px-3.5 py-2 backdrop-blur-md transition-all duration-300 hover:scale-[1.04] active:scale-95"
            style={{
              borderColor: soundOn
                ? 'rgba(244,216,226,0.8)'
                : 'rgba(232,230,236,0.22)',
              boxShadow: soundOn
                ? '0 0 32px -6px #F4D8E2, inset 0 0 18px -12px #F4D8E2'
                : '0 6px 20px -10px rgba(0,0,0,0.8)',
            }}
          >
            {/* Balayage lumineux qui traverse le pill quand on air */}
            {soundOn && (
              <span
                aria-hidden
                className="radio-sheen pointer-events-none absolute inset-y-0 w-1/3 -skew-x-12"
                style={{
                  background:
                    'linear-gradient(90deg, transparent, rgba(244,216,226,0.28), transparent)',
                }}
              />
            )}

            {/* Icône : égaliseur animé (on) ou haut-parleur coupé (off) */}
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

            {/* Libellé + point live */}
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
                style={{ color: soundOn ? '#F4D8E2' : 'rgba(232,230,236,0.7)' }}
              >
                {soundOn ? 'on air' : 'showreel'}
              </span>
            </span>
          </button>
        </div>
      </div>
    </>
  );
}
