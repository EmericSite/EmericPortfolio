'use client';

import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * `false` au rendu serveur ET au premier rendu client (hydratation), puis `true`.
 * Basé sur useSyncExternalStore → pas de setState-dans-un-effet, pas de
 * divergence d'hydratation pour le contenu conditionné au client.
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
}
