'use client';

import { useTranslation } from '@/lib/i18n/use-translation';
import { AuthPageShell } from '@/features/auth/components/auth-page-shell';
import { RegisterAgentForm } from '@/features/auth/register-agent-form';

export default function InscriptionIntermediairePage() {
  const { t } = useTranslation();

  return (
    <AuthPageShell title={t.auth.roleAgent} subtitle={t.auth.registerSubtitle}>
      <RegisterAgentForm />
    </AuthPageShell>
  );
}
