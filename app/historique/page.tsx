'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { MapPin } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useAuthStore, useAuthHasHydrated } from '@/lib/state/use-auth-store';
import { useMyViewHistory } from '@/features/analytics/hooks/use-analytics-queries';
import { formatPrice } from '@/features/search/utils/format-price';
import { RightRail } from '@/features/feed/components/right-rail';

// Mes dernières annonces consultées — alimenté par GET /property-views/me (dernière consultation
// par annonce, annonces encore publiées seulement). Nécessite un compte.
export default function HistoriquePage() {
  const { t } = useTranslation();
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasHydrated = useAuthHasHydrated();
  const { data: history, isLoading } = useMyViewHistory();

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) router.replace('/connexion');
  }, [hasHydrated, isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return (
    <div className="flex px-3 sm:px-6 lg:px-0">
      <div className="flex-1 min-w-0 py-3 sm:py-6 max-w-2xl">
        <h1 className="text-lg sm:text-xl font-bold text-brand-secondary-text">{t.viewHistoryPage.title}</h1>
        {isLoading ? (
          <p className="text-sm text-content-muted mt-4">{t.search.searching}</p>
        ) : history && history.length > 0 ? (
          <div className="space-y-2 mt-4">
            {history.map((item) => (
              <Link
                key={item.propertyId}
                href={`/annonce/${item.propertyId}`}
                className="flex items-center gap-3 bg-surface-card border border-stroke-default/80 rounded-xl p-2.5 hover:border-brand-primary/40 transition"
              >
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-lg overflow-hidden bg-stroke-default">
                  {item.coverUrl && <Image src={item.coverUrl} alt={item.title} fill className="object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-content-main truncate">{item.title}</p>
                  <p className="text-[0.85rem] text-content-muted flex items-center gap-1 mt-0.5 min-w-0">
                    <MapPin size={11} className="shrink-0 text-brand-primary" />
                    <span className="truncate">{item.location}</span>
                  </p>
                  <p className="text-sm font-bold text-brand-secondary-text mt-0.5">{formatPrice(item.price)}</p>
                  <p className="text-[12px] text-content-muted">
                    {t.viewHistoryPage.viewedOn}{' '}
                    {new Date(item.viewedAt).toLocaleString('fr-FR', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-content-muted py-12 text-center">{t.viewHistoryPage.empty}</p>
        )}
      </div>
      <RightRail />
    </div>
  );
}
