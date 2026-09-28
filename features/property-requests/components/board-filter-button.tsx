'use client';

import { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';
import { Chip, FieldLabel } from '@/components/ui/form-controls';
import { PROPERTY_TYPES } from '@/features/search/components/filter-fields';
import type { PublicPropertyRequestFilters } from '../types/property-request.types';

type Props = {
  filters: PublicPropertyRequestFilters;
  onChange: (filters: PublicPropertyRequestFilters) => void;
};

/** Bouton "Filtrer" + petit panneau déroulant (transaction, type de bien) pour le tableau public
 *  de /demandes — remplace l'ancienne rangée de boutons toujours affichée (Louer/Acheter/Tous
 *  types/Maison/Appartement/Villa/Terrain), qui se retrouvait cramée à la largeur d'un téléphone.
 *  Un seul bouton compact par défaut, la page ne se charge de boutons que si on veut filtrer.
 *  Même mécanique d'ouverture/fermeture qu'un menu d'options (voir PropertyRequestOptionsMenu,
 *  CardOptionsMenu) : overlay invisible pour fermer au clic en dehors. */
export function BoardFilterButton({ filters, onChange }: Props) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const hasActiveFilter = !!filters.kind || !!filters.propertyType;

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[0.85rem] font-semibold border transition ${
          hasActiveFilter
            ? 'border-brand-primary text-brand-primary bg-brand-primary-soft'
            : 'border-stroke-default text-content-muted hover:border-brand-primary'
        }`}
      >
        <SlidersHorizontal size={16} />
        {t.propertyRequestsPage.filterButton}
        {hasActiveFilter && <span className="w-1.5 h-1.5 rounded-full bg-brand-secondary" />}
      </button>

      {isOpen && (
        <>
          <button type="button" aria-label="Fermer" onClick={() => setIsOpen(false)} className="fixed inset-0 z-40 cursor-default" />
          <div className="absolute right-0 top-full mt-1.5 z-50 w-72 bg-surface-card border border-stroke-default rounded-xl shadow-lg p-3.5 space-y-3.5">
            <div>
              <FieldLabel>{t.propertyRequestsPage.kindLabel}</FieldLabel>
              <div className="flex rounded-xl border border-stroke-default overflow-hidden w-fit">
                <button
                  type="button"
                  onClick={() => onChange({ ...filters, kind: filters.kind === 'rent' ? undefined : 'rent' })}
                  className={`px-3.5 py-1.5 text-[0.85rem] font-semibold transition ${
                    filters.kind === 'rent' ? 'bg-brand-primary text-white' : 'text-content-muted hover:bg-surface-app'
                  }`}
                >
                  {t.search.rent}
                </button>
                <button
                  type="button"
                  onClick={() => onChange({ ...filters, kind: filters.kind === 'sale' ? undefined : 'sale' })}
                  className={`px-3.5 py-1.5 text-[0.85rem] font-semibold transition border-l border-stroke-default ${
                    filters.kind === 'sale' ? 'bg-brand-primary text-white' : 'text-content-muted hover:bg-surface-app'
                  }`}
                >
                  {t.search.buy}
                </button>
              </div>
            </div>

            <div>
              <FieldLabel>{t.propertyRequestsPage.propertyTypeLabel}</FieldLabel>
              <div className="flex flex-wrap gap-1.5">
                <Chip active={!filters.propertyType} onClick={() => onChange({ ...filters, propertyType: undefined })}>
                  {t.search.allTypes}
                </Chip>
                {PROPERTY_TYPES.map(({ value, labelKey }) => (
                  <Chip
                    key={value}
                    active={filters.propertyType === value}
                    onClick={() => onChange({ ...filters, propertyType: filters.propertyType === value ? undefined : value })}
                  >
                    {t.search[labelKey]}
                  </Chip>
                ))}
              </div>
            </div>

            {hasActiveFilter && (
              <button type="button" onClick={() => onChange({})} className="text-[0.85rem] font-semibold text-danger hover:underline">
                {t.search.reset}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
