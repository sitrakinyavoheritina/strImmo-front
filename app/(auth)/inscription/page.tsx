'use client';

import { useTranslation } from '@/lib/i18n/use-translation';
import { AuthPageShell } from '@/features/auth/components/auth-page-shell';
import { RoleSelect } from '@/features/auth/components/role-select';
import { GoogleSignInButton } from '@/features/auth/components/google-sign-in-button';

// Le bouton Google connecte/crée un compte directement (voir
// strImmo/src/auth/auth.service.ts:loginWithGoogle) sans passer par ces 4 formulaires — un
// nouveau compte est redirigé vers /completer-profil juste après (choix du rôle + téléphone).
export default function InscriptionPage() {
  const { t } = useTranslation();

  return (
    <AuthPageShell title={t.auth.roleSelectTitle} subtitle={t.auth.roleSelectSubtitle} maxWidthClassName="sm:max-w-2xl">
      <RoleSelect />

      <div className="mt-5 flex items-center gap-3">
        <span className="flex-1 h-px bg-stroke-default" />
        <span className="text-[11px] font-medium text-content-muted uppercase">{t.auth.orDivider}</span>
        <span className="flex-1 h-px bg-stroke-default" />
      </div>

      <div className="mt-3">
        <GoogleSignInButton />
      </div>
    </AuthPageShell>
  );
}
