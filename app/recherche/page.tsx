'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useHomeSearchFiltersStore } from '@/lib/state/use-home-search-filters-store';
import { useAiSearchResultsStore } from '@/lib/state/use-ai-search-results-store';
import { useProperties } from '@/features/search/hooks/use-properties';
import { useDebouncedSearchFilters } from '@/features/search/hooks/use-debounced-search-filters';
import { SearchSection } from '@/features/search/components/search-section';
import { FeedList } from '@/features/feed/components/feed-list';
import { RightRail } from '@/features/feed/components/right-rail';
import { filtersToSearchParams, searchParamsToFilters } from '@/features/search/utils/filters-query';

// Même interface que l'accueil (même SearchSection sticky, mêmes cartes FeedList) — seule la
// bande "story" (FeaturedStories) est masquée ici, et le bloc de recherche affiche en plus le
// résumé des filtres actifs en bas (voir SearchSection) — demandé explicitement pour ne pas avoir
// une page de résultats qui ressemble à une interface différente.
function SearchResultsContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const filters = useHomeSearchFiltersStore((state) => state.filters);
  const setFilters = useHomeSearchFiltersStore((state) => state.setFilters);

  // Arrivée depuis "Voir les résultats de recherche" du panneau IA (voir ai-search-panel.tsx) :
  // l'assistant ne renvoie que des annonces déjà résolues, jamais de filtres réutilisables dans
  // l'URL — la liste vient donc du store déposé juste avant la navigation, pas d'une requête par
  // filtres. Les deux effets de synchronisation URL↔filtres sont sans objet dans ce cas (ignorés
  // ci-dessous) : une recherche classique lancée depuis la barre (bouton "Rechercher") navigue de
  // toute façon elle-même vers une URL sans `source=ai`, ce qui fait naturellement sortir de ce mode.
  const isAiResultsMode = searchParams.get('source') === 'ai';
  const aiResults = useAiSearchResultsStore((state) => state.results);

  // L'URL reste la source de vérité pour un lien direct/partagé/rechargé — synchronisée dans le
  // store partagé à l'arrivée (et à chaque changement d'URL externe) pour que SearchSection
  // affiche bien les filtres réellement actifs, même si on n'est pas passé par sa propre barre.
  const searchParamsKey = searchParams.toString();
  useEffect(() => {
    if (isAiResultsMode) return;
    setFilters(searchParamsToFilters(searchParams));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParamsKey, isAiResultsMode]);

  // Et dans l'autre sens : toute modification faite depuis la barre (nouveau type, prix...) doit
  // se refléter dans l'URL pour rester partageable/rechargeable — `replace` (pas `push`) pour ne
  // pas empiler une entrée d'historique à chaque frappe.
  useEffect(() => {
    if (isAiResultsMode) return;
    router.replace(`/recherche?${filtersToSearchParams(filters).toString()}`, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, isAiResultsMode]);

  // Le texte libre (lieu) est retardé/filtré (voir use-debounced-search-filters.ts) : sans ça,
  // chaque lettre tapée dans la barre déclencherait sa propre requête réseau.
  const debouncedFilters = useDebouncedSearchFilters(filters);
  const { data: fetchedProperties, isLoading } = useProperties(debouncedFilters, { enabled: !isAiResultsMode });
  const properties = isAiResultsMode ? (aiResults ?? []) : fetchedProperties;

  return (
    <div className="flex px-3 sm:px-6 lg:px-0">
      <div className="flex-1 min-w-0 pt-0 sm:pt-2 pb-4 sm:pb-6 space-y-3">
        <SearchSection />
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-brand-secondary-text mb-4">
            {t.search.results} {properties ? `(${properties.length})` : ''}
          </h1>
          {!isAiResultsMode && isLoading ? (
            <p className="text-sm text-content-muted">{t.search.searching}</p>
          ) : properties && properties.length > 0 ? (
            <FeedList properties={properties} />
          ) : (
            <p className="text-sm text-content-muted py-12 text-center">{t.search.noResults}</p>
          )}
        </div>
      </div>
      <RightRail />
    </div>
  );
}

export default function SearchResultsPage() {
  return (
    <Suspense fallback={null}>
      <SearchResultsContent />
    </Suspense>
  );
}
