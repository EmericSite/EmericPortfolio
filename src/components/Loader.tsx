'use client';

import { memo, useEffect, useState } from 'react';
import Image from 'next/image';
import { useProgress } from '@react-three/drei';
import { loader } from '@/content/site';

function Loader() {
  const { progress, active } = useProgress();
  const [hidden, setHidden] = useState(false);
  const [bootProgress, setBootProgress] = useState(8);
  const [showSkip, setShowSkip] = useState(false);

  useEffect(() => {
    setBootProgress((prev) => Math.max(prev, progress));
  }, [progress]);

  useEffect(() => {
    if (!active && progress >= 100) {
      const timeout = setTimeout(() => setHidden(true), 900);
      return () => clearTimeout(timeout);
    }
  }, [active, progress]);

  // Show "entrer quand même" button after 12s as a safety net
  useEffect(() => {
    const timeout = setTimeout(() => setShowSkip(true), 12000);
    return () => clearTimeout(timeout);
  }, []);

  // Hard cap: auto-hide after 25s no matter what
  useEffect(() => {
    const timeout = setTimeout(() => setHidden(true), 25000);
    return () => clearTimeout(timeout);
  }, []);

  if (hidden) return null;

  const done = !active && progress >= 100;

  return (
    <div
      className={`fixed inset-0 z-50 bg-ink flex items-center justify-center transition-opacity duration-700 ${
        done ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center gap-8">
        <div
          className="relative h-20 w-20 animate-[spin_8s_linear_infinite]"
          style={{ willChange: 'transform' }}
        >
          <Image
            src="/logo-mark.png"
            alt="Loading"
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
          entrer quand même
        </button>
      </div>
    </div>
  );
}

export default memo(Loader);
