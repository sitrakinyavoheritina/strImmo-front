'use client';

import { useEffect, useRef, useState } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { useOnlineStatus } from '@/lib/hooks/use-online-status';
import { useTranslation } from '@/lib/i18n/use-translation';

const RECONNECTED_DISPLAY_MS = 3000;

// Bandeau global (monté une fois dans AppShell, visible sur tout le site) signalant une perte de
// connexion internet (mode avion, câble débranché, etc. — voir use-online-status.ts pour la limite
// de `navigator.onLine`). Le message "connexion rétablie" ne reste que 3s : juste une confirmation,
// pas un état permanent comme le bandeau hors-ligne. `justReconnected` est piloté par ses propres
// écouteurs `online`/`offline` (plutôt que dérivé de `isOnline` dans le corps du rendu) : les règles
// react-hooks de ce projet interdisent de lire/écrire un ref pendant le rendu et d'appeler
// `setState` directement dans le corps d'un effet — seul un `setState` dans un callback d'événement
// (ici `handleOnline`/`handleOffline`, ou le `setTimeout` qu'ils programment) reste autorisé.
export function OfflineBanner() {
  const isOnline = useOnlineStatus();
  const { t } = useTranslation();
  const [justReconnected, setJustReconnected] = useState(false);
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    function handleOnline() {
      setJustReconnected(true);
      clearTimeout(hideTimeout.current);
      hideTimeout.current = setTimeout(() => setJustReconnected(false), RECONNECTED_DISPLAY_MS);
    }
    function handleOffline() {
      setJustReconnected(false);
      clearTimeout(hideTimeout.current);
    }
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearTimeout(hideTimeout.current);
    };
  }, []);

  if (!isOnline) {
    return (
      <div className="flex items-center justify-center gap-2 bg-danger text-white text-sm py-2 px-3">
        <WifiOff size={16} />
        <span>{t.connectivity.offline}</span>
      </div>
    );
  }

  if (justReconnected) {
    return (
      <div className="flex items-center justify-center gap-2 bg-brand-primary text-white text-sm py-2 px-3">
        <Wifi size={16} />
        <span>{t.connectivity.backOnline}</span>
      </div>
    );
  }

  return null;
}
