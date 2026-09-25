'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/use-translation';
import { getErrorMessage } from '@/lib/api/get-error-message';
import { useAuthStore, useAuthHasHydrated } from '@/lib/state/use-auth-store';
import { AuthPageShell } from '@/features/auth/components/auth-page-shell';
import { authService } from '@/features/auth/services/auth-service';
import { Button } from '@/components/ui/button';
import { FormErrorBanner } from '@/components/ui/form-error-banner';
import { OtpInput } from '@/components/ui/otp-input';

// Étape après l'inscription propriétaire (ou "Compléter le profil" Google) : le backend vient
// d'envoyer un code SMS au numéro du compte, à saisir ici. "Plus tard" laisse passer (un numéro
// non Orange ne recevrait pas le code pour l'instant) — la vérification reste demandée pour
// passer locataire → publieur (voir become-publisher-panel.tsx).
export default function VerificationTelephonePage() {
  const { t } = useTranslation();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const updateUser = useAuthStore((state) => state.updateUser);
  const hasHydrated = useAuthHasHydrated();

  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) router.replace('/connexion');
  }, [hasHydrated, isAuthenticated, router]);

  async function handleVerify() {
    setError(null);
    setInfo(null);
    setIsLoading(true);
    try {
      await authService.verifyPhone(code);
      updateUser({ isPhoneVerified: true });
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
      await authService.resendPhoneCode();
      setInfo(t.auth.verifyPhoneResent);
    } catch (e) {
      setError(getErrorMessage(e, t.auth.verifyPhoneError));
    }
  }

  if (!user) return null;

  return (
    <AuthPageShell
      title={t.auth.verifyPhoneTitle}
      subtitle={t.auth.verifyPhoneSubtitle.replace('%phone%', user.phone ?? '')}
    >
      <div className="bg-surface-card border border-stroke-default/80 rounded-2xl p-4 sm:p-6 space-y-3">
        <OtpInput
          label={t.auth.verifyPhoneCodeLabel}
          value={code}
          onChange={setCode}
          hasError={!!error}
          autoFocus
        />
        <FormErrorBanner message={error} />
        {user.email && (
          <p className="text-[0.85rem] text-content-muted">
            {t.auth.verifyPhoneAlsoEmail.replace('%email%', user.email)}
          </p>
        )}
        {info && <p className="text-[0.85rem] text-brand-primary">{info}</p>}
        <Button type="button" className="w-full" disabled={code.length !== 6 || isLoading} onClick={handleVerify}>
          {isLoading ? t.auth.verifyPhoneSubmitting : t.auth.verifyPhoneSubmit}
        </Button>
        <div className="flex items-center justify-between">
          <Button type="button" variant="ghost" size="sm" onClick={handleResend}>
            {t.auth.verifyPhoneResend}
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => router.replace('/')}>
            {t.auth.verifyPhoneLater}
          </Button>
        </div>
      </div>
    </AuthPageShell>
  );
}
