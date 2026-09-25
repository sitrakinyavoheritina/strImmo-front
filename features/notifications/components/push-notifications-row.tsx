'use client';

import { useState } from 'react';
import { BellRing } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';
import { usePushNotifications } from '../hooks/use-push-notifications';

/** Interrupteur "Notifications sur cet appareil" (menu Paramètres) : active/désactive les
 * notifications push (nouveau message, annonce validée/refusée...) même quand Onina est fermé. */
export function PushNotificationsRow() {
  const { t } = useTranslation();
  const { permission, subscribed, isBusy, enable, disable } = usePushNotifications();
  const [message, setMessage] = useState<string | null>(null);

  if (permission === 'unsupported') {
    return (
      <div className="px-4 py-2.5">
        <div className="flex items-center gap-3">
          <BellRing size={18} className="text-content-main shrink-0" />
          <span className="flex-1 text-sm font-medium text-content-main">{t.profile.pushNotifications}</span>
        </div>
        <p className="text-[0.85rem] text-content-muted mt-1">{t.profile.pushUnsupported}</p>
      </div>
    );
  }

  async function handleToggle() {
    setMessage(null);
    if (subscribed) {
      await disable();
      return;
    }
    const result = await enable();
    if (result === 'denied') setMessage(t.profile.pushDenied);
    else if (result === 'unavailable') setMessage(t.profile.pushUnavailable);
  }

  return (
    <div className="px-4 py-2.5">
      <div className="flex items-center gap-3">
        <BellRing size={18} className="text-content-main shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-content-main">{t.profile.pushNotifications}</p>
          <p className="text-[0.85rem] text-content-muted">{t.profile.pushDescription}</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={subscribed}
          aria-label={t.profile.pushNotifications}
          disabled={isBusy || permission === 'denied'}
          onClick={handleToggle}
          className={`relative w-11 h-6 rounded-full transition shrink-0 disabled:opacity-50 ${
            subscribed ? 'bg-brand-primary' : 'bg-stroke-default'
          }`}
        >
          <span
            className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${subscribed ? 'left-[22px]' : 'left-0.5'}`}
          />
        </button>
      </div>
      {(permission === 'denied' || message) && (
        <p className="text-[0.85rem] text-danger mt-1">{message ?? t.profile.pushDenied}</p>
      )}
    </div>
  );
}
