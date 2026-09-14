'use client';

import { FeaturedStories } from '@/features/feed/components/featured-stories';
import { FeedList } from '@/features/feed/components/feed-list';
import { RightRail } from '@/features/feed/components/right-rail';
import { SearchSection } from '@/features/search/components/search-section';
import { useProperties } from '@/features/search/hooks/use-properties';
import { useDebouncedSearchFilters } from '@/features/search/hooks/use-debounced-search-filters';
import { useHomeSearchFiltersStore } from '@/lib/state/use-home-search-filters-store';
import { useFeedDisplayPreference } from '@/lib/theme/use-feed-display-preference';
import { useTranslation } from '@/lib/i18n/use-translation';

export default function HomePage() {
  const { t } = useTranslation();
  // Le fil (rail de stories + liste) se filtre directement selon les puces choisies dans
  // `SearchSection` — pas de bouton "Rechercher" à cliquer, demandé explicitement. Le texte libre
  // (lieu) passe par `useDebouncedSearchFilters` : sans ça, chaque lettre tapée déclencherait sa
  // propre requête réseau.
  const filters = useHomeSearchFiltersStore((state) => state.filters);
  const debouncedFilters = useDebouncedSearchFilters(filters);
  const { data: properties, isLoading } = useProperties({ ...debouncedFilters, sortBy: 'recent' });
  // Cartes par défaut, liste compacte en option (voir /parametres) — demandé explicitement après
  // l'essai de la liste : l'ancien affichage reste le standard, pas remplacé d'office.
  const { preference: feedDisplay } = useFeedDisplayPreference();

  return (
    <div className="flex px-3 sm:px-6 lg:px-0">
      <div className="flex-1 min-w-0 pt-0 sm:pt-2 pb-4 sm:pb-6 space-y-3">
        <SearchSection />
        {properties && properties.length > 0 && <FeaturedStories properties={properties} />}
        <div>
          {isLoading ? (
            <p className="text-sm text-content-muted">{t.search.searching}</p>
          ) : properties && properties.length > 0 ? (
            <FeedList properties={properties} variant={feedDisplay} />
          ) : (
            <p className="text-sm text-content-muted">{t.search.noResults}</p>
          )}
        </div>
      </div>
      <RightRail />
    </div>
  );
}
