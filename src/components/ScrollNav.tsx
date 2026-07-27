'use client';

import { useEffect } from 'react';
import { useHubStore } from '@/store/hub';

const WHEEL_THRESHOLD = 60;
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

    // Tactile : les cartouches suivent le doigt à l'horizontale pendant tout
    // le geste, puis s'accrochent au cran le plus proche au relâchement.
    // Auparavant rien ne bougeait pendant le glissement et la carte sautait
    // d'un cran à la fin, ce qui donnait un défilement très sec.
    let touchStart: { x: number; y: number; t: number } | null = null;
    let axis: 'indetermine' | 'horizontal' | 'vertical' = 'indetermine';

    // Distance de doigt correspondant au passage d'un projet au suivant.
    const stepDistance = () =>
      Math.max(120, Math.min(window.innerWidth * 0.45, 320));

    const onTouchStart = (e: TouchEvent) => {
      if (!isHubFlow()) return;
      if (e.touches.length === 0) return;
      const t = e.touches[0];
      touchStart = { x: t.clientX, y: t.clientY, t: Date.now() };
      axis = 'indetermine';
    };

    const onTouchMove = (e: TouchEvent) => {
      if (touchStart === null || !isHubFlow()) return;
      const t = e.touches[0];
      if (!t) return;
      const dx = t.clientX - touchStart.x;
      const dy = t.clientY - touchStart.y;

      // On décide de l'axe une fois pour toutes, passé un seuil de quelques
      // pixels : sans ça un geste vertical ferait frémir le carrousel.
      if (axis === 'indetermine') {
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
        axis = Math.abs(dx) > Math.abs(dy) ? 'horizontal' : 'vertical';
      }
      if (axis !== 'horizontal') return;

      // Glisser vers la gauche (dx négatif) fait venir le projet suivant.
      useHubStore.getState().setDragOffset(-dx / stepDistance());
    };

    const endTouch = (e: TouchEvent) => {
      if (touchStart === null) return;
      const start = touchStart;
      touchStart = null;
      const wasHorizontal = axis === 'horizontal';
      axis = 'indetermine';

      const { dragOffset, commitDrag } = useHubStore.getState();
      if (!wasHorizontal || !isHubFlow()) {
        if (dragOffset !== 0) commitDrag(0);
        return;
      }

      const touch = e.changedTouches[0];
      const dx = touch ? touch.clientX - start.x : 0;
      const elapsed = Math.max(1, Date.now() - start.t);
      // Un geste vif emporte la décision même s'il est court, comme sur un
      // carrousel natif.
      const velocity = Math.abs(dx) / elapsed; // px/ms
      const franchi =
        Math.abs(dragOffset) > 0.35 ||
        (velocity > 0.4 && Math.abs(dx) > 24);

      commitDrag(franchi ? Math.sign(dragOffset) || 0 : 0);
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKey);
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', endTouch, { passive: true });
    window.addEventListener('touchcancel', endTouch, { passive: true });
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', endTouch);
      window.removeEventListener('touchcancel', endTouch);
      if (rAFId) cancelAnimationFrame(rAFId);
    };
  }, []);

  return null;
}
