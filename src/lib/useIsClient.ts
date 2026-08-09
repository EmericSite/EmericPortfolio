// Emericfolio — created by Tomi-Tom, 2026
// Tells a component when the browser has taken over, to gate browser-only visuals

'use client';

import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * `false` on the server and during hydration, `true` after. Built on
 * useSyncExternalStore so client-only content never mismatches on hydration.
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
}
