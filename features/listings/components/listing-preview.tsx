'use client';

import { useMemo } from 'react';
import { MapPin } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';
import { generateCoverSummary, getKeyFeatures } from '../utils/listing-summary';
import { PROPERTY_TYPE_LABEL_KEY } from '@/features/search/utils/get-key-features';
import { formatPrice } from '@/features/search/utils/format-price';
import type { PropertyFormValues } from '@/features/search/types/listing.types';

/** Aperçu fidèle de l'annonce telle qu'elle apparaîtra une fois publiée, avant validation finale —
 * port de Onina-mobile/.../listing-preview.tsx. */
export function ListingPreview({ values, photos }: { values: PropertyFormValues; photos: File[] }) {
  const { t } = useTranslation();
  const cover = photos[0];
  // Pas de révocation via useEffect ici : en Strict Mode (dev), React monte/démonte/remonte les
  // effets une fois par exercice, ce qui révoquait cette URL blob avant que l'aperçu n'ait fini de
  // l'afficher (image de couverture cassée). Au plus 8 petites photos déjà compressées le temps de
  // ce formulaire — le navigateur les libère de toute façon au déchargement de la page.
  const coverUrl = useMemo(() => (cover ? URL.createObjectURL(cover) : undefined), [cover]);
  const features = getKeyFeatures(values);

  return (
    <div className="space-y-3">
      <div className="relative h-56 rounded-2xl overflow-hidden bg-stroke-default border border-stroke-default">
        {coverUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- aperçu local (blob:), pas une image distante à optimiser
          <img src={coverUrl} alt="" className="w-full h-full object-cover" />
        )}
        <span
          className={`absolute top-3 left-3 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase ${
            values.kind === 'rent' ? 'bg-brand-primary' : 'bg-brand-secondary'
          }`}
        >
          {values.kind === 'rent' ? t.property.forRent : t.property.forSale}
        </span>
        <div className="absolute inset-x-0 bottom-0 bg-black/50 px-3 py-1.5">
          <p className="text-white text-xs font-semibold line-clamp-1">{generateCoverSummary(values)}</p>
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-brand-primary text-xs font-bold uppercase">{t.search[PROPERTY_TYPE_LABEL_KEY[values.propertyType]]}</p>
        <h2 className="text-xl font-bold text-content-main">{values.title || t.listing.formTitlePlaceholder}</h2>
        <p className="flex items-center gap-1 text-sm text-content-muted">
          <MapPin size={13} />
          {values.location || '—'}
        </p>
        <p className="text-2xl font-bold text-brand-secondary mt-1">
          {formatPrice(values.price)}
          {values.propertyType === 'land' && <span className="text-sm font-normal"> / m²</span>}
        </p>

        <div className="flex flex-wrap gap-2 pt-2">
          {features.slice(0, 4).map((feature) => (
            <span key={feature} className="border border-stroke-default rounded-xl px-3 py-2 text-xs font-semibold text-content-main">
              {feature}
            </span>
          ))}
        </div>

        {values.description && <p className="text-sm text-content-main mt-2">{values.description}</p>}
      </div>
    </div>
  );
}
