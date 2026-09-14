import { useQuery } from '@tanstack/react-query';
import { listingService } from '../services/listing-service';

// Réservé admin/superadmin (voir app/admin/statistiques) — le backend renvoie 403 sinon, d'où
// `enabled` à passer explicitement par l'appelant plutôt que de partir d'une valeur par défaut.
export function usePropertyStats(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['property-stats'],
    queryFn: () => listingService.getStats(),
    enabled: options?.enabled,
  });
}
