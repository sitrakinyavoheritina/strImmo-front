'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from '@/lib/i18n/use-translation';
import { formatPrice, getPriceSuffix } from '@/features/search/utils/format-price';
import { STATUS_LABEL_KEY, STATUS_BADGE_CLASS } from '../utils/status-badge';
import type { Property } from '@/features/search/types/listing.types';

// Ligne en lecture seule pour /admin/annonces — même gabarit que MyPropertyCard, sans l'action
// de suppression (un admin parcourt/consulte, il ne gère pas la publication comme un propriétaire).
// `moderatorName` (qui a validé/refusé) affiché sous le statut quand connu — absent pour les
// annonces modérées avant l'ajout de ce suivi.
export function AdminPropertyListItem({ property }: { property: Property }) {
  const { t } = useTranslation();
  const cover = property.mainPhotoUrl;

  return (
    <Link
      href={`/annonce/${property.id}`}
      className="flex items-center gap-3 bg-surface-card border border-stroke-default/80 rounded-xl p-2.5 hover:border-brand-primary/40 transition"
    >
      <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-lg overflow-hidden bg-stroke-default">
        {cover && <Image src={cover} alt={property.title} fill className="object-cover" />}
      </div>
      <div className="flex-1 min-w-0">
        <span
          className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${STATUS_BADGE_CLASS[property.moderationStatus]}`}
        >
          {t.myPropertiesPage[STATUS_LABEL_KEY[property.moderationStatus]]}
        </span>
        <p className="text-sm font-semibold text-content-main truncate mt-0.5">{property.title}</p>
        <p className="text-xs text-content-muted truncate">{property.location}</p>
        <p className="text-sm font-bold text-brand-secondary-text mt-0.5">
          {formatPrice(property.price)}
          {getPriceSuffix(property) && <span className="font-normal text-content-muted">{getPriceSuffix(property)}</span>}
        </p>
        {property.moderatorName && (
          <p className="text-[11px] text-content-muted mt-0.5">
            {property.moderationStatus === 'rejected'
              ? t.adminAnnoncesPage.rejectedBy
              : t.adminAnnoncesPage.approvedBy}{' '}
            {property.moderatorName}
          </p>
        )}
        {property.moderationStatus === 'rejected' && property.rejectionReason && (
          <p className="text-xs text-danger mt-0.5 truncate">
            <span className="font-semibold">{t.myPropertiesPage.rejectionReasonPrefix}</span> {property.rejectionReason}
          </p>
        )}
      </div>
    </Link>
  );
}
