'use client';

import { useEffect } from 'react';

// Enregistre public/sw.js — uniquement en production : en développement (`next dev`), les noms de
// fichiers ne sont pas immuables comme en prod (voir sw.js), un cache-first sur `/_next/static/`
// servirait alors un ancien module après une modification, un piège classique de service worker en
// dev. Ne fait rien sur un navigateur sans support (Safari < 11.1, très ancien Android WebView).
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {
      // Best-effort : l'app reste utilisable sans service worker (juste moins "installable" et
      // sans écran de secours hors ligne), inutile de remonter l'échec à l'utilisateur.
    });
  }, []);

  return null;
}
