'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useProgress } from '@react-three/drei';

export default function Loader() {
  const { progress, active } = useProgress();
  const [hidden, setHidden] = useState(false);
  const [bootProgress, setBootProgress] = useState(8);

  useEffect(() => {
    setBootProgress((prev) => Math.max(prev, progress));
  }, [progress]);

  useEffect(() => {
    if (!active && progress >= 100) {
      const timeout = setTimeout(() => setHidden(true), 900);
      return () => clearTimeout(timeout);
    }
  }, [active, progress]);

  if (hidden) return null;

  const done = !active && progress >= 100;

  return (
    <div
      className={`fixed inset-0 z-50 bg-ink flex items-center justify-center transition-opacity duration-700 ${
        done ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center gap-8">
        <div className="relative h-20 w-20 animate-[spin_8s_linear_infinite]">
          <Image
            src="/logo.png"
            alt="Loading"
            fill
            className="object-contain opacity-90"
            sizes="80px"
            priority
          />
        </div>

        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-mist flex flex-col items-center gap-3">
          <span>Mélancolie électrique</span>
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
      </div>
    </div>
  );
}
