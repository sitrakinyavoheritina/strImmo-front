'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2 } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useAuthStore, useAuthHasHydrated } from '@/lib/state/use-auth-store';
import { isAdmin } from '@/features/auth/utils/is-admin';
import { useProperties } from '@/features/search/hooks/use-properties';
import { AdminPropertyListItem } from '@/features/listings/components/admin-property-list-item';
import { RightRail } from '@/features/feed/components/right-rail';

type Tab = 'approved' | 'rejected';

// Liste consultable de toutes les annonces déjà traitées — "voir la liste des annonces validées/
// refusées" demandé explicitement, distinct de /validation (qui gère les annonces encore en
// attente, avec les actions de modération). Pas de "Toutes" (mélangeant les statuts) : le backend
// n'a qu'un filtre `status` unique par requête (voir strImmo/src/properties/properties.service.ts),
// donc deux onglets plutôt qu'un agrégat coûteux à recomposer côté client.
export default function AdminAnnoncesPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthHasHydrated();
  const isAdminUser = isAdmin(user);
  const [tab, setTab] = useState<Tab>('approved');

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAuthenticated) router.replace('/connexion');
    else if (!isAdminUser) router.replace('/');
  }, [hasHydrated, isAuthenticated, isAdminUser, router]);

  const { data: properties, isLoading } = useProperties({ status: tab }, { enabled: isAdminUser });

  if (!isAdminUser) return null;

  return (
    <div className="flex px-3 sm:px-6 lg:px-0">
      <div className="flex-1 min-w-0 py-3 sm:py-6 max-w-2xl">
        <h1 className="text-lg sm:text-xl font-bold text-brand-secondary-text mb-4">{t.adminAnnoncesPage.title}</h1>

        <div className="flex items-center gap-1 rounded-xl border border-stroke-default bg-surface-app p-1 text-sm font-semibold mb-4 max-w-xs">
          <button
            type="button"
            onClick={() => setTab('approved')}
            aria-pressed={tab === 'approved'}
            className={`flex-1 px-3 py-1.5 rounded-lg transition ${
              tab === 'approved' ? 'bg-brand-primary text-white' : 'text-content-muted hover:text-content-main'
            }`}
          >
            {t.adminAnnoncesPage.tabApproved}
          </button>
          <button
            type="button"
            onClick={() => setTab('rejected')}
            aria-pressed={tab === 'rejected'}
            className={`flex-1 px-3 py-1.5 rounded-lg transition ${
              tab === 'rejected' ? 'bg-brand-primary text-white' : 'text-content-muted hover:text-content-main'
            }`}
          >
            {t.adminAnnoncesPage.tabRejected}
          </button>
        </div>

        {isLoading ? (
          <p className="text-sm text-content-muted">{t.search.searching}</p>
        ) : properties && properties.length > 0 ? (
          <div className="space-y-2">
            {properties.map((property) => (
              <AdminPropertyListItem key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <div className="bg-surface-card border border-stroke-default/80 rounded-2xl shadow-sm flex flex-col items-center gap-3 py-16 text-center">
            <Building2 size={32} className="text-content-muted" />
            <p className="font-semibold text-content-main">{t.adminAnnoncesPage.emptyTitle}</p>
            <p className="text-sm text-content-muted">{t.adminAnnoncesPage.emptyDescription}</p>
          </div>
        )}
      </div>
      <RightRail />
    </div>
  );
}
