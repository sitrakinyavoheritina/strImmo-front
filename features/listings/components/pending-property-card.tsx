'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Check, X } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';
import { formatPrice, getPriceSuffix } from '@/features/search/utils/format-price';
import { useApproveProperty, useRejectProperty } from '@/features/search/hooks/use-moderate-property';
import type { Property } from '@/features/search/types/listing.types';

// Même ligne compacte que MyPropertyCard/FavoriteListItem — une seule interface de liste dans
// toute l'app. Toutes les annonces listées ici sont "pending" par définition (voir
// app/validation/page.tsx), donc pas de badge de statut à afficher, juste les deux actions de
// modération. "Valider" part directement au clic (comme sur l'app mobile) ; "Refuser" exige un
// motif (obligatoire côté backend, voir strImmo/src/properties/dto/reject-property.dto.ts) donc
// ouvre un petit formulaire inline plutôt que de forcer à passer par la fiche détail.
export function PendingPropertyCard({ property }: { property: Property }) {
  const { t } = useTranslation();
  const { mutate: approve, isPending: isApproving } = useApproveProperty();
  const { mutate: reject, isPending: isRejecting } = useRejectProperty();
  const [isRejectFormOpen, setIsRejectFormOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const cover = property.mainPhotoUrl;

  function handleApprove() {
    setError(null);
    approve(property.id, { onError: () => setError(t.validationPage.approveError) });
  }

  function handleConfirmReject() {
    if (!reason.trim()) {
      setError(t.validationPage.rejectReasonRequired);
      return;
    }
    setError(null);
    reject(
      { id: property.id, reason: reason.trim() },
      { onError: () => setError(t.validationPage.rejectError) }
    );
  }

  if (isRejectFormOpen) {
    return (
      <div className="bg-surface-card border border-stroke-default/80 rounded-xl p-3 space-y-2">
        <p className="text-sm font-semibold text-content-main truncate">{property.title}</p>
        <label className="block text-xs font-semibold text-content-muted" htmlFor={`reject-reason-${property.id}`}>
          {t.validationPage.rejectReasonLabel}
        </label>
        <textarea
          id={`reject-reason-${property.id}`}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder={t.validationPage.rejectReasonPlaceholder}
          rows={2}
          className="w-full rounded-lg border border-stroke-default bg-surface-app px-2.5 py-1.5 text-sm text-content-main placeholder-content-muted outline-none focus:border-brand-primary resize-none"
        />
        <div className="flex items-center gap-3 text-xs">
          <button
            type="button"
            onClick={handleConfirmReject}
            disabled={isRejecting}
            className="font-semibold text-danger disabled:opacity-50"
          >
            {t.validationPage.rejectConfirm}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRejectFormOpen(false);
              setReason('');
              setError(null);
            }}
            className="font-semibold text-content-muted"
          >
            {t.validationPage.rejectCancel}
          </button>
        </div>
        {error && <p className="text-xs text-danger">{error}</p>}
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
        <p className="text-sm font-semibold text-content-main truncate">{property.title}</p>
        <p className="text-xs text-content-muted truncate">{property.location}</p>
        <p className="text-sm font-bold text-brand-secondary-text mt-0.5">
          {formatPrice(property.price)}
          {getPriceSuffix(property) && <span className="font-normal text-content-muted">{getPriceSuffix(property)}</span>}
        </p>
        {error && <p className="text-xs text-danger mt-0.5">{error}</p>}
      </Link>
      <div className="shrink-0 flex flex-col gap-1.5">
        <button
          type="button"
          onClick={handleApprove}
          disabled={isApproving}
          aria-label={t.validationPage.approve}
          className="p-2 rounded-lg bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20 transition disabled:opacity-50"
        >
          <Check size={16} />
        </button>
        <button
          type="button"
          onClick={() => setIsRejectFormOpen(true)}
          aria-label={t.validationPage.reject}
          className="p-2 rounded-lg bg-danger/10 text-danger hover:bg-danger/20 transition"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
