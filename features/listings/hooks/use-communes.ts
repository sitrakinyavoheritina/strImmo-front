import { useQuery } from '@tanstack/react-query';
import { locationApi } from '../services/location-api';

// ~1500 communes, chargées une fois et filtrées côté client (voir SearchableSelect dans
// property-form.tsx) — donnée quasi statique (référentiel géographique), `staleTime` long pour
// éviter de la re-demander à chaque montage du formulaire.
export function useCommunes() {
  return useQuery({
    queryKey: ['communes'],
    queryFn: () => locationApi.listCommunes(),
    staleTime: 24 * 60 * 60 * 1000,
  });
}
