'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useAuthStore, useAuthHasHydrated } from '@/lib/state/use-auth-store';
import { isAdmin } from '@/features/auth/utils/is-admin';
import { TargetUserPicker } from '@/features/admin/components/target-user-picker';
import { NouvelleDemandeForm } from '@/app/demandes/nouvelle/page';
import type { AdminSearchUser } from '@/features/admin/types';

// Même formulaire que /demandes/nouvelle (NouvelleDemandeForm, rendu paramétrable par
// `targetUserId`, voir ce fichier) — précédé ici d'un TargetUserPicker obligatoire, et publié via
// POST /property-requests/admin (sans vérification de téléphone, voir
// PropertyRequestsService.create, adminContext).
function NouvelleDemandeAdminForm() {
  const { t } = useTranslation();
  const [targetUser, setTargetUser] = useState<AdminSearchUser | null>(null);

  if (!targetUser) {
    return (
      <div className="max-w-md mx-auto px-3 sm:px-6 py-4 sm:py-6">
        <p className="text-sm font-semibold text-content-main mb-2">{t.adminCreateRequestPage.selectUserFirst}</p>
        <TargetUserPicker selected={targetUser} onSelect={setTargetUser} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-6 pt-4 sm:pt-6">
      <p className="text-xl sm:text-2xl font-extrabold text-brand-secondary-text">{t.adminCreateRequestPage.title}</p>
      <p className="text-content-muted text-[0.85rem] font-medium mt-1">{t.adminCreateRequestPage.subtitle}</p>
      <div className="mt-3 mb-1">
        <TargetUserPicker selected={targetUser} onSelect={setTargetUser} />
      </div>
      <NouvelleDemandeForm targetUserId={targetUser.id} />
    </div>
  );
}

export default function NouvelleDemandeAdminPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthHasHydrated();
  const isAdminUser = isAdmin(user);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAuthenticated) router.replace('/connexion');
    else if (!isAdminUser) router.replace('/');
  }, [hasHydrated, isAuthenticated, isAdminUser, router]);

  if (!isAdminUser) return null;

  return (
    <div className="px-3 sm:px-6 lg:px-0">
      <Link
        href="/admin/demandes"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-content-muted hover:text-content-main pt-3 sm:pt-6"
      >
        <ArrowLeft size={20} />
        {t.adminDemandesPage.title}
      </Link>
      <Suspense fallback={null}>
        <NouvelleDemandeAdminForm />
      </Suspense>
    </div>
  );
}
