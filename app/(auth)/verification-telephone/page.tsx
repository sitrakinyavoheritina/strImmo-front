'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';
import { getErrorMessage } from '@/lib/api/get-error-message';
import { markWelcomePending } from '@/lib/auth/welcome-flag';
import { useAuthStore, useAuthHasHydrated } from '@/lib/state/use-auth-store';
import { usePendingVerificationStore } from '@/lib/state/use-pending-verification-store';
import { setStoredTheme } from '@/lib/theme/use-theme-preference';
import { setStoredFeedDisplay } from '@/lib/theme/use-feed-display-preference';
import { AuthPageShell } from '@/features/auth/components/auth-page-shell';
import { authService } from '@/features/auth/services/auth-service';
import { Button } from '@/components/ui/button';
import { FormErrorBanner } from '@/components/ui/form-error-banner';
import { OtpInput } from '@/components/ui/otp-input';

// Vérification du numéro par code SMS/email. Deux façons d'y arriver :
//  - SANS session (cas normal d'un propriétaire / intermédiaire / agence) : la connexion a été
//    refusée (403 PHONE_NOT_VERIFIED) et on garde le jeton de vérification en mémoire ; la session
//    ne s'ouvre qu'une fois le bon code saisi — pas de « Plus tard », le compte est inaccessible
//    sans vérification (voir strImmo/src/auth/auth.service.ts:blockUnverified).
//  - AVEC session (compte déjà connecté dont le numéro n'est pas vérifié, ancien comportement) :
//    routes /auth/verify-phone classiques, « Plus tard » possible.
export default function VerificationTelephonePage() {
  const { t } = useTranslation();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const updateUser = useAuthStore((state) => state.updateUser);
  const setSession = useAuthStore((state) => state.setSession);
  const hasHydrated = useAuthHasHydrated();
  const pending = usePendingVerificationStore((state) => state.pending);
  const clearPending = usePendingVerificationStore((state) => state.clear);

  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    if (hasHydrated && !isAuthenticated && !pending) router.replace('/connexion');
  }, [hasHydrated, isAuthenticated, pending, router]);

  async function handleVerify() {
    setError(null);
    setInfo(null);
    setIsLoading(true);
    try {
      if (pending) {
        const { user: verified, token } = await authService.confirmPhoneVerification({
          verificationToken: pending.verificationToken,
          code,
        });
        setSession(verified, token);
        // Message de bienvenue à la PREMIÈRE validation du compte, quel que soit le chemin (inscription
        // suivie tout de suite du code, ou retour plus tard / page rechargée puis connexion) : après
        // cette étape on ne repasse plus jamais par ici.
        markWelcomePending(verified.id);
        setStoredTheme(verified.themePreference);
        setStoredFeedDisplay(verified.feedDisplay);
        clearPending();
      } else {
        await authService.verifyPhone(code);
        updateUser({ isPhoneVerified: true });
        if (user) markWelcomePending(user.id);
      }
      router.replace('/');
    } catch (e) {
      setError(getErrorMessage(e, t.auth.verifyPhoneError));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResend() {
    setError(null);
    setInfo(null);
    try {
      if (pending) await authService.resendPhoneVerification(pending.verificationToken);
      else await authService.resendPhoneCode();
      setInfo(t.auth.verifyPhoneResent);
    } catch (e) {
      setError(getErrorMessage(e, t.auth.verifyPhoneError));
    }
  }

  function handleLeave() {
    if (pending) {
      clearPending();
      router.replace('/connexion');
    } else {
      router.replace('/');
    }
  }

  const phone = pending?.phone ?? user?.phone ?? '';
  const email = pending ? null : user?.email;
  if (!pending && !user) return null;

  return (
    <AuthPageShell title={t.auth.verifyPhoneTitle} subtitle={t.auth.verifyPhoneSubtitle.replace('%phone%', phone)}>
      <div className="bg-surface-card border border-stroke-default/80 rounded-2xl p-4 sm:p-6 space-y-3">
        {pending && (
          <div className="flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 p-3 text-amber-900">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <div className="text-[0.85rem]">
              {pending.isNewAccount ? (
                <p>{t.auth.verifyPhoneLastStepText.replace('%phone%', phone)}</p>
              ) : (
                <>
                  <p className="font-bold">{t.auth.verifyPhoneNotValidatedTitle}</p>
                  <p className="mt-0.5">{t.auth.verifyPhoneNotValidatedText.replace('%phone%', phone)}</p>
                </>
              )}
            </div>
          </div>
        )}
        <OtpInput label={t.auth.verifyPhoneCodeLabel} value={code} onChange={setCode} hasError={!!error} autoFocus />
        {email && (
          <p className="text-[0.85rem] text-content-muted">{t.auth.verifyPhoneAlsoEmail.replace('%email%', email)}</p>
        )}
        <FormErrorBanner message={error} />
        {info && <p className="text-[0.85rem] text-brand-primary">{info}</p>}
        <Button type="button" className="w-full" disabled={code.length !== 6 || isLoading} onClick={handleVerify}>
          {isLoading ? t.auth.verifyPhoneSubmitting : t.auth.verifyPhoneSubmit}
        </Button>
        <div className="flex items-center justify-between">
          <Button type="button" variant="ghost" size="sm" onClick={handleResend}>
            {pending ? t.auth.verifyPhoneResendTo.replace('%phone%', phone) : t.auth.verifyPhoneResend}
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={handleLeave}>
            {pending ? t.auth.verifyPhoneBack : t.auth.verifyPhoneLater}
          </Button>
        </div>
      </div>
    </AuthPageShell>
  );
}
