import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { listingService } from '../services/listing-service';
import type { PropertyFilters } from '../types/listing.types';

export function useProperties(filters?: PropertyFilters, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['properties', filters],
    queryFn: () => listingService.list(filters),
    enabled: options?.enabled,
    // Garde les résultats précédents affichés pendant qu'une nouvelle recherche se charge, plutôt
    // que de vider la liste à chaque changement de filtre.
    placeholderData: keepPreviousData,
  });
}

// Réservé admin/superadmin (voir app/admin/annonces, onglet "Supprimées") — le backend renvoie
// 403 sinon, d'où `enabled` à passer explicitement par l'appelant plutôt que de partir d'une
// valeur par défaut (même garde que usePropertyStats).
export function useDeletedProperties(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['properties', 'deleted'],
    queryFn: () => listingService.listDeleted(),
    enabled: options?.enabled,
  });
}
