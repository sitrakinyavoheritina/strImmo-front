'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2 } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useAuthStore, useAuthHasHydrated } from '@/lib/state/use-auth-store';
import { isAdmin } from '@/features/auth/utils/is-admin';
import { useProperties, useDeletedProperties } from '@/features/search/hooks/use-properties';
import { AdminPropertyListItem } from '@/features/listings/components/admin-property-list-item';
import { formatPrice } from '@/features/search/utils/format-price';
import { RightRail } from '@/features/feed/components/right-rail';

type Tab = 'approved' | 'rejected' | 'deleted';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

// Liste consultable de toutes les annonces déjà traitées — "voir la liste des annonces validées/
// refusées" demandé explicitement, distinct de /validation (qui gère les annonces encore en
// attente, avec les actions de modération). Pas de "Toutes" (mélangeant les statuts) : le backend
// n'a qu'un filtre `status` unique par requête (voir strImmo/src/properties/properties.service.ts),
// donc des onglets plutôt qu'un agrégat coûteux à recomposer côté client. "Supprimées" (demandé
// explicitement) vient d'un endpoint séparé (annonces jamais réellement retirées de la base, voir
// Property.deletedAt) : sa ligne n'est volontairement pas cliquable, contrairement aux deux autres
// onglets — la fiche /annonce/:id ne les affiche plus (même filtrage automatique côté serveur).
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

  const { data: properties, isLoading } = useProperties(
    { status: tab === 'deleted' ? 'approved' : tab },
    { enabled: isAdminUser && tab !== 'deleted' }
  );
  const { data: deletedProperties, isLoading: isLoadingDeleted } = useDeletedProperties({
    enabled: isAdminUser && tab === 'deleted',
  });

  if (!isAdminUser) return null;

  const tabs: { key: Tab; label: string }[] = [
    { key: 'approved', label: t.adminAnnoncesPage.tabApproved },
    { key: 'rejected', label: t.adminAnnoncesPage.tabRejected },
    { key: 'deleted', label: t.adminAnnoncesPage.tabDeleted },
  ];

  return (
    <div className="flex px-3 sm:px-6 lg:px-0">
      <div className="flex-1 min-w-0 py-3 sm:py-6 max-w-2xl mx-auto">
        <h1 className="text-lg sm:text-xl font-bold text-brand-secondary-text mb-4">{t.adminAnnoncesPage.title}</h1>

        <div className="flex items-center gap-1 rounded-xl border border-stroke-default bg-surface-app p-1 text-[0.85rem] font-semibold mb-4 max-w-sm">
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              aria-pressed={tab === key}
              className={`flex-1 whitespace-nowrap px-2.5 py-1.5 rounded-lg transition ${
                tab === key ? 'bg-brand-primary text-white' : 'text-content-muted hover:text-content-main'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'deleted' ? (
          isLoadingDeleted ? (
            <p className="text-sm text-content-muted">{t.search.searching}</p>
          ) : deletedProperties && deletedProperties.length > 0 ? (
            <div className="space-y-2">
              {deletedProperties.map((property) => (
                <div key={property.id} className="bg-surface-card border border-stroke-default/80 rounded-xl p-3">
                  <p className="text-sm font-semibold text-content-main truncate">{property.title}</p>
                  <p className="text-[0.85rem] text-content-muted truncate">{property.location}</p>
                  <p className="text-sm font-bold text-brand-secondary-text mt-0.5">{formatPrice(property.price)}</p>
                  <p className="text-[12px] text-content-muted mt-1">
                    {t.adminAnnoncesPage.owner} {property.ownerName} · {property.ownerPhone}
                  </p>
                  <p className="text-[12px] text-danger mt-0.5">
                    {t.adminAnnoncesPage.deletedOn} {formatDate(property.deletedAt)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-surface-card border border-stroke-default/80 rounded-2xl shadow-sm flex flex-col items-center gap-3 py-16 text-center">
              <Building2 size={32} className="text-content-muted" />
              <p className="font-semibold text-content-main">{t.adminAnnoncesPage.emptyTitle}</p>
              <p className="text-sm text-content-muted">{t.adminAnnoncesPage.emptyDescription}</p>
            </div>
          )
        ) : isLoading ? (
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
