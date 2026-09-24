'use client';

import { useCallback, useSyncExternalStore } from 'react';

const STORAGE_KEY = 'onina_install_dismissed';

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

function getServerSnapshot(): boolean {
  return false;
}

/** Bandeau d'installation (voir InstallPromptBanner) refermé.
 *  - `persistent = true` (ordinateur) : refermé une bonne fois pour toutes (localStorage), comme la
 *    préférence de thème (même idiome, voir lib/theme/use-theme-preference.ts).
 *  - `persistent = false` (mobile) : refermé seulement pour la session en cours (sessionStorage) —
 *    le bandeau revient à chaque nouvelle visite tant que l'app n'est pas installée, demandé
 *    explicitement ("l'afficher toujours s'il n'installe pas"). */
export function useDismissedInstallPrompt(persistent = true) {
  const dismissed = useSyncExternalStore(
    subscribe,
    () => (persistent ? localStorage : sessionStorage).getItem(STORAGE_KEY) === '1',
    getServerSnapshot
  );
  const dismiss = useCallback(() => {
    (persistent ? localStorage : sessionStorage).setItem(STORAGE_KEY, '1');
    window.dispatchEvent(new StorageEvent('storage'));
  }, [persistent]);
  return { dismissed, dismiss };
}
