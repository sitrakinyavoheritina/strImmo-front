'use client';

import { useCallback, useSyncExternalStore } from 'react';

const STORAGE_KEY = 'onina_install_dismissed';

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

function getSnapshot(): boolean {
  return localStorage.getItem(STORAGE_KEY) === '1';
}

function getServerSnapshot(): boolean {
  return false;
}

/** Bandeau d'installation (voir InstallPromptBanner) refermé une bonne fois pour toutes — persisté
 *  comme la préférence de thème (même idiome, voir lib/theme/use-theme-preference.ts) : pas
 *  reproposé à chaque visite une fois écarté. */
export function useDismissedInstallPrompt() {
  const dismissed = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const dismiss = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, '1');
    window.dispatchEvent(new StorageEvent('storage'));
  }, []);
  return { dismissed, dismiss };
}
