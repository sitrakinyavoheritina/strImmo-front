import { useInfiniteQuery } from '@tanstack/react-query';
import { listingService } from '../services/listing-service';
import type { Property, PropertyFilters } from '../types/listing.types';

const PAGE_SIZE = 12;

// Scroll infini du fil d'accueil (voir app/page.tsx) — page suivante = `pageParam` (offset),
// déterminée en cumulant PAGE_SIZE au fil des pages déjà reçues plutôt que par un curseur/total
// renvoyé par le backend, qui n'en a pas besoin pour ça (voir properties.service.ts:findAll) :
// une page renvoyant moins de PAGE_SIZE éléments signale la dernière page. Ne PAS réutiliser pour
// Mes Biens/Favoris/la modération admin, des listes déjà bornées à un utilisateur qui n'ont pas
// besoin de pagination — laissées sur `useProperties` (voir ce hook).
export function useInfiniteProperties(
  filters: Omit<PropertyFilters, 'limit' | 'offset'>,
  // Première page déjà chargée côté serveur (rendu SEO de l'accueil) — à ne passer que pour les
  // filtres par défaut : `initialData` s'applique à toute nouvelle clé de requête.
  initialPage?: Property[]
) {
  return useInfiniteQuery({
    initialData: initialPage ? { pages: [initialPage], pageParams: [0] } : undefined,
    initialDataUpdatedAt: initialPage ? 0 : undefined,
    queryKey: ['properties', 'infinite', filters],
    queryFn: ({ pageParam }) => listingService.list({ ...filters, limit: PAGE_SIZE, offset: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length < PAGE_SIZE ? undefined : allPages.length * PAGE_SIZE,
  });
}
