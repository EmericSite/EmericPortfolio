// Emericfolio — created by Tomi-Tom, 2026
// Turns wheel, arrow keys and touch swipes into moves from one hub card to the next
'use client';

import { useEffect } from 'react';
import { useHubStore } from '@/store/hub';
import { isSoftwareRenderer } from '@/lib/usePerformanceTier';

const WHEEL_THRESHOLD = 60;
const COOLDOWN_MS = 350;

export default function ScrollNav() {
  useEffect(() => {
    let acc = 0;
    let lastTime = 0;
    let rAFPending = false;
    let rAFId = 0;

    // Without the 3D carousel there is nothing to advance, and swallowing the
    // wheel would trap the fallback grid.
    if (isSoftwareRenderer()) return;

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
      // Take the dominant axis so a trackpad swipe works like a mouse wheel.
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

    // Cards follow the finger during the whole gesture, then snap on release.
    let touchStart: { x: number; y: number; t: number } | null = null;
    let axis: 'undecided' | 'horizontal' | 'vertical' = 'undecided';

    // Finger distance worth one card.
    const stepDistance = () =>
      Math.max(120, Math.min(window.innerWidth * 0.45, 320));

    const onTouchStart = (e: TouchEvent) => {
      if (!isHubFlow()) return;
      if (e.touches.length === 0) return;
      const t = e.touches[0];
      touchStart = { x: t.clientX, y: t.clientY, t: Date.now() };
      axis = 'undecided';
    };

    const onTouchMove = (e: TouchEvent) => {
      if (touchStart === null || !isHubFlow()) return;
      const t = e.touches[0];
      if (!t) return;
      const dx = t.clientX - touchStart.x;
      const dy = t.clientY - touchStart.y;

      // Lock the axis once past a few pixels, else a vertical drag shakes
      // the carousel.
      if (axis === 'undecided') {
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
        axis = Math.abs(dx) > Math.abs(dy) ? 'horizontal' : 'vertical';
      }
      if (axis !== 'horizontal') return;

      // Dragging left (negative dx) brings the next project in.
      useHubStore.getState().setDragOffset(-dx / stepDistance());
    };

    const endTouch = (e: TouchEvent) => {
      if (touchStart === null) return;
      const start = touchStart;
      touchStart = null;
      const wasHorizontal = axis === 'horizontal';
      axis = 'undecided';

      const { dragOffset, commitDrag } = useHubStore.getState();
      if (!wasHorizontal || !isHubFlow()) {
        if (dragOffset !== 0) commitDrag(0);
        return;
      }

      const touch = e.changedTouches[0];
      const dx = touch ? touch.clientX - start.x : 0;
      const elapsed = Math.max(1, Date.now() - start.t);
      // A quick flick wins even if short, like a native carousel.
      const velocity = Math.abs(dx) / elapsed; // px/ms
      const passed =
        Math.abs(dragOffset) > 0.35 ||
        (velocity > 0.4 && Math.abs(dx) > 24);

      commitDrag(passed ? Math.sign(dragOffset) || 0 : 0);
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKey);
    window.addEventListener('touchstart', onTouchStart, {
      passive: true,
      capture: true,
    });
    window.addEventListener('touchmove', onTouchMove, {
      passive: true,
      capture: true,
    });
    window.addEventListener('touchend', endTouch, {
      passive: true,
      capture: true,
    });
    window.addEventListener('touchcancel', endTouch, {
      passive: true,
      capture: true,
    });
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('touchstart', onTouchStart, true);
      window.removeEventListener('touchmove', onTouchMove, true);
      window.removeEventListener('touchend', endTouch, true);
      window.removeEventListener('touchcancel', endTouch, true);
      if (rAFId) cancelAnimationFrame(rAFId);
    };
  }, []);

  return null;
}
