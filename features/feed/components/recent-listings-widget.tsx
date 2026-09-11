'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useProperties } from '@/features/search/hooks/use-properties';

/** Mini-liste des annonces les plus récentes, en vignette. */
export function RecentListingsWidget() {
  const { t } = useTranslation();
  const { data: properties } = useProperties({ sortBy: 'recent' });
  const recent = properties?.slice(0, 2) ?? [];

  if (recent.length === 0) return null;

  return (
    <div>
      <h3 className="text-sm font-semibold text-content-main mb-2.5">{t.feed.recentListings}</h3>
      <div className="space-y-2.5">
        {recent.map((property) => (
          <Link
            key={property.id}
            href={`/annonce/${property.id}`}
            className="flex items-center gap-2.5 rounded-xl border border-stroke-default bg-surface-card p-2 hover:border-brand-primary transition"
          >
            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-stroke-default shrink-0">
              {property.mainPhotoUrl && (
                <Image src={property.mainPhotoUrl} alt={property.title} fill className="object-cover" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-content-main line-clamp-1">{property.title}</p>
              <p className="text-xs text-content-muted line-clamp-1">{property.location}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
