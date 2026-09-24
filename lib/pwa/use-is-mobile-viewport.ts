'use client';

import { useSyncExternalStore } from 'react';

// Même seuil que la bascule de mise en page mobile du site (`lg:` de Tailwind = 1024px, voir
// MobileNavStrip / Sidebar) : en dessous, on est dans l'interface mobile.
const QUERY = '(max-width: 1023px)';

function subscribe(callback: () => void) {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener('change', callback);
  return () => mql.removeEventListener('change', callback);
}

/** Vrai dans la mise en page mobile (téléphone, ou fenêtre étroite). Faux côté serveur. */
export function useIsMobileViewport(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false
  );
}
