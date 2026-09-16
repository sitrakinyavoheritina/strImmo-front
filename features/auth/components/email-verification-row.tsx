'use client';

import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useAuthStore } from '@/lib/state/use-auth-store';
import { authService } from '../services/auth-service';
import { getErrorMessage } from '@/lib/api/get-error-message';

/** Vérification facultative de l'adresse email (voir strImmo/src/auth/auth.service.ts) — ne
 * bloque rien (connexion, publication d'annonce...), juste un badge "Email vérifié" une fois
 * fait. N'apparaît pas si le compte n'a pas d'email renseigné (rien à vérifier). */
export function EmailVerificationRow({ email }: { email: string }) {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);

  const [isCodeSent, setIsCodeSent] = useState(false);
  const [code, setCode] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!user) return null;

  if (user.isEmailVerified) {
    return (
      <p className="flex items-center gap-1.5 text-xs text-brand-primary mt-1">
        <CheckCircle2 size={13} />
        {t.profile.emailVerified}
      </p>
    );
  }

  async function handleSendCode() {
    setError(null);
    setIsSending(true);
    try {
      await authService.sendEmailVerification();
      setMessage(t.profile.verificationCodeSent);
      setIsCodeSent(true);
    } catch (sendError) {
      setError(getErrorMessage(sendError, "Impossible d'envoyer le code."));
    } finally {
      setIsSending(false);
    }
  }

  async function handleVerify(event: React.FormEvent) {
    event.preventDefault();
    if (!code.trim()) {
      setError(t.profile.verificationCodeRequired);
      return;
    }
    setError(null);
    setIsVerifying(true);
    try {
      await authService.verifyEmail(code.trim());
      updateUser({ isEmailVerified: true });
      setMessage(t.profile.emailVerificationSuccess);
    } catch (verifyError) {
      setError(getErrorMessage(verifyError, 'Code invalide ou expiré.'));
    } finally {
      setIsVerifying(false);
    }
  }

  return (
    <div className="mt-1.5">
      {!isCodeSent ? (
        <button
          type="button"
          onClick={handleSendCode}
          disabled={isSending || !email}
          className="text-xs font-semibold text-brand-primary hover:text-brand-primary-hover transition disabled:opacity-50"
        >
          {isSending ? t.profile.sendingVerificationCode : `${t.profile.emailNotVerified} · ${t.profile.verifyEmail}`}
        </button>
      ) : (
        <form onSubmit={handleVerify} className="flex items-center gap-1.5">
          <input
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder={t.profile.verificationCodePlaceholder}
            inputMode="numeric"
            maxLength={6}
            className="flex-1 min-w-0 px-2.5 py-1.5 bg-surface-app border border-stroke-default rounded-lg text-xs text-content-main placeholder-content-muted outline-none focus:border-brand-primary transition tracking-widest"
          />
          <button
            type="submit"
            disabled={isVerifying}
            className="shrink-0 text-xs font-semibold text-brand-primary hover:text-brand-primary-hover transition disabled:opacity-50"
          >
            {isVerifying ? t.profile.verifyingCode : t.profile.confirmCode}
          </button>
        </form>
      )}
      {message && <p className="mt-1 text-[11px] text-content-muted">{message}</p>}
      {error && <p className="mt-1 text-[11px] text-danger">{error}</p>}
    </div>
  );
}
