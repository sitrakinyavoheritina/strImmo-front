'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2 } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';
import { formatPrice } from '@/features/search/utils/format-price';
import { useDeleteProperty } from '@/features/search/hooks/use-delete-property';
import type { Property } from '@/features/search/types/listing.types';

const STATUS_LABEL_KEY = {
  pending: 'statusPending',
  approved: 'statusApproved',
  rejected: 'statusRejected',
} as const;

const STATUS_BADGE_CLASS = {
  pending: 'bg-amber-100 text-amber-800',
  approved: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-danger/10 text-danger',
} as const;

// Même ligne compacte que /favoris (FavoriteListItem) — demandé explicitement, une seule
// interface de liste dans toute l'app plutôt qu'une carte détaillée par écran. L'action de droite
// change de sens : ici "Supprimer" (sa propre annonce), pas "retirer des favoris" (sans objet sur
// ses propres biens) — avec la même confirmation en deux temps qu'avant, juste réagencée pour
// tenir dans la largeur d'une ligne plutôt qu'une carte.
export function MyPropertyCard({ property }: { property: Property }) {
  const { t } = useTranslation();
  const { mutate: remove, isPending } = useDeleteProperty();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState(false);
  const cover = property.mainPhotoUrl;

  function handleConfirmDelete() {
    remove(property.id, {
      onError: () => {
        setConfirming(false);
        setError(true);
      },
    });
  }

  if (confirming) {
    return (
      <div className="bg-surface-card border border-stroke-default/80 rounded-xl p-3 space-y-1.5">
        <p className="text-xs text-content-muted">{t.myPropertiesPage.deleteConfirm}</p>
        <div className="flex items-center gap-3 text-xs">
          <button
            type="button"
            onClick={handleConfirmDelete}
            disabled={isPending}
            className="font-semibold text-danger disabled:opacity-50"
          >
            {t.myPropertiesPage.deleteConfirmButton}
          </button>
          <button type="button" onClick={() => setConfirming(false)} className="font-semibold text-content-muted">
            {t.myPropertiesPage.deleteCancelButton}
          </button>
        </div>
        {error && <p className="text-xs text-danger">{t.myPropertiesPage.deleteError}</p>}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 bg-surface-card border border-stroke-default/80 rounded-xl p-2.5">
      <Link
        href={`/annonce/${property.id}`}
        className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-lg overflow-hidden bg-stroke-default"
      >
        {cover && <Image src={cover} alt={property.title} fill className="object-cover" />}
      </Link>
      <Link href={`/annonce/${property.id}`} className="flex-1 min-w-0">
        <span
          className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${STATUS_BADGE_CLASS[property.moderationStatus]}`}
        >
          {t.myPropertiesPage[STATUS_LABEL_KEY[property.moderationStatus]]}
        </span>
        <p className="text-sm font-semibold text-content-main truncate mt-0.5">{property.title}</p>
        <p className="text-xs text-content-muted truncate">{property.location}</p>
        <p className="text-sm font-bold text-brand-secondary-text mt-0.5">
          {formatPrice(property.price)}
          {property.propertyType === 'land' && <span className="font-normal text-content-muted"> / m²</span>}
        </p>
        {property.moderationStatus === 'rejected' && property.rejectionReason && (
          <p className="text-xs text-danger mt-0.5 truncate">
            <span className="font-semibold">{t.myPropertiesPage.rejectionReasonPrefix}</span> {property.rejectionReason}
          </p>
        )}
      </Link>
      <button
        type="button"
        onClick={() => setConfirming(true)}
        aria-label={t.myPropertiesPage.delete}
        className="shrink-0 p-2 text-content-muted hover:text-danger transition"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
}
