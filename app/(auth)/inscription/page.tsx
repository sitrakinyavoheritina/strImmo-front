'use client';

import { useTranslation } from '@/lib/i18n/use-translation';
import { AuthPageShell } from '@/features/auth/components/auth-page-shell';
import { RoleSelect } from '@/features/auth/components/role-select';

export default function InscriptionPage() {
  const { t } = useTranslation();

  return (
    <AuthPageShell title={t.auth.roleSelectTitle} subtitle={t.auth.roleSelectSubtitle} maxWidthClassName="sm:max-w-2xl">
      <RoleSelect />
    </AuthPageShell>
  );
}
