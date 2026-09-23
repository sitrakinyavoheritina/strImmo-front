'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SlidersHorizontal, Search, MapPin } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useHomeSearchFiltersStore } from '@/lib/state/use-home-search-filters-store';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/form-controls';
import { FilterModal } from './filter-modal';
import { PUBLISHER_TYPES } from './filter-fields';
import { filtersToSearchParams } from '../utils/filters-query';
import { hasActiveAdvancedFilters } from '../utils/has-active-advanced-filters';

// Location/vente et type de bien vivent sur la ligne des onglets (voir search-section.tsx) ;
// ici : prix min/max, publié par, puis localisation — tous partagés avec la sidebar "Filtres
// avancés" via useHomeSearchFiltersStore (même formulaire, pas de doublon).
export function QuickSearchForm() {
  const { t } = useTranslation();
  const router = useRouter();
  const filters = useHomeSearchFiltersStore((state) => state.filters);
  const update = useHomeSearchFiltersStore((state) => state.update);
  const setFilters = useHomeSearchFiltersStore((state) => state.setFilters);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  function goToResults() {
    router.push(`/recherche?${filtersToSearchParams(filters).toString()}`);
  }

  return (
    <>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          goToResults();
        }}
        className="space-y-2"
      >
        {/* `gap-5` entre groupes (prix / publié par), `gap-1.5` à l'intérieur d'un même groupe —
            même principe que la rangée du dessus (voir search-section.tsx). */}
        <div className="flex flex-wrap items-center gap-5">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[0.85rem] font-semibold text-content-muted shrink-0">{t.search.priceLabel} :</span>
            <input
              type="number"
              min={0}
              value={filters.minPrice ?? ''}
              onChange={(event) => update('minPrice', event.target.value ? Number(event.target.value) : undefined)}
              placeholder={t.search.minPrice}
              className="w-32 shrink-0 rounded-xl border border-stroke-default px-3 py-2 text-sm outline-none focus:border-brand-primary"
            />
            <input
              type="number"
              min={0}
              value={filters.maxPrice ?? ''}
              onChange={(event) => update('maxPrice', event.target.value ? Number(event.target.value) : undefined)}
              placeholder={t.search.maxPrice}
              className="w-32 shrink-0 rounded-xl border border-stroke-default px-3 py-2 text-sm outline-none focus:border-brand-primary"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[0.85rem] font-semibold text-content-muted shrink-0">{t.search.publisherType} :</span>
            <Chip active={!filters.publisherType} onClick={() => update('publisherType', undefined)}>
              {t.search.allPublishers}
            </Chip>
            {PUBLISHER_TYPES.map(({ value, labelKey }) => (
              <Chip
                key={value}
                active={filters.publisherType === value}
                onClick={() => update('publisherType', filters.publisherType === value ? undefined : value)}
              >
                {t.search[labelKey]}
              </Chip>
            ))}
          </div>
        </div>

        <hr className="border-stroke-default" />

        {/* Label sur la même ligne que l'input (pas au-dessus) : économise une ligne de hauteur. */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[0.85rem] font-semibold text-content-muted shrink-0">{t.search.neighborhood} :</span>

          <div className="relative flex-1 min-w-[180px]">
            <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-content-muted" />
            <input
              value={filters.location ?? ''}
              onChange={(event) => update('location', event.target.value || undefined)}
              placeholder={t.search.neighborhoodPlaceholder}
              className="w-full rounded-xl border border-stroke-default pl-10 pr-3.5 py-2 text-sm outline-none focus:border-brand-primary"
            />
          </div>

          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsFilterModalOpen(true)}
              aria-label={t.search.advancedFilters}
              className="relative shrink-0 flex items-center justify-center w-9 h-9 rounded-xl border border-stroke-default text-content-muted hover:border-brand-primary hover:text-brand-primary transition"
            >
              <SlidersHorizontal size={16} />
              {hasActiveAdvancedFilters(filters) && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-brand-secondary" />
              )}
            </button>

            <Button type="submit" size="sm" aria-label={t.search.apply} className="whitespace-nowrap">
              <Search size={16} />
              {t.search.apply}
            </Button>
          </div>
        </div>
      </form>

      {isFilterModalOpen && (
        <FilterModal
          onClose={() => setIsFilterModalOpen(false)}
          filters={filters}
          onApply={(next) => {
            setFilters(next);
            router.push(`/recherche?${filtersToSearchParams(next).toString()}`);
          }}
        />
      )}
    </>
  );
}
