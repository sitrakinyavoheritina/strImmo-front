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

type Step = 'request' | 'reset';

// Mot de passe oublié — code par email uniquement pour l'instant (choix email/SMS prévu plus
// tard côté produit, voir strImmo/src/auth/auth.service.ts:requestPasswordReset). Étape 1 :
// demander le code (réponse volontairement générique côté serveur, on avance toujours à l'étape
// 2 quoi qu'il arrive — ne jamais s'en servir pour révéler si un compte existe). Étape 2 : code +
// nouveau mot de passe.
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
    if (!identifier.trim()) {
      setErrorMessage(t.forgotPasswordPage.identifierRequired);
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

  async function handleResetPassword(event: React.FormEvent) {
    event.preventDefault();
    if (!code.trim()) {
      setErrorMessage(t.forgotPasswordPage.codeRequired);
      return;
    }
    if (newPassword.length < 8) {
      setErrorMessage(t.auth.passwordTooShort);
      return;
    }
    setErrorMessage(null);
    setIsLoading(true);
    try {
      await authService.resetPassword({ identifier: identifier.trim(), code: code.trim(), newPassword });
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
          <p className="text-xs text-content-muted bg-surface-app border border-stroke-default rounded-xl px-3 py-2.5">
            {infoMessage}
          </p>
        )}

        {step === 'request' ? (
          <form className="space-y-3 sm:space-y-5" onSubmit={handleRequestCode}>
            <div>
              <label className="block text-xs font-medium text-content-main mb-0.5 sm:mb-1">
                {t.forgotPasswordPage.identifierLabel}
              </label>
              <input
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                placeholder={t.forgotPasswordPage.identifierPlaceholder}
                className="w-full px-3 py-2 sm:py-2.5 bg-surface-app border border-stroke-default rounded-xl text-sm text-content-main placeholder-content-muted focus:bg-surface-card focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition"
              />
            </div>
            <Button type="submit" disabled={isLoading} variant="secondary" className="w-full">
              {isLoading ? t.forgotPasswordPage.sending : t.forgotPasswordPage.sendCode}
            </Button>
          </form>
        ) : (
          <form className="space-y-3 sm:space-y-5" onSubmit={handleResetPassword}>
            <div>
              <label className="block text-xs font-medium text-content-main mb-0.5 sm:mb-1">
                {t.forgotPasswordPage.codeLabel}
              </label>
              <input
                value={code}
                onChange={(event) => setCode(event.target.value)}
                placeholder={t.forgotPasswordPage.codePlaceholder}
                inputMode="numeric"
                maxLength={6}
                className="w-full px-3 py-2 sm:py-2.5 bg-surface-app border border-stroke-default rounded-xl text-sm text-content-main placeholder-content-muted focus:bg-surface-card focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition tracking-widest"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-content-main mb-0.5 sm:mb-1">
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
              onClick={() => {
                setStep('request');
                setCode('');
                setNewPassword('');
                setErrorMessage(null);
              }}
              className="w-full text-center text-xs font-semibold text-content-muted hover:text-content-main transition"
            >
              {t.forgotPasswordPage.changeIdentifier}
            </button>
          </form>
        )}

        <div className="text-center border-t border-stroke-default pt-3 sm:pt-5">
          <Link href="/connexion" className="text-xs sm:text-sm font-semibold text-brand-primary hover:text-brand-primary-hover">
            {t.forgotPasswordPage.backToLogin}
          </Link>
        </div>
      </div>
    </AuthPageShell>
  );
}
