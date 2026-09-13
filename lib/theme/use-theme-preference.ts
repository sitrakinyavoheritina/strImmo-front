'use client';

import { useCallback, useSyncExternalStore } from 'react';

export type ThemePreference = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'onina_theme';

function applyTheme(preference: ThemePreference) {
  const root = document.documentElement;
  // "system" retire l'attribut plutôt que d'en poser un : à ce moment-là, c'est uniquement
  // `@media (prefers-color-scheme: dark)` dans globals.css qui décide, exactement comme un
  // visiteur qui n'a jamais choisi de préférence.
  if (preference === 'system') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', preference);
}

function subscribe(callback: () => void) {
  // L'événement "storage" natif ne se déclenche que dans les AUTRES onglets — `setTheme`
  // redéclenche manuellement un événement du même type sur ce même onglet (voir plus bas) pour que
  // ce hook se resynchronise aussi immédiatement ici, pas seulement au prochain rechargement.
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

function getSnapshot(): ThemePreference {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === 'light' || stored === 'dark' ? stored : 'system';
}

function getServerSnapshot(): ThemePreference {
  return 'system';
}

/** Préférence de thème (système / clair / sombre), persistée en localStorage et appliquée via
 *  l'attribut `data-theme` sur `<html>` — voir globals.css pour les valeurs de palette associées à
 *  chaque état. `useSyncExternalStore` (pas useState+useEffect) : même pattern que
 *  useAuthHasHydrated (use-auth-store.ts), nécessaire ici aussi puisque localStorage n'existe pas
 *  côté serveur — `getServerSnapshot` fournit la valeur par défaut ("system") pour le rendu SSR/
 *  premier rendu client, avant que `getSnapshot` ne prenne le relais. Le script inline dans
 *  app/layout.tsx applique déjà la préférence sauvegardée AVANT l'hydratation pour éviter un flash
 *  du mauvais thème ; ce hook ne fait que lire cette même valeur pour que l'UI (le sélecteur dans
 *  /parametres) affiche l'état correct. */
export function useThemePreference() {
  const preference = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setTheme = useCallback((next: ThemePreference) => {
    applyTheme(next);
    if (next === 'system') localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, next);
    window.dispatchEvent(new StorageEvent('storage'));
  }, []);

  return { preference, setTheme };
}
