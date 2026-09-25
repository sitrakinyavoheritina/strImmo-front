'use client';

import { useEffect, useRef, useSyncExternalStore } from 'react';
import { BellRing, X } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useAuthStore } from '@/lib/state/use-auth-store';
import { usePushNotifications } from '@/features/notifications/hooks/use-push-notifications';

const STORAGE_KEY = 'onina_push_prompt_dismissed';

function subscribeStorage(callback: () => void) {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

// Proposition d'activer les notifications à la connexion. Les navigateurs (Safari/iOS surtout)
// refusent d'ouvrir leur fenêtre de permission sans un clic de l'utilisateur : on affiche donc ce
// bandeau une fois connecté, et la vraie fenêtre s'ouvre au clic sur "Activer" (voir
// subscribeToPush). "Plus tard" est mémorisé sur l'appareil pour ne pas harceler l'utilisateur —
// il peut toujours activer depuis /parametres. Le service worker n'existe qu'en production.
export function PushPermissionPrompt() {
  const { t } = useTranslation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { ready, permission, subscribed, isBusy, enable } = usePushNotifications();
  const dismissed = useSyncExternalStore(
    subscribeStorage,
    () => localStorage.getItem(STORAGE_KEY) === '1',
    () => true
  );
  const autoSubscribed = useRef(false);

  // Permission déjà accordée (ex. depuis les réglages du navigateur) mais aucun abonnement
  // enregistré pour ce compte sur cet appareil : on l'enregistre sans rien redemander.
  useEffect(() => {
    if (!isAuthenticated || !ready || autoSubscribed.current) return;
    if (permission === 'granted' && !subscribed) {
      autoSubscribed.current = true;
      void enable().catch(() => undefined);
    }
  }, [isAuthenticated, ready, permission, subscribed, enable]);

  if (process.env.NODE_ENV !== 'production') return null;
  if (!isAuthenticated || !ready || dismissed || permission !== 'default') return null;

  function dismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // Stockage indisponible : le bandeau reviendra à la prochaine visite, sans conséquence.
    }
    window.dispatchEvent(new StorageEvent('storage'));
  }

  async function handleAccept() {
    await enable().catch(() => undefined);
    dismiss();
  }

  return (
    <div className="flex items-center gap-3 bg-brand-primary-soft text-content-main text-sm py-2 px-3">
      <span className="shrink-0 w-8 h-8 rounded-full bg-brand-primary/15 flex items-center justify-center text-brand-primary">
        <BellRing size={15} />
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-semibold truncate">{t.profile.pushPromptTitle}</p>
        <p className="text-[0.85rem] text-content-muted">{t.profile.pushDescription}</p>
      </div>
      <button
        type="button"
        onClick={handleAccept}
        disabled={isBusy}
        className="shrink-0 py-1.5 px-3 rounded-lg bg-brand-primary hover:bg-brand-primary-hover text-white text-[0.85rem] font-semibold transition disabled:opacity-50"
      >
        {t.profile.pushPromptAccept}
      </button>
      <button
        type="button"
        onClick={dismiss}
        aria-label={t.profile.pushPromptLater}
        title={t.profile.pushPromptLater}
        className="shrink-0 text-content-muted hover:text-content-main transition p-1"
      >
        <X size={16} />
      </button>
    </div>
  );
}
