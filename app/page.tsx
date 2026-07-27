'use client';

import { useEffect, useRef } from 'react';
import { FeaturedStories } from '@/features/feed/components/featured-stories';
import { FeedList } from '@/features/feed/components/feed-list';
import { RightRail } from '@/features/feed/components/right-rail';
import { SearchSection } from '@/features/search/components/search-section';
import { useInfiniteProperties } from '@/features/search/hooks/use-infinite-properties';
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
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteProperties({ ...debouncedFilters, sortBy: 'recent' });
  const properties = data?.pages.flat();
  // Cartes par défaut, liste compacte en option (voir /parametres) — demandé explicitement après
  // l'essai de la liste : l'ancien affichage reste le standard, pas remplacé d'office.
  const { preference: feedDisplay } = useFeedDisplayPreference();

  // Scroll infini façon Facebook/Instagram (demandé explicitement, pour ne jamais avoir à cliquer
  // "page suivante") : une sentinelle invisible tout en bas du fil déclenche le chargement de la
  // page suivante dès qu'elle devient visible — même mécanisme (IntersectionObserver sur une
  // sentinelle) que le repli mobile de SearchSection, voir son commentaire pour le détail. `rootMargin`
  // positif : la page suivante commence à charger un peu avant que la sentinelle n'atteigne
  // réellement le bas de l'écran, pour qu'elle soit prête avant que l'utilisateur n'arrive au bout.
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage();
      },
      { rootMargin: '600px 0px 0px 0px', threshold: 0 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return (
    <div className="flex px-3 sm:px-6 lg:px-0">
      <div className="flex-1 min-w-0 pt-0 sm:pt-2 pb-4 sm:pb-6 space-y-3">
        <SearchSection />
        {properties && properties.length > 0 && <FeaturedStories properties={properties.slice(0, 12)} />}
        <div>
          {isLoading ? (
            <p className="text-sm text-content-muted">{t.search.searching}</p>
          ) : properties && properties.length > 0 ? (
            <>
              <FeedList properties={properties} variant={feedDisplay} />
              <div ref={sentinelRef} className="h-px" />
              {isFetchingNextPage && (
                <p className="text-sm text-content-muted text-center py-3">{t.search.searching}</p>
              )}
            </>
          ) : (
            <p className="text-sm text-content-muted">{t.search.noResults}</p>
          )}
        </div>
      </div>
      <RightRail />
    </div>
  );
}
