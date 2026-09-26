'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/use-translation';
import { AuthPageShell } from '@/features/auth/components/auth-page-shell';
import { authService } from '@/features/auth/services/auth-service';
import { getErrorMessage } from '@/lib/api/get-error-message';
import { Button } from '@/components/ui/button';
import { FormErrorBanner } from '@/components/ui/form-error-banner';
import { OtpInput } from '@/components/ui/otp-input';
import { isValidMalagasyPhone } from '@/features/auth/schemas';

type Step = 'request' | 'reset';

// Mot de passe oublié — le même code part par SMS et par email (voir strImmo/src/auth/auth.service.ts:
// requestPasswordReset). Étape 1 : saisir un numéro OU un email, validé AVANT l'envoi (une faute de
// frappe ne doit pas laisser attendre un code qui ne viendra jamais) ; la réponse du serveur reste
// volontairement générique, on avance toujours à l'étape 2 — ne jamais s'en servir pour révéler si
// un compte existe. Étape 2 : code (6 cases) + nouveau mot de passe.

// Un identifiant avec « @ » est un email, sinon un numéro malgache.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
function identifierError(value: string, t: ReturnType<typeof useTranslation>['t']): string | null {
  const trimmed = value.trim();
  if (!trimmed) return t.forgotPasswordPage.identifierRequired;
  if (trimmed.includes('@')) return EMAIL_REGEX.test(trimmed) ? null : t.forgotPasswordPage.identifierInvalidEmail;
  return isValidMalagasyPhone(trimmed) ? null : t.forgotPasswordPage.identifierInvalidPhone;
}
export default function MotDePasseOubliePage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [step, setStep] = useState<Step>('request');
  const [identifier, setIdentifier] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  async function handleRequestCode(event: React.FormEvent) {
    event.preventDefault();
    const problem = identifierError(identifier, t);
    if (problem) {
      setErrorMessage(problem);
      return;
    }
    setErrorMessage(null);
    setIsLoading(true);
    try {
      const { message } = await authService.forgotPassword(identifier.trim());
      setInfoMessage(message);
      setStep('reset');
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Impossible d'envoyer le code."));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResend() {
    setErrorMessage(null);
    try {
      await authService.forgotPassword(identifier.trim());
      setInfoMessage(t.forgotPasswordPage.codeResent);
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Impossible d'envoyer le code."));
    }
  }

  async function handleResetPassword(event: React.FormEvent) {
    event.preventDefault();
    if (code.length !== 6) {
      setErrorMessage(t.forgotPasswordPage.codeRequired);
      return;
    }
    if (newPassword.length < 4) {
      setErrorMessage(t.auth.passwordTooShort);
      return;
    }
    setErrorMessage(null);
    setIsLoading(true);
    try {
      await authService.resetPassword({ identifier: identifier.trim(), code, newPassword });
      router.push('/connexion?reinitialise=1');
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Code invalide ou expiré.'));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthPageShell
      title={t.forgotPasswordPage.title}
      subtitle={step === 'request' ? t.forgotPasswordPage.subtitleRequest : t.forgotPasswordPage.subtitleReset}
    >
      <div className="bg-surface-card py-4 px-4 sm:py-8 sm:px-10 shadow-sm border border-stroke-default/80 rounded-xl sm:rounded-2xl space-y-3 sm:space-y-4">
        <FormErrorBanner message={errorMessage} />
        {infoMessage && step === 'reset' && (
          <p className="text-[0.85rem] text-content-muted bg-surface-app border border-stroke-default rounded-xl px-3 py-2.5">
            {infoMessage}
          </p>
        )}

        {step === 'request' ? (
          <form className="space-y-3 sm:space-y-5" onSubmit={handleRequestCode}>
            <div>
              <label className="block text-[0.85rem] font-medium text-content-main mb-0.5 sm:mb-1">
                {t.forgotPasswordPage.identifierLabel}
              </label>
              <input
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                placeholder={t.forgotPasswordPage.identifierPlaceholder}
                className="w-full px-3 py-2 sm:py-2.5 bg-surface-app border border-stroke-default rounded-xl text-sm text-content-main placeholder-content-muted focus:bg-surface-card focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition"
              />
              <p className="mt-1 text-[0.85rem] text-content-muted">{t.forgotPasswordPage.channelsHint}</p>
            </div>
            <Button type="submit" disabled={isLoading} variant="secondary" className="w-full">
              {isLoading ? t.forgotPasswordPage.sending : t.forgotPasswordPage.sendCode}
            </Button>
          </form>
        ) : (
          <form className="space-y-3 sm:space-y-5" onSubmit={handleResetPassword}>
            <OtpInput label={t.forgotPasswordPage.codeLabel} value={code} onChange={setCode} autoFocus />
            <div>
              <label className="block text-[0.85rem] font-medium text-content-main mb-0.5 sm:mb-1">
                {t.forgotPasswordPage.newPasswordLabel}
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder={t.forgotPasswordPage.newPasswordPlaceholder}
                className="w-full px-3 py-2 sm:py-2.5 bg-surface-app border border-stroke-default rounded-xl text-sm text-content-main placeholder-content-muted focus:bg-surface-card focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition"
              />
            </div>
            <Button type="submit" disabled={isLoading} variant="secondary" className="w-full">
              {isLoading ? t.forgotPasswordPage.resetting : t.forgotPasswordPage.resetPassword}
            </Button>
            <button
              type="button"
              onClick={handleResend}
              disabled={isLoading}
              className="w-full text-center text-[0.85rem] font-semibold text-brand-primary hover:text-brand-primary-hover transition disabled:opacity-50"
            >
              {t.forgotPasswordPage.resendCode}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep('request');
                setCode('');
                setNewPassword('');
                setErrorMessage(null);
              }}
              className="w-full text-center text-[0.85rem] font-semibold text-content-muted hover:text-content-main transition"
            >
              {t.forgotPasswordPage.changeIdentifier}
            </button>
          </form>
        )}

        <div className="text-center border-t border-stroke-default pt-3 sm:pt-5">
          <Link href="/connexion" className="text-[0.85rem] sm:text-sm font-semibold text-brand-primary hover:text-brand-primary-hover">
            {t.forgotPasswordPage.backToLogin}
          </Link>
        </div>
      </div>
    </AuthPageShell>
  );
}
