'use client';

import { useMemo, useState } from 'react';
import { MapPin } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';
import { PROPERTY_TYPE_LABEL_KEY, titleRepeatsTypeLabel } from '@/features/search/utils/get-key-features';
import { getPropertyDetailStats } from '@/features/search/utils/get-property-detail-stats';
import { formatPrice, getPriceSuffix } from '@/features/search/utils/format-price';
import { PropertyFees } from './property-fees';
import type { PropertyFormValues } from '@/features/search/types/listing.types';

/** Aperçu fidèle de l'annonce telle qu'elle apparaîtra une fois publiée, avant validation finale —
 * reprend la même structure que la fiche détail publiée (app/annonce/[id]/page.tsx : galerie
 * photo complète avec vignettes, caractéristiques, équipements, description) plutôt qu'une
 * version simplifiée n'affichant que la couverture (constaté explicitement : les autres photos
 * n'apparaissaient pas dans l'aperçu). */
export function ListingPreview({ values, photos }: { values: PropertyFormValues; photos: File[] }) {
  const { t } = useTranslation();
  const [activePhoto, setActivePhoto] = useState(0);
  // Pas de révocation via useEffect ici : en Strict Mode (dev), React monte/démonte/remonte les
  // effets une fois par exercice, ce qui révoquerait ces URL blob avant que l'aperçu n'ait fini de
  // les afficher. Au plus 8 petites photos déjà compressées le temps de ce formulaire — le
  // navigateur les libère de toute façon au déchargement de la page.
  // En mode édition, aucune nouvelle photo n'est sélectionnée (`photos` reste vide, les photos
  // n'étant pas modifiables) — on retombe alors sur les URL distantes déjà publiées.
  const photoUrls = useMemo(
    () => (photos.length > 0 ? photos.map((file) => URL.createObjectURL(file)) : values.photoUrls),
    [photos, values.photoUrls]
  );
  const { stats, amenities } = getPropertyDetailStats(values, t);

  return (
    <div className="space-y-3">
      <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] rounded-xl sm:rounded-2xl overflow-hidden bg-stroke-default">
        {photoUrls[activePhoto] && (
          // eslint-disable-next-line @next/next/no-img-element -- aperçu local (blob:), pas une image distante à optimiser
          <img src={photoUrls[activePhoto]} alt="" className="w-full h-full object-cover" />
        )}
        <span
          className={`absolute top-2 left-2 sm:top-3 sm:left-3 text-white text-[10px] sm:text-[0.85rem] font-bold px-2 py-1 rounded-md uppercase ${
            values.kind === 'rent' ? 'bg-brand-primary' : 'bg-brand-secondary'
          }`}
        >
          {values.kind === 'rent' ? t.property.forRent : t.property.forSale}
        </span>
      </div>

      {photoUrls.length > 1 && (
        <div className="flex gap-2 overflow-x-auto scroll-touch">
          {photoUrls.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => setActivePhoto(i)}
              aria-label={t.propertyDetail.viewPhoto}
              className={`relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-lg overflow-hidden border-2 transition ${
                activePhoto === i ? 'border-brand-primary' : 'border-transparent'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- aperçu local (blob:), pas une image distante à optimiser */}
              <img src={src} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <div className="space-y-1">
        {/* Masqué quand le titre commence déjà par ce même mot (ex. "Terrain avec...") — même
            règle que la fiche détail publiée, voir titleRepeatsTypeLabel. */}
        {!titleRepeatsTypeLabel(values.title || '', t.search[PROPERTY_TYPE_LABEL_KEY[values.propertyType]]) && (
          <p className="text-brand-primary text-[0.85rem] font-bold uppercase">{t.search[PROPERTY_TYPE_LABEL_KEY[values.propertyType]]}</p>
        )}
        <h2 className="text-xl font-bold text-content-main">{values.title || t.listing.formTitlePlaceholder}</h2>
        <p className="flex items-center gap-1 text-sm text-content-muted">
          <MapPin size={13} className="text-brand-primary" />
          {values.location || '—'}
        </p>
        <p className="text-2xl font-bold text-brand-secondary-text mt-1">
          {formatPrice(values.price)}
          {getPriceSuffix(values) && <span className="text-sm font-normal">{getPriceSuffix(values)}</span>}
        </p>

        {/* Même bloc que la fiche détail publiée (voir app/annonce/[id]/page.tsx) — ce qui est
            annoncé ici doit correspondre à ce qui sera réellement visible une fois publié. */}
        <PropertyFees values={values} t={t} className="mt-1" />
      </div>

      {stats.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-content-main mb-1">{t.propertyDetail.detailsTitle}</h3>
          {/* Même mise en page compacte (3 colonnes, icône/valeur/libellé sur une seule ligne) que
              la fiche détail publiée, voir app/annonce/[id]/page.tsx. */}
          <div className="grid grid-cols-3 gap-1">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex items-center justify-center gap-1 bg-surface-app border border-stroke-default rounded-md py-1 px-1"
              >
                <stat.icon size={12} className="shrink-0 text-brand-primary" />
                <span className="text-[0.85rem] font-bold text-content-main whitespace-nowrap">{stat.value}</span>
                <span className="text-[0.85rem] text-content-muted truncate">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {amenities.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {amenities.map((amenity) => (
            <span
              key={amenity.text}
              className="inline-flex items-center gap-1.5 text-[0.85rem] font-medium px-2.5 py-1 rounded-lg border bg-brand-primary/10 text-brand-primary border-brand-primary/20"
            >
              <amenity.icon size={13} />
              {amenity.text}
            </span>
          ))}
        </div>
      )}

      {values.description && (
        <div>
          <h3 className="text-sm font-bold text-content-main mb-1.5">{t.propertyDetail.descriptionTitle}</h3>
          <p className="text-sm text-content-main leading-relaxed">{values.description}</p>
        </div>
      )}
    </div>
  );
}
