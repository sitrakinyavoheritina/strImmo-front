'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BellRing, Check, MapPin, MessageCircle, PartyPopper, PlusCircle, Search, X } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useAuthStore } from '@/lib/state/use-auth-store';
import { useNearbyPositionStore } from '@/lib/state/use-nearby-position-store';
import { clearWelcomePending, isWelcomePending } from '@/lib/auth/welcome-flag';
import { getPushPermission } from '@/lib/push/push-client';
import { usePushNotifications } from '@/features/notifications/hooks/use-push-notifications';
import { Button } from '@/components/ui/button';

type Step = 'welcome' | 'permissions';
type RowStatus = 'idle' | 'done' | 'denied';

/** Parcours de première arrivée sur l'accueil après la création du compte : 1) message de
 *  félicitations, 2) demandes d'autorisation (notifications, position) — les navigateurs exigent un
 *  clic pour ouvrir leur fenêtre de permission, d'où des boutons « Autoriser » plutôt qu'une
 *  demande automatique. Se ferme uniquement à la main (croix, clic à côté, Échap, boutons) : pas
 *  de fermeture automatique, qui ferait disparaître le message avant d'avoir pu le lire. */
export function WelcomeModal() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const setPosition = useNearbyPositionStore((state) => state.setPosition);
  const setPositionError = useNearbyPositionStore((state) => state.setError);
  const { enable } = usePushNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<Step>('welcome');
  // Demandes à faire, figées à l'ouverture : une ligne reste affichée (avec son résultat) après
  // avoir été acceptée, au lieu de disparaître sous le doigt.
  const [askNotif, setAskNotif] = useState(false);
  const [askGeo, setAskGeo] = useState(false);
  const [notifStatus, setNotifStatus] = useState<RowStatus>('idle');
  const [geoStatus, setGeoStatus] = useState<RowStatus>('idle');

  useEffect(() => {
    if (!isWelcomePending(user?.id)) return;
    // Lecture de localStorage / navigateur (indisponibles au rendu serveur, donc pas un état
    // initial sans désaccord d'hydratation) ; `setState` différé d'un micro-tick, comme
    // nearby-properties-map-widget.tsx (react-hooks/set-state-in-effect).
    queueMicrotask(() => {
      setIsOpen(true);
      // Les notifications ne fonctionnent qu'en production (service worker, voir sw.js).
      setAskNotif(process.env.NODE_ENV === 'production' && getPushPermission() === 'default');
    });
    if (!('geolocation' in navigator)) return;
    const ask = () => setAskGeo(true);
    if (!navigator.permissions?.query) {
      queueMicrotask(ask);
      return;
    }
    navigator.permissions
      .query({ name: 'geolocation' })
      .then((status) => status.state !== 'denied' && ask())
      .catch(ask);
  }, [user?.id]);

  function close() {
    clearWelcomePending();
    setIsOpen(false);
    // « Près de vous » attend la fin du parcours (voir nearby-properties-map-widget.tsx) : si la
    // position n'a pas été obtenue ici, on l'indique pour que le bloc n'attende pas indéfiniment.
    const { position, error } = useNearbyPositionStore.getState();
    if (position || error) return;
    if (!('geolocation' in navigator)) return setPositionError(t.feed.nearbyLocationError);
    // Déjà autorisée pour ce site : aucune fenêtre à afficher, on récupère la position en silence.
    navigator.permissions
      ?.query({ name: 'geolocation' })
      .then((status) => {
        if (status.state === 'granted') {
          navigator.geolocation.getCurrentPosition(
            (result) => setPosition({ latitude: result.coords.latitude, longitude: result.coords.longitude }),
            () => setPositionError(t.feed.nearbyLocationError)
          );
        } else {
          setPositionError(t.feed.nearbyLocationError);
        }
      })
      .catch(() => setPositionError(t.feed.nearbyLocationError));
  }

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => event.key === 'Escape' && close();
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  async function handleAllowNotifications() {
    const result = await enable().catch(() => 'denied' as const);
    setNotifStatus(result === 'subscribed' ? 'done' : 'denied');
  }

  function handleAllowGeolocation() {
    navigator.geolocation.getCurrentPosition(
      (result) => {
        setPosition({ latitude: result.coords.latitude, longitude: result.coords.longitude });
        setGeoStatus('done');
      },
      () => {
        setPositionError(t.feed.nearbyLocationError);
        setGeoStatus('denied');
      }
    );
  }

  if (!isOpen || !user) return null;
  const canPublish = user.role !== 'tenant';
  const hasPermissionStep = askNotif || askGeo;

  const rows = [
    askNotif && {
      key: 'notif',
      icon: BellRing,
      title: t.welcome.permNotifTitle,
      text: t.welcome.permNotifText,
      status: notifStatus,
      onAllow: handleAllowNotifications,
    },
    askGeo && {
      key: 'geo',
      icon: MapPin,
      title: t.welcome.permGeoTitle,
      text: t.welcome.permGeoText,
      status: geoStatus,
      onAllow: handleAllowGeolocation,
    },
  ].filter(Boolean) as {
    key: string;
    icon: typeof BellRing;
    title: string;
    text: string;
    status: RowStatus;
    onAllow: () => void;
  }[];

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={close}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-title"
        className="relative w-full max-w-sm bg-surface-card rounded-2xl shadow-lg p-6 text-center"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={close}
          aria-label={t.welcome.close}
          className="absolute top-3 right-3 p-1 text-content-muted hover:text-content-main"
        >
          <X size={18} />
        </button>

        {step === 'welcome' ? (
          <>
            <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-brand-primary-soft text-brand-primary">
              <PartyPopper size={28} />
            </span>
            <h2 id="welcome-title" className="text-lg font-extrabold text-brand-secondary-text">
              {t.welcome.title.replace('%name%', user.firstName)}
            </h2>
            <p className="mt-1 text-sm text-content-muted">{t.welcome.subtitle}</p>

            <ul className="mt-4 space-y-2.5 text-left text-sm text-content-main">
              <li className="flex items-center gap-2.5">
                <Search size={16} className="shrink-0 text-brand-primary" />
                {t.welcome.pointSearch}
              </li>
              <li className="flex items-center gap-2.5">
                <MessageCircle size={16} className="shrink-0 text-brand-primary" />
                {t.welcome.pointContact}
              </li>
              <li className="flex items-center gap-2.5">
                <PlusCircle size={16} className="shrink-0 text-brand-primary" />
                {canPublish ? t.welcome.pointPublish : t.welcome.pointPublishTenant}
              </li>
            </ul>

            <div className="mt-5 space-y-2">
              <Button type="button" className="w-full" onClick={hasPermissionStep ? () => setStep('permissions') : close}>
                {hasPermissionStep ? t.welcome.continue : t.welcome.start}
              </Button>
              {canPublish && (
                <Link
                  href="/annonce/nouvelle"
                  onClick={close}
                  className="block text-sm font-semibold text-brand-primary hover:underline"
                >
                  {t.welcome.publishNow}
                </Link>
              )}
            </div>
          </>
        ) : (
          <>
            <h2 id="welcome-title" className="text-lg font-extrabold text-brand-secondary-text">
              {t.welcome.permTitle}
            </h2>
            <p className="mt-1 text-sm text-content-muted">{t.welcome.permSubtitle}</p>

            <ul className="mt-4 space-y-2.5 text-left">
              {rows.map(({ key, icon: Icon, title, text, status, onAllow }) => (
                <li key={key} className="flex items-center gap-3 rounded-xl border border-stroke-default p-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-primary-soft text-brand-primary">
                    <Icon size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-content-main">{title}</p>
                    <p className="text-[0.85rem] text-content-muted">{text}</p>
                    {status === 'denied' && <p className="text-[0.85rem] text-danger">{t.welcome.permBlocked}</p>}
                  </div>
                  {status === 'done' ? (
                    <span className="flex shrink-0 items-center gap-1 text-[0.85rem] font-semibold text-brand-primary">
                      <Check size={15} />
                      {t.welcome.permDone}
                    </span>
                  ) : (
                    status === 'idle' && (
                      <Button type="button" size="sm" onClick={onAllow}>
                        {t.welcome.permAllow}
                      </Button>
                    )
                  )}
                </li>
              ))}
            </ul>

            <p className="mt-3 text-[0.85rem] text-content-muted">{t.welcome.permLaterHint}</p>
            <Button type="button" className="mt-4 w-full" onClick={close}>
              {t.welcome.permFinish}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
