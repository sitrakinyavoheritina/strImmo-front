'use client';

import { useSyncExternalStore } from 'react';

function subscribe(callback: () => void) {
  const mql = window.matchMedia('(display-mode: standalone)');
  mql.addEventListener('change', callback);
  return () => mql.removeEventListener('change', callback);
}

function getSnapshot(): boolean {
  // `navigator.standalone` : drapeau propre à Safari iOS (jamais standardisé ailleurs) —
  // `display-mode: standalone` seul n'y est pas toujours fiable.
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function getServerSnapshot(): boolean {
  return false;
}

/** Vrai si le site tourne déjà en app installée (lancée depuis l'écran d'accueil) plutôt que dans
 *  un onglet de navigateur — sert à ne jamais proposer l'installation à quelqu'un qui l'a déjà
 *  faite (voir InstallPromptBanner). */
export function useIsStandalone(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
