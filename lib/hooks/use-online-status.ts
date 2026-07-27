import { useSyncExternalStore } from 'react';

function subscribe(callback: () => void) {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
}

// `navigator.onLine` ne détecte que la présence d'une interface réseau (toujours `true` derrière un
// wifi connecté sans accès internet réel) — suffisant ici pour le cas visé (mode avion, câble
// débranché) sans complexifier avec un ping serveur périodique. `useSyncExternalStore` (même idiome
// que `useAuthHasHydrated`, voir use-auth-store.ts) : `navigator.onLine` est un système externe au
// rendu React, pas un state interne — le 3e argument (valeur serveur) évite un mismatch
// d'hydratation SSR/client en supposant "en ligne" tant que le client n'a pas encore mesuré.
export function useOnlineStatus(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => navigator.onLine,
    () => true
  );
}
