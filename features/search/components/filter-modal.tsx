'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';
import { Button } from '@/components/ui/button';
import { useProperties } from '../hooks/use-properties';
import { hasActiveAdvancedFilters } from '../utils/has-active-advanced-filters';
import { FilterFields } from './filter-fields';
import type { PropertyFilters, PropertyType } from '../types/listing.types';

export interface FilterModalProps {
  onClose: () => void;
  filters: PropertyFilters;
  onApply: (filters: PropertyFilters) => void;
}

// Monté par le parent uniquement quand ouvert (`{isOpen && <FilterModal ... />}`) : `draft`
// s'initialise donc toujours depuis les filtres actuels à chaque ouverture, sans effet de
// resynchronisation nécessaire.
export function FilterModal({ onClose, filters, onApply }: FilterModalProps) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState<PropertyFilters>(filters);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(hasActiveAdvancedFilters(filters));
  const [isCounted, setIsCounted] = useState(false);

  const { refetch, data, isFetching } = useProperties(draft, { enabled: false });

  function update<K extends keyof PropertyFilters>(key: K, value: PropertyFilters[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setIsCounted(false);
  }

  function selectPropertyType(value: PropertyType | undefined) {
    // Change de type = les champs spécifiques à l'ancien type n'ont plus de sens dans le draft.
    setDraft((prev) => ({
      kind: prev.kind,
      location: prev.location,
      minPrice: prev.minPrice,
      maxPrice: prev.maxPrice,
      publisherType: prev.publisherType,
      propertyType: value,
    }));
    setIsCounted(false);
  }

  async function handlePrimaryClick() {
    if (!isCounted) {
      await refetch();
      setIsCounted(true);
      return;
    }
    onApply(draft);
    onClose();
  }

  function handleReset() {
    setDraft({});
    onApply({});
    onClose();
  }

  return (
    // `backdrop-blur` + noir plus soutenu qu'avant : à bg-black/40 seul, le contenu de la page
    // (ex. le bouton "Rechercher" du formulaire rapide juste en dessous) restait assez lisible en
    // transparence pour donner l'impression de deux boutons identiques à l'écran en même temps.
    // Clic sur le fond = ferme le modal (attendu pour ce genre de overlay) ; `stopPropagation` sur
    // le panneau empêche qu'un clic à l'intérieur ne remonte jusqu'ici et ne referme tout.
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-surface-card rounded-2xl shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 bg-surface-card flex items-center justify-between px-4 py-3.5 border-b border-stroke-default">
          <h2 className="text-base font-bold text-content-main">{t.search.advancedFilters}</h2>
          <button type="button" onClick={onClose} aria-label="Fermer" className="text-content-muted hover:text-content-main">
            <X size={20} />
          </button>
        </div>

        <div className="px-4">
          <FilterFields
            draft={draft}
            onUpdate={update}
            onSelectPropertyType={selectPropertyType}
            onFeeToggle={(key, value) => {
              onApply({ ...draft, [key]: value });
              onClose();
            }}
            isAdvancedOpen={isAdvancedOpen}
            onToggleAdvanced={() => setIsAdvancedOpen((v) => !v)}
          />
        </div>

        <div className="sticky bottom-0 bg-surface-card flex items-center justify-between gap-3 px-4 py-3.5 border-t border-stroke-default">
          <Button type="button" variant="ghost" onClick={handleReset}>
            {t.search.reset}
          </Button>
          <Button type="button" onClick={handlePrimaryClick} disabled={isFetching}>
            {isFetching ? t.search.searching : isCounted ? `${t.search.showResults} (${data?.length ?? 0})` : t.search.apply}
          </Button>
        </div>
      </div>
    </div>
  );
}
