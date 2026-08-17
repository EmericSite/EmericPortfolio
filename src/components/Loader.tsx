// Emericfolio — created by Tomi-Tom, 2026
// Opening screen shown while the 3D assets load, with progress and a way to skip
'use client';

import { memo, useEffect, useState, useSyncExternalStore } from 'react';
import Image from 'next/image';
import { useProgress } from '@react-three/drei';
import { libelles, loader } from '@/content/site';
import { isSoftwareRenderer } from '@/lib/usePerformanceTier';

const subscribeToNothing = () => () => {};


function Loader() {
  const { progress, active, errors } = useProgress();
  // No 3D scene means drei never reports progress, so nothing would lift the
  // loader before the 25s safety net. Read after hydration, never during.
  const noScene = useSyncExternalStore(
    subscribeToNothing,
    isSoftwareRenderer,
    () => false,
  );
  const [hidden, setHidden] = useState(false);
  const [bootProgress, setBootProgress] = useState(8);
  const [showSkip, setShowSkip] = useState(false);

  // A failed asset never raises `loaded`, so the bar tops out short of 100 and
  // the visitor would stare at a frozen percentage until the 25s net. The scene
  // itself copes with a missing asset, so a broken load still means "come in".
  const stalled = errors.length > 0 && !active;

  // Adjusted during the render, not in an effect: the bar only ever moves
  // forward, and useProgress ticks often enough for a second commit to show.
  if (progress > bootProgress) setBootProgress(progress);

  useEffect(() => {
    if (noScene || stalled || (!active && progress >= 100)) {
      const timeout = setTimeout(() => setHidden(true), 900);
      return () => clearTimeout(timeout);
    }
  }, [noScene, stalled, active, progress]);

  // Escape hatch once loading drags on.
  useEffect(() => {
    const timeout = setTimeout(() => setShowSkip(true), 12000);
    return () => clearTimeout(timeout);
  }, []);

  // Hard cap so a stuck asset never traps the visitor on the loader.
  useEffect(() => {
    const timeout = setTimeout(() => setHidden(true), 25000);
    return () => clearTimeout(timeout);
  }, []);

  if (hidden) return null;

  const done = noScene || stalled || (!active && progress >= 100);

  return (
    <div
      // Hooks for the two CSS safety nets in globals.css: this layer is opaque
      // and server-rendered, so without JS it would be the whole site.
      data-loader
      className={`fixed inset-0 z-50 bg-ink flex items-center justify-center transition-opacity duration-700 ${
        done ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center gap-8">
        <div className="relative h-20 w-20">
          <Image
            src="/logo-mark.png"
            alt={libelles.logoChargement}
            fill
            className="object-contain opacity-90"
            sizes="80px"
            priority
          />
        </div>

        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-mist flex flex-col items-center gap-3">
          <span>{loader.texte}</span>
          <span className="text-magentaglitch">
            {Math.floor(bootProgress).toString().padStart(3, '0')}%
          </span>
        </div>

        <div className="h-px w-40 bg-fog overflow-hidden">
          <div
            className="h-full bg-pearl transition-[width] duration-300 ease-out"
            style={{ width: `${bootProgress}%` }}
          />
        </div>

        <button
          type="button"
          onClick={() => setHidden(true)}
          aria-hidden={!showSkip}
          tabIndex={showSkip ? 0 : -1}
          className={`font-mono text-[10px] uppercase tracking-[0.25em] text-mist border border-fog rounded-full px-5 py-2 transition-opacity duration-500 hover:border-cyanglitch hover:text-cyanglitch ${
            showSkip ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          {libelles.entrerQuandMeme}
        </button>
      </div>
    </div>
  );
}

export default memo(Loader);
