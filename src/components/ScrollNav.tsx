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
      acc += e.deltaY;
      if (Math.abs(acc) < WHEEL_THRESHOLD) return;
      advance(acc > 0 ? 1 : -1);
      acc = 0;
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

    let touchStartY: number | null = null;

    const onTouchStart = (e: TouchEvent) => {
      if (!isHubFlow()) return;
      if (e.touches.length === 0) return;
      touchStartY = e.touches[0].clientY;
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (touchStartY === null) return;
      const startY = touchStartY;
      touchStartY = null;
      if (!isHubFlow()) return;
      const endY = e.changedTouches[0]?.clientY;
      if (endY === undefined) return;
      const deltaY = startY - endY;
      if (Math.abs(deltaY) < TOUCH_THRESHOLD) return;
      advance(deltaY > 0 ? 1 : -1);
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
    };
  }, []);

  return null;
}
