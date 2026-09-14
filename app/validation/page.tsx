'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useAuthStore, useAuthHasHydrated } from '@/lib/state/use-auth-store';
import { isAdmin } from '@/features/auth/utils/is-admin';
import { useProperties } from '@/features/search/hooks/use-properties';
import { PendingPropertyCard } from '@/features/listings/components/pending-property-card';
import { RightRail } from '@/features/feed/components/right-rail';

// Remplace "Mes Biens" dans la navigation pour un compte admin/superadmin (voir
// components/layout/nav-items.ts) — liste des annonces en attente de modération
// (`moderationStatus: 'pending'`), avec valider/refuser directement depuis la ligne (voir
// PendingPropertyCard). Un utilisateur non-admin qui arrive ici quand même (lien direct, etc.)
// est renvoyé à l'accueil — cette page n'a aucun sens pour lui.
export default function ValidationPage() {
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

  const { data: properties, isLoading } = useProperties(
    { status: 'pending' },
    { enabled: isAdminUser }
  );

  if (!isAdminUser) return null;

  return (
    <div className="flex px-3 sm:px-6 lg:px-0">
      <div className="flex-1 min-w-0 py-3 sm:py-6 max-w-2xl">
        <h1 className="text-lg sm:text-xl font-bold text-brand-secondary-text mb-4">{t.validationPage.title}</h1>

        {isLoading ? (
          <p className="text-sm text-content-muted">{t.search.searching}</p>
        ) : properties && properties.length > 0 ? (
          <div className="space-y-2">
            {properties.map((property) => (
              <PendingPropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <div className="bg-surface-card border border-stroke-default/80 rounded-2xl shadow-sm flex flex-col items-center gap-3 py-16 text-center">
            <ShieldCheck size={32} className="text-content-muted" />
            <p className="font-semibold text-content-main">{t.validationPage.emptyTitle}</p>
            <p className="text-sm text-content-muted">{t.validationPage.emptyDescription}</p>
          </div>
        )}
      </div>
      <RightRail />
    </div>
  );
}
