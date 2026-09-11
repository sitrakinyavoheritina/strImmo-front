'use client';

import { useTranslation } from '@/lib/i18n/use-translation';
import { AuthPageShell } from '@/features/auth/components/auth-page-shell';
import { RegisterOwnerForm } from '@/features/auth/register-owner-form';

export default function InscriptionLocatairePage() {
  const { t } = useTranslation();

  return (
    <AuthPageShell title={t.auth.roleTenant} subtitle={t.auth.registerSubtitle}>
      <RegisterOwnerForm role="tenant" />
    </AuthPageShell>
  );
}
