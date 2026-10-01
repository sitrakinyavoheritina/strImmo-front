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

/** Affiché à la place de la destination demandée (publier une annonce, créer une demande...)
 *  quand le compte connecté n'a pas encore de numéro vérifié — typiquement un compte créé via
 *  "Se connecter avec Google" (`isPhoneVerified` vaut `true` par défaut en base sans jamais avoir
 *  été prouvé, voir strImmo/src/auth/entities/user.entity.ts). Contrairement à
 *  BecomePublisherPanel, ne change jamais de rôle : juste la preuve du numéro, ouvert à tout
 *  compte (y compris un locataire qui veut créer une demande, pas besoin de devenir publieur pour
 *  ça). Une fois confirmé, `onVerified` relance l'action d'origine. */
export function VerifyPhonePanel({ onVerified }: { onVerified: () => void }) {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);

  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [code, setCode] = useState('');
  // Numéro modifiable tant que le code n'est pas envoyé : un compte Google dont le numéro saisi
  // était faux ne recevrait jamais son code (le SMS part vers ce numéro).
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [sentTo, setSentTo] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function handleSendCode() {
    setError(null);
    setIsSending(true);
    try {
      if (!isValidMalagasyPhone(phone)) {
        setError(t.listing.verifyPhoneGatePhoneInvalid);
        return;
      }
      const result = await authService.requestPhoneConfirmation(phone);
      setSentTo(result.phone);
      updateUser({ phone: result.phone });
      setIsCodeSent(true);
    } catch (e) {
      setError(getErrorMessage(e, t.listing.verifyPhoneGateError));
    } finally {
      setIsSending(false);
    }
  }

  async function confirm(withCode: string) {
    setIsConfirming(true);
    try {
      await authService.verifyPhone(withCode);
      updateUser({ isPhoneVerified: true });
      onVerified();
    } catch (e) {
      setError(getErrorMessage(e, t.listing.verifyPhoneGateError));
    } finally {
      setIsConfirming(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-10 space-y-4">
      <div className="text-center space-y-1.5">
        <h1 className="text-lg font-bold text-content-main">{t.listing.verifyPhoneGateTitle}</h1>
        <p className="text-sm text-content-muted">{t.listing.verifyPhoneGateText}</p>
      </div>

      {isCodeSent ? (
        <div className="space-y-3">
          <p className="text-sm text-content-main">
            {t.listing.verifyPhoneGateCodeSent.replace('%phone%', sentTo)}
          </p>
          <OtpInput
            label={t.listing.verifyPhoneGateCodeLabel}
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
            {isConfirming ? t.listing.verifyPhoneGateConfirming : t.listing.verifyPhoneGateConfirm}
          </Button>
          <Button type="button" variant="ghost" size="sm" className="w-full" disabled={isSending} onClick={handleSendCode}>
            {t.listing.verifyPhoneGateResend}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <FormInput
            label={t.listing.verifyPhoneGatePhoneLabel}
            value={phone}
            onChange={setPhone}
            placeholder="034 12 345 67"
          />
          <FormErrorBanner message={error} />
          <Button type="button" className="w-full" disabled={isSending || isConfirming} onClick={handleSendCode}>
            {isSending ? t.listing.verifyPhoneGateSending : t.listing.verifyPhoneGateSendCode}
          </Button>
        </div>
      )}
    </div>
  );
}
