'use client';

import { useEffect } from 'react';
import { useHubStore } from '@/store/hub';

const WHEEL_THRESHOLD = 60;
const TOUCH_THRESHOLD = 60;
const COOLDOWN_MS = 350;

export default function ScrollNav() {
  useEffect(() => {
    let acc = 0;
    let lastTime = 0;
    let rAFPending = false;
    let rAFId = 0;

    const isHubFlow = () => {
      const { mode, activeId } = useHubStore.getState();
      return (
        (mode === 'hub' || mode === 'hover') && activeId === null
      );
    };

    const advance = (dir: 1 | -1) => {
      const now = Date.now();
      if (now - lastTime < COOLDOWN_MS) return;
      lastTime = now;
      const { scrollNext, scrollPrev } = useHubStore.getState();
      if (dir > 0) scrollNext();
      else scrollPrev();
    };

    const onWheel = (e: WheelEvent) => {
      if (!isHubFlow()) return;
      e.preventDefault();
      // Molette verticale ou glissement horizontal sur trackpad : on prend
      // l'axe dominant, cohérent avec le swipe tactile horizontal.
      acc += Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (rAFPending) return;
      rAFPending = true;
      rAFId = requestAnimationFrame(() => {
        if (Math.abs(acc) >= WHEEL_THRESHOLD) {
          advance(acc > 0 ? 1 : -1);
          acc = 0;
        }
        rAFPending = false;
      });
    };

    const onKey = (e: KeyboardEvent) => {
      if (!isHubFlow()) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        advance(1);
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        advance(-1);
      }
    };

    // Tactile : on navigue à l'horizontale (glisser vers la gauche = projet
    // suivant), plus intuitif qu'un défilement vertical sur un carrousel.
    let touchStart: { x: number; y: number } | null = null;

    const onTouchStart = (e: TouchEvent) => {
      if (!isHubFlow()) return;
      if (e.touches.length === 0) return;
      touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (touchStart === null) return;
      const start = touchStart;
      touchStart = null;
      if (!isHubFlow()) return;
      const touch = e.changedTouches[0];
      if (!touch) return;
      const deltaX = start.x - touch.clientX;
      const deltaY = start.y - touch.clientY;
      // Geste clairement vertical : on ignore, pour ne pas déclencher une
      // navigation sur un scroll involontaire.
      if (Math.abs(deltaY) > Math.abs(deltaX)) return;
      if (Math.abs(deltaX) < TOUCH_THRESHOLD) return;
      advance(deltaX > 0 ? 1 : -1);
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKey);
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
      if (rAFId) cancelAnimationFrame(rAFId);
    };
  }, []);

  return null;
}
