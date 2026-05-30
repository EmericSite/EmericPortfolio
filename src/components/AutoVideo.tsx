'use client';

import { useEffect, useRef } from 'react';

type AutoVideoProps = {
  src: string;
  poster?: string;
  className?: string;
  controls?: boolean;
  /** Joue tant que visible. La promesse play() est catchée (pas d'unhandledRejection). */
};

/**
 * <video> en lecture auto, mais qui gère la promesse `play()` — sinon un
 * démontage/interruption pendant l'autoplay rejette une promesse non capturée
 * (AbortError/NotAllowedError) que le navigateur remonte en unhandledRejection.
 */
export default function AutoVideo({
  src,
  poster,
  className,
  controls = false,
}: AutoVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let cancelled = false;
    const p = el.play();
    if (p && typeof p.then === 'function') {
      // Avale les rejets bénins (autoplay interrompu / démontage).
      p.catch(() => {});
    }
    return () => {
      cancelled = true;
      // Pause au démontage pour éviter une promesse pendante.
      if (!el.paused) el.pause();
      void cancelled;
    };
  }, [src]);

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      loop
      muted
      playsInline
      preload="metadata"
      controls={controls}
      className={className}
      aria-hidden={!controls}
    />
  );
}
