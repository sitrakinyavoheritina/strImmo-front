'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Building2, Plus } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useAuthStore, useAuthHasHydrated } from '@/lib/state/use-auth-store';
import { useProperties } from '@/features/search/hooks/use-properties';
import { MyPropertyCard } from '@/features/listings/components/my-property-card';
import { RightRail } from '@/features/feed/components/right-rail';

export default function MesBiensPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthHasHydrated();

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) router.replace('/connexion');
  }, [hasHydrated, isAuthenticated, router]);

  // Sans le filtre `status`, le backend renvoie l'annonce quel que soit son statut dès que
  // `ownerId` est fourni (voir strImmo/src/properties/properties.service.ts) — seul cas où les
  // annonces en attente/refusées du propriétaire lui restent visibles.
  const { data: properties, isLoading } = useProperties(user ? { ownerId: user.id } : undefined, {
    enabled: !!user,
  });

  if (!isAuthenticated) return null;

  return (
    <div className="flex px-3 sm:px-6 lg:px-0">
      <div className="flex-1 min-w-0 py-3 sm:py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg sm:text-xl font-bold text-content-main">{t.myPropertiesPage.title}</h1>
          <Link
            href="/annonce/nouvelle"
            className="hidden sm:inline-flex items-center gap-1.5 bg-[#c9992f] hover:bg-[#b3852a] text-white text-sm font-semibold rounded-xl px-3.5 py-2 transition"
          >
            <Plus size={16} />
            {t.myPropertiesPage.postAd}
          </Link>
        </div>

        {isLoading ? (
          <p className="text-sm text-content-muted">{t.search.searching}</p>
        ) : properties && properties.length > 0 ? (
          <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
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
              className="inline-flex items-center gap-1.5 bg-[#c9992f] hover:bg-[#b3852a] text-white text-sm font-semibold rounded-xl px-3.5 py-2 transition mt-1"
            >
              <Plus size={16} />
              {t.myPropertiesPage.postAd}
            </Link>
          </div>
        )}
      </div>
      <RightRail />
    </div>
  );
}
