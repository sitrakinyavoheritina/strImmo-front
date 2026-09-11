'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, Trash2 } from 'lucide-react';
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

// Même charte visuelle que FeedPropertyCard (photo, prix, titre, localisation) — la ligne du bas
// remplace auteur/favoris/commentaire (sans objet ici) par le statut de modération et l'action de
// suppression, seules infos utiles au propriétaire sur sa propre annonce.
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

  return (
    <article className="bg-surface-card rounded-2xl border border-stroke-default/80 shadow-sm">
      <Link href={`/annonce/${property.id}`} className="block relative aspect-[3/2] bg-stroke-default rounded-t-2xl overflow-hidden">
        {cover && <Image src={cover} alt={property.title} fill className="object-cover" />}
        <span
          className={`absolute top-3 left-3 text-[10px] font-bold px-2 py-1 rounded-md uppercase ${STATUS_BADGE_CLASS[property.moderationStatus]}`}
        >
          {t.myPropertiesPage[STATUS_LABEL_KEY[property.moderationStatus]]}
        </span>
        <span className="absolute bottom-3 right-3 bg-surface-card/95 text-content-main text-xs font-bold px-2 py-1 rounded-md">
          {formatPrice(property.price)}
          {property.propertyType === 'land' && <span className="font-normal text-content-muted"> / m²</span>}
        </span>
      </Link>

      <div className="px-3 py-2 space-y-0.5">
        <p className="text-xs text-content-muted truncate">{property.location}</p>
        <h3 className="text-sm font-semibold text-content-main line-clamp-1">{property.title}</h3>
        {property.moderationStatus === 'rejected' && property.rejectionReason && (
          <p className="text-xs text-danger">
            <span className="font-semibold">{t.myPropertiesPage.rejectionReasonPrefix}</span> {property.rejectionReason}
          </p>
        )}
      </div>

      {confirming ? (
        // Rangée dédiée (pas partagée avec le compteur de vues) : le texte de confirmation +
        // deux boutons ne tenaient pas sur la même ligne que "N vue(s)" sur une carte étroite
        // (texte qui se recoupait avec les boutons) — pleine largeur, sur deux lignes si besoin.
        <div className="px-3 py-2 border-t border-stroke-default space-y-1.5">
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
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2 px-3 py-2 border-t border-stroke-default">
          <span className="flex items-center gap-1 text-xs font-medium text-content-muted">
            <Eye size={14} /> {property.viewCount} {t.myPropertiesPage.viewsLabel}
          </span>
          <button
            type="button"
            onClick={() => setConfirming(true)}
            aria-label={t.myPropertiesPage.delete}
            className="flex items-center gap-1 text-xs font-medium text-content-muted hover:text-danger transition"
          >
            <Trash2 size={14} />
            {t.myPropertiesPage.delete}
          </button>
        </div>
      )}
      {error && <p className="px-3 pb-2 text-xs text-danger">{t.myPropertiesPage.deleteError}</p>}
    </article>
  );
}
