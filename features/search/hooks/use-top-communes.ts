import { useQuery } from '@tanstack/react-query';
import { propertyApi } from '../services/property-api';

// Widget "communes les plus recherchées" (RightRail) — donnée qui change lentement (nombre
// d'annonces par commune), `staleTime` assez long pour ne pas la re-demander à chaque montage.
export function useTopCommunes(limit = 6) {
  return useQuery({
    queryKey: ['top-communes', limit],
    queryFn: () => propertyApi.topCommunes(limit),
    staleTime: 10 * 60 * 1000,
  });
}
