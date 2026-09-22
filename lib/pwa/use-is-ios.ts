'use client';

import { useSyncExternalStore } from 'react';

// Ne change jamais en cours de session — pas de vrai abonnement à tenir, juste une lecture directe
// via `useSyncExternalStore` (même idiome que useOnlineStatus, voir lib/hooks/use-online-status.ts)
// pour éviter un mismatch d'hydratation SSR/client (`navigator` n'existe pas côté serveur).
function subscribe() {
  return () => {};
}

function getSnapshot(): boolean {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    // Exclut IE11 en mode compatibilité, qui usurpe parfois un user-agent iOS.
    !('MSStream' in window)
  );
}

function getServerSnapshot(): boolean {
  return false;
}

/** Vrai sur Safari iOS/iPadOS — seule plateforme sans `beforeinstallprompt` : l'installation s'y
 *  fait uniquement via Partager → "Sur l'écran d'accueil" (voir InstallPromptBanner). */
export function useIsIOS(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
