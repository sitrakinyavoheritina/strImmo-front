'use client';

import { useState } from 'react';
import { useTranslation } from '@/lib/i18n/use-translation';
import { getErrorMessage } from '@/lib/api/get-error-message';
import { useAuthStore } from '@/lib/state/use-auth-store';
import { Button } from '@/components/ui/button';
import { FormErrorBanner } from '@/components/ui/form-error-banner';
import { FormInput } from '@/components/ui/form-controls';
import { OtpInput } from '@/components/ui/otp-input';
import { isValidMalagasyPhone } from '../schemas';
import { authService } from '../services/auth-service';

type PublisherRole = 'owner' | 'agent';

/** Affiché à la place du formulaire de publication pour un compte locataire/acheteur : il choisit
 *  propriétaire ou intermédiaire, reçoit un OTP par SMS sur le numéro de son compte, puis son type
 *  de compte change (voir strImmo/src/auth/auth.service.ts:upgradeToPublisher) — la page
 *  /annonce/nouvelle affiche alors directement le formulaire de publication. */
export function BecomePublisherPanel() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const setSession = useAuthStore((state) => state.setSession);

  const [role, setRole] = useState<PublisherRole>('owner');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [code, setCode] = useState('');
  // Numéro modifiable tant que le code n'est pas envoyé : un compte Google dont le numéro saisi
  // était faux ne recevrait jamais son code (le SMS part vers ce numéro).
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [sentTo, setSentTo] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function confirm(withCode: string) {
    setIsConfirming(true);
    try {
      const { user: upgraded, token } = await authService.upgradeToPublisher({ role, code: withCode });
      setSession(upgraded, token);
    } catch (e) {
      setError(getErrorMessage(e, t.listing.becomePublisherError));
    } finally {
      setIsConfirming(false);
    }
  }

  async function handleSendCode() {
    setError(null);
    setIsSending(true);
    try {
      if (!isValidMalagasyPhone(phone)) {
        setError(t.listing.becomePublisherPhoneInvalid);
        return;
      }
      const result = await authService.requestPublisherUpgrade(phone);
      setSentTo(result.phone);
      setIsCodeSent(true);
    } catch (e) {
      setError(getErrorMessage(e, t.listing.becomePublisherError));
    } finally {
      setIsSending(false);
    }
  }

  const roles: { value: PublisherRole; label: string; hint: string }[] = [
    { value: 'owner', label: t.listing.becomePublisherOwner, hint: t.listing.becomePublisherOwnerHint },
    { value: 'agent', label: t.listing.becomePublisherAgent, hint: t.listing.becomePublisherAgentHint },
  ];

  return (
    <div className="max-w-md mx-auto px-4 py-10 space-y-4">
      <div className="text-center space-y-1.5">
        <h1 className="text-lg font-bold text-content-main">{t.listing.becomePublisherTitle}</h1>
        <p className="text-sm text-content-muted">{t.listing.becomePublisherText}</p>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {roles.map((option) => (
          <button
            key={option.value}
            type="button"
            disabled={isCodeSent}
            onClick={() => setRole(option.value)}
            className={`rounded-xl border p-3 text-left transition disabled:opacity-60 ${
              role === option.value
                ? 'border-brand-primary bg-brand-primary-soft'
                : 'border-stroke-default bg-surface-card hover:border-brand-primary'
            }`}
          >
            <p className="text-sm font-semibold text-content-main">{option.label}</p>
            <p className="text-[0.85rem] text-content-muted mt-0.5">{option.hint}</p>
          </button>
        ))}
      </div>

      {isCodeSent ? (
        <div className="space-y-3">
          <p className="text-sm text-content-main">
            {t.listing.becomePublisherCodeSent.replace('%phone%', sentTo)}
          </p>
          <OtpInput
            label={t.listing.becomePublisherCodeLabel}
            value={code}
            onChange={setCode}
            hasError={!!error}
            autoFocus
          />
          {user?.email && (
            <p className="text-[0.85rem] text-content-muted">
              {t.auth.verifyPhoneAlsoEmail.replace('%email%', user.email)}
            </p>
          )}
          <FormErrorBanner message={error} />
          <Button
            type="button"
            className="w-full"
            disabled={code.length !== 6 || isConfirming}
            onClick={() => {
              setError(null);
              void confirm(code);
            }}
          >
            {isConfirming ? t.listing.becomePublisherConfirming : t.listing.becomePublisherConfirm}
          </Button>
          <Button type="button" variant="ghost" size="sm" className="w-full" disabled={isSending} onClick={handleSendCode}>
            {t.listing.becomePublisherResend}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <FormInput
            label={t.listing.becomePublisherPhoneLabel}
            value={phone}
            onChange={setPhone}
            placeholder="034 12 345 67"
          />
          <FormErrorBanner message={error} />
          <Button type="button" className="w-full" disabled={isSending || isConfirming} onClick={handleSendCode}>
            {isSending ? t.listing.becomePublisherSending : t.listing.becomePublisherSendCode}
          </Button>
        </div>
      )}
    </div>
  );
}
