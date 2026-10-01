'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Building2, ClipboardList, Plus } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useAuthStore, useAuthHasHydrated } from '@/lib/state/use-auth-store';
import { useProperties } from '@/features/search/hooks/use-properties';
import { MyPropertyCard } from '@/features/listings/components/my-property-card';
import { useMyPropertyRequests } from '@/features/property-requests/hooks/use-property-requests';
import { MyRequestCard } from '@/features/property-requests/components/my-request-card';
import { Button } from '@/components/ui/button';
import { RightRail } from '@/features/feed/components/right-rail';

type Tab = 'properties' | 'requests';

export default function MesBiensPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthHasHydrated();
  // Un compte locataire n'a jamais de bien à gérer : lui montrer "Mes demandes" par défaut plutôt
  // qu'une liste de biens forcément vide. `manualTab` reste `null` tant que la personne n'a pas
  // cliqué elle-même sur un onglet — jusque-là, l'onglet affiché se déduit du rôle (calculé
  // directement au rendu, pas dans un effet, pour éviter un rendu supplémentaire).
  const [manualTab, setManualTab] = useState<Tab | null>(null);
  const defaultTab: Tab | null = hasHydrated && user ? (user.role === 'tenant' ? 'requests' : 'properties') : null;
  const tab = manualTab ?? defaultTab;

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) router.replace('/connexion');
  }, [hasHydrated, isAuthenticated, router]);

  // Sans le filtre `status`, le backend renvoie l'annonce quel que soit son statut dès que
  // `ownerId` est fourni (voir strImmo/src/properties/properties.service.ts) — seul cas où les
  // annonces en attente/refusées du propriétaire lui restent visibles.
  const { data: properties, isLoading } = useProperties(user ? { ownerId: user.id } : undefined, {
    enabled: !!user && tab === 'properties',
  });
  const { data: myRequests, isLoading: isLoadingRequests } = useMyPropertyRequests(isAuthenticated && tab === 'requests');

  if (!isAuthenticated || tab === null) return null;

  return (
    <div className="flex px-3 sm:px-6 lg:px-0">
      <div className="flex-1 min-w-0 py-3 sm:py-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setManualTab('properties')}
              className={`px-3 py-1.5 rounded-full text-[0.85rem] font-bold transition ${
                tab === 'properties' ? 'bg-brand-secondary text-white' : 'text-content-muted hover:bg-surface-app'
              }`}
            >
              {t.myPropertiesPage.title}
            </button>
            <button
              type="button"
              onClick={() => setManualTab('requests')}
              className={`px-3 py-1.5 rounded-full text-[0.85rem] font-bold transition ${
                tab === 'requests' ? 'bg-brand-secondary text-white' : 'text-content-muted hover:bg-surface-app'
              }`}
            >
              {t.propertyRequestsPage.mesBiensSectionTitle}
            </button>
          </div>
          {tab === 'properties' ? (
            <Link href="/annonce/nouvelle" className="shrink-0">
              <Button type="button" size="sm">
                <Plus size={20} className="sm:hidden" />
                <span className="hidden sm:inline">{t.myPropertiesPage.postAd}</span>
              </Button>
            </Link>
          ) : (
            <Link href="/demandes/nouvelle" className="shrink-0">
              <Button type="button" size="sm">
                <Plus size={20} className="sm:hidden" />
                <span className="hidden sm:inline">{t.propertyRequestsPage.createButton}</span>
              </Button>
            </Link>
          )}
        </div>

        {tab === 'properties' &&
          (isLoading ? (
            <p className="text-sm text-content-muted">{t.search.searching}</p>
          ) : properties && properties.length > 0 ? (
            <div className="space-y-2">
              {properties.map((property) => (
                <MyPropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="bg-surface-card border border-stroke-default/80 rounded-2xl shadow-sm flex flex-col items-center gap-3 py-16 text-center">
              <Building2 size={32} className="text-content-muted" />
              <p className="font-semibold text-content-main">{t.myPropertiesPage.emptyTitle}</p>
              <p className="text-sm text-content-muted">{t.myPropertiesPage.emptyDescription}</p>
              <Link
                href="/annonce/nouvelle"
                className="inline-flex items-center gap-1.5 bg-brand-secondary hover:bg-brand-secondary-hover text-white text-sm font-semibold rounded-xl px-3.5 py-2 transition mt-1"
              >
                <Plus size={20} />
                {t.myPropertiesPage.postAd}
              </Link>
            </div>
          ))}

        {tab === 'requests' &&
          (isLoadingRequests ? (
            <p className="text-sm text-content-muted">{t.search.searching}</p>
          ) : myRequests && myRequests.length > 0 ? (
            <div className="space-y-2">
              {myRequests.map((request) => (
                <MyRequestCard key={request.id} request={request} />
              ))}
            </div>
          ) : (
            <div className="bg-surface-card border border-stroke-default/80 rounded-2xl shadow-sm flex flex-col items-center gap-3 py-16 text-center">
              <ClipboardList size={32} className="text-content-muted" />
              <p className="font-semibold text-content-main">{t.propertyRequestsPage.mineEmptyTitle}</p>
              <p className="text-sm text-content-muted px-4">{t.propertyRequestsPage.mineEmptyDescription}</p>
              <Link href="/demandes/nouvelle">
                <Button type="button" size="sm">
                  {t.propertyRequestsPage.createButton}
                </Button>
              </Link>
            </div>
          ))}
      </div>
      <RightRail />
    </div>
  );
}
