// Emericfolio — created by Tomi-Tom, 2026
// Sends the keyboard focus into a panel the moment it opens

'use client';

import { useEffect } from 'react';
import type React from 'react';

/** Hands the focus to `ref` when a panel opens, so the Tab key lands inside it
 * and not in the screen left behind. `open` takes anything truthy: pass the
 * displayed item and the focus follows a change of content too. */
export function useFocusOnOpen(
  ref: React.RefObject<HTMLElement | null>,
  open: unknown,
) {
  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => {
      ref.current?.focus({ preventScroll: true });
    }, 0);
    return () => window.clearTimeout(id);
  }, [ref, open]);
}
