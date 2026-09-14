'use client';

import { useCallback, useSyncExternalStore } from 'react';

export type FeedDisplayPreference = 'card' | 'list';

const STORAGE_KEY = 'onina_feed_display';
const DEFAULT_PREFERENCE: FeedDisplayPreference = 'card';

function subscribe(callback: () => void) {
  // Même pattern que useThemePreference : l'événement "storage" natif ne se déclenche que dans
  // les AUTRES onglets, `setFeedDisplay` en redéclenche un manuellement sur celui-ci pour rester
  // en phase immédiatement, pas seulement au prochain rechargement.
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

function getSnapshot(): FeedDisplayPreference {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === 'list' ? 'list' : DEFAULT_PREFERENCE;
}

function getServerSnapshot(): FeedDisplayPreference {
  return DEFAULT_PREFERENCE;
}

/** Écrit la préférence en localStorage et notifie les hooks montés — exporté séparément du hook
 *  pour pouvoir aussi être appelé juste après une connexion, quand le compte a sa propre
 *  préférence enregistrée côté serveur (voir use-login.ts/use-register.ts). */
export function setStoredFeedDisplay(next: FeedDisplayPreference) {
  if (next === DEFAULT_PREFERENCE) localStorage.removeItem(STORAGE_KEY);
  else localStorage.setItem(STORAGE_KEY, next);
  window.dispatchEvent(new StorageEvent('storage'));
}

/** Préférence d'affichage du fil (cartes ou liste compacte) — l'ancien affichage en cartes reste
 *  celui par défaut, demandé explicitement ; la liste compacte (voir FeedPropertyRow) reste une
 *  option choisie dans /parametres. Persistée en localStorage pour un visiteur non connecté, et
 *  rattachée au compte une fois connecté (voir setStoredFeedDisplay et /auth/preferences côté
 *  backend) pour retrouver le même réglage sur un autre appareil. */
export function useFeedDisplayPreference() {
  const preference = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const setPreference = useCallback((next: FeedDisplayPreference) => setStoredFeedDisplay(next), []);
  return { preference, setPreference };
}
