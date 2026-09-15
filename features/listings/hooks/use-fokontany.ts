import { useQuery } from '@tanstack/react-query';
import { locationApi } from '../services/location-api';

export function useFokontany(communeId: string | undefined) {
  return useQuery({
    queryKey: ['fokontany', communeId],
    queryFn: () => locationApi.listFokontanyByCommune(communeId as string),
    enabled: !!communeId,
    staleTime: 24 * 60 * 60 * 1000,
  });
}
