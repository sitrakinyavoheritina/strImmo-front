'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useHomeSearchFiltersStore } from '@/lib/state/use-home-search-filters-store';
import { Button } from '@/components/ui/button';
import { FilterFields } from '@/features/search/components/filter-fields';
import { filtersToSearchParams } from '@/features/search/utils/filters-query';
import { hasActiveAdvancedFilters } from '@/features/search/utils/has-active-advanced-filters';

/** Filtres avancés affichés directement (pas dans un modal) en bas de la sidebar gauche, sur
 * l'accueil uniquement (voir sidebar.tsx). Partage son état avec la barre de recherche de
 * l'accueil (`useHomeSearchFiltersStore`) : location/vente, type de bien, prix et publié par sont
 * déjà réglables directement sur cette barre, donc pas répétés ici (`mode="compact"`) — ne reste
 * que le nombre de chambres min et les critères spécifiques au type de bien choisi là-haut. */
export function SidebarAdvancedFilters() {
  const { t } = useTranslation();
  const router = useRouter();
  const filters = useHomeSearchFiltersStore((state) => state.filters);
  const update = useHomeSearchFiltersStore((state) => state.update);
  const selectPropertyType = useHomeSearchFiltersStore((state) => state.selectPropertyType);
  const reset = useHomeSearchFiltersStore((state) => state.reset);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  function handleApply() {
    router.push(`/recherche?${filtersToSearchParams(filters).toString()}`);
  }

  return (
    <div className="mt-4 pt-4 border-t border-stroke-default">
      <h3 className="flex items-center gap-1.5 px-1 mb-1 text-sm font-bold text-content-main">
        <SlidersHorizontal size={15} />
        {t.search.advancedFilters}
      </h3>

      <FilterFields
        mode="compact"
        draft={filters}
        onUpdate={update}
        onSelectPropertyType={selectPropertyType}
        onFeeToggle={(key, value) =>
          router.push(`/recherche?${filtersToSearchParams({ ...filters, [key]: value }).toString()}`)
        }
        isAdvancedOpen={isAdvancedOpen}
        onToggleAdvanced={() => setIsAdvancedOpen((v) => !v)}
      />

      <div className="flex items-center justify-between gap-2 px-1 pt-1">
        <Button type="button" variant="ghost" size="sm" onClick={reset} disabled={!hasActiveAdvancedFilters(filters) && Object.keys(filters).length === 0}>
          {t.search.reset}
        </Button>
        <Button type="button" size="sm" onClick={handleApply}>
          {t.search.apply}
        </Button>
      </div>
    </div>
  );
}
