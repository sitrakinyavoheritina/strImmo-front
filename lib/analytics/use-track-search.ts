'use client';

import { useEffect, useRef } from 'react';
import { useDebouncedSearchFilters } from '@/features/search/hooks/use-debounced-search-filters';
import type { PropertyFilters } from '@/features/search/types/listing.types';
import { trackEvent } from './track';

const IGNORED_KEYS = new Set(['limit', 'offset', 'sortBy', 'location', 'query']);

/** Observe les filtres (déjà retardés/nettoyés comme pour la vraie requête) et envoie : `search`
 * quand le texte de lieu change, `filter_property` pour chaque autre critère modifié. La première
 * valeur (chargement de la page) n'est jamais envoyée — seulement les vraies actions. */
export function useTrackSearch(filters: PropertyFilters) {
  const debounced = useDebouncedSearchFilters(filters);
  const previous = useRef<PropertyFilters | null>(null);

  useEffect(() => {
    const before = previous.current;
    previous.current = debounced;
    if (!before) return;

    if (debounced.location && debounced.location !== before.location) {
      trackEvent('search', { search_term: debounced.location });
    }
    const keys = new Set([...Object.keys(before), ...Object.keys(debounced)]);
    keys.forEach((key) => {
      if (IGNORED_KEYS.has(key)) return;
      const value = (debounced as Record<string, unknown>)[key];
      if (value === (before as Record<string, unknown>)[key]) return;
      trackEvent('filter_property', {
        filter_name: key,
        filter_value: value === undefined ? 'cleared' : (typeof value === 'object' ? undefined : (value as string | number | boolean)),
      });
    });
  }, [debounced]);
}
