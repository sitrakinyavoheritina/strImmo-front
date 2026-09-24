'use client';

import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useTopCommunes } from '@/features/search/hooks/use-top-communes';
import { filtersToSearchParams } from '@/features/search/utils/filters-query';

/** Les 6 communes avec le plus d'annonces — clic = recherche filtrée sur cette commune précise
 *  (`communeId`, pas le texte libre `location`, voir properties.service.ts:getTopCommunes). */
export function TopCommunesWidget() {
  const { t } = useTranslation();
  const { data: communes } = useTopCommunes(6);

  if (!communes || communes.length === 0) return null;

  return (
    <div>
      <h3 className="text-sm font-semibold text-content-main mb-2.5">{t.feed.topCommunes}</h3>
      <div className="flex flex-wrap gap-2">
        {communes.map((commune) => (
          <Link
            key={commune.communeId}
            href={`/recherche?${filtersToSearchParams({ communeId: commune.communeId }).toString()}`}
            className="flex items-center gap-1 rounded-full border border-stroke-default bg-surface-card px-3 py-1.5 text-[0.85rem] font-medium text-content-main hover:border-brand-primary hover:text-brand-primary transition"
          >
            <MapPin size={13} className="text-brand-primary shrink-0" />
            {commune.communeName}
          </Link>
        ))}
      </div>
    </div>
  );
}
