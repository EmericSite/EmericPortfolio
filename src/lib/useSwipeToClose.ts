// Emericfolio — created by Tomi-Tom, 2026
// Lets a touch user dismiss an open panel by swiping it off the side

'use client';

import { useEffect, useRef } from 'react';

const SWIPE_THRESHOLD = 80;

/** `direction` is the swipe direction that closes: 'right' closes on a rightward swipe. */
export function useSwipeToClose(
  ref: React.RefObject<HTMLElement | null>,
  active: boolean,
  direction: 'left' | 'right',
  onClose: () => void,
) {
  // Callers pass an inline arrow: keep it in a ref so a re-render between
  // touchstart and touchend does not reattach the listeners and lose the gesture.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

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
      if (Math.abs(dx) < SWIPE_THRESHOLD) return;
      if (Math.abs(dx) < Math.abs(dy)) return;
      if (direction === 'right' && dx > 0) onCloseRef.current();
      else if (direction === 'left' && dx < 0) onCloseRef.current();
    };

    el.addEventListener('touchstart', onStart, { passive: true });
    el.addEventListener('touchend', onEnd, { passive: true });
    return () => {
      el.removeEventListener('touchstart', onStart);
      el.removeEventListener('touchend', onEnd);
    };
  }, [ref, active, direction]);
}
