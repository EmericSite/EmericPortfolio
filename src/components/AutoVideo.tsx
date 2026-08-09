// Emericfolio — created by Tomi-Tom, 2026
// Video that plays only while on screen, and swallows the interrupted play()
'use client';

import { useEffect, useRef } from 'react';

type AutoVideoProps = {
  src: string;
  poster?: string;
  className?: string;
  controls?: boolean;
};

/**
 * Video that plays only while it is on screen, and handles the `play()`
 * promise: an interruption or an unmount mid-autoplay would otherwise surface
 * as an unhandledRejection.
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

    const play = () => {
      const p = el.play();
      if (p && typeof p.then === 'function') {
        p.catch(() => {});
      }
    };
    // Stop decoding frames as soon as the video is off screen or unmounted.
    const stop = () => {
      if (!el.paused) el.pause();
    };

    // Opening a project mounts every thumbnail at once, next to the WebGL
    // canvas: only the ones actually in view are worth downloading and decoding.
    const observer =
      typeof IntersectionObserver === 'undefined'
        ? null
        : new IntersectionObserver(
            ([entry]) => (entry.isIntersecting ? play() : stop()),
            // These clips carry no poster, so a tile reached without warning
            // would show black: start one screen early.
            { rootMargin: '100% 0px' },
          );

    if (observer) observer.observe(el);
    else play();

    return () => {
      observer?.disconnect();
      stop();
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
