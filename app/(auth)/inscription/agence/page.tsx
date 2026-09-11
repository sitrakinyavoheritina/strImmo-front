'use client';

import { useTranslation } from '@/lib/i18n/use-translation';
import { AuthPageShell } from '@/features/auth/components/auth-page-shell';
import { RegisterAgencyForm } from '@/features/auth/register-agency-form';

export default function InscriptionAgencePage() {
  const { t } = useTranslation();

  return (
    <AuthPageShell title={t.auth.roleAgency} subtitle={t.auth.registerSubtitle}>
      <RegisterAgencyForm />
    </AuthPageShell>
  );
}
