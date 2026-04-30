'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[route error]', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-ink text-chrome flex flex-col items-center justify-center px-6 text-center font-mono">
      <p className="text-xs uppercase tracking-[0.3em] text-magentaglitch mb-6">
        404 · ressource hors-orbite
      </p>
      <h2 className="font-display text-3xl md:text-5xl text-pearl mb-6">
        Quelque chose a glissé.
      </h2>
      <p className="text-mist text-sm max-w-md mb-8">
        Le hub n&rsquo;a pas pu se charger. Recharge la page — si le souci
        persiste, essaie en navigation privée (cache).
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="border border-fog rounded-full px-6 py-3 text-[10px] uppercase tracking-[0.25em] hover:border-cyanglitch hover:text-cyanglitch transition-colors"
      >
        Recharger
      </button>
      {error?.digest && (
        <p className="mt-8 text-[10px] text-mist/40 tracking-widest">
          ref · {error.digest}
        </p>
      )}
    </div>
  );
}
