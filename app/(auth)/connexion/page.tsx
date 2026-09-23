'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/use-translation';
import { AuthPageShell } from '@/features/auth/components/auth-page-shell';
import { LoginForm } from '@/features/auth/login-form';

function ConnexionContent() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const isPending = searchParams.get('attente') === '1';
  const isReset = searchParams.get('reinitialise') === '1';

  return (
    <AuthPageShell title={t.auth.loginTitle} subtitle={t.auth.loginSubtitle}>
      {isPending && (
        <div className="mb-3 sm:mb-4 rounded-xl border border-brand-primary/30 bg-brand-primary-soft px-3 py-2.5 text-sm text-brand-primary text-left">
          <p className="font-semibold">{t.auth.pendingApprovalTitle}</p>
          <p className="mt-0.5 text-[0.85rem]">{t.auth.pendingApprovalMessage}</p>
        </div>
      )}
      {isReset && (
        <div className="mb-3 sm:mb-4 rounded-xl border border-brand-primary/30 bg-brand-primary-soft px-3 py-2.5 text-sm text-brand-primary text-left">
          <p className="font-semibold">{t.forgotPasswordPage.resetSuccess}</p>
        </div>
      )}
      <LoginForm />
    </AuthPageShell>
  );
}

export default function ConnexionPage() {
  return (
    <Suspense fallback={null}>
      <ConnexionContent />
    </Suspense>
  );
}
