'use client';

import { useEffect } from 'react';

const SWIPE_THRESHOLD = 80;

/**
 * Detects a horizontal swipe gesture on a target element.
 * direction='right' fires onClose when the user swipes right;
 * direction='left' fires when they swipe left.
 */
export function useSwipeToClose(
  ref: React.RefObject<HTMLElement | null>,
  active: boolean,
  direction: 'left' | 'right',
  onClose: () => void,
) {
  useEffect(() => {
    if (!active) return;
    const el = ref.current;
    if (!el) return;

    let startX: number | null = null;
    let startY: number | null = null;

    const onStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };

    const onEnd = (e: TouchEvent) => {
      if (startX === null || startY === null) return;
      const t = e.changedTouches[0];
      if (!t) return;
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;
      startX = null;
      startY = null;
      // Only trigger on dominantly horizontal swipes
      if (Math.abs(dx) < SWIPE_THRESHOLD) return;
      if (Math.abs(dx) < Math.abs(dy)) return;
      if (direction === 'right' && dx > 0) onClose();
      else if (direction === 'left' && dx < 0) onClose();
    };

    el.addEventListener('touchstart', onStart, { passive: true });
    el.addEventListener('touchend', onEnd, { passive: true });
    return () => {
      el.removeEventListener('touchstart', onStart);
      el.removeEventListener('touchend', onEnd);
    };
  }, [ref, active, direction, onClose]);
}
