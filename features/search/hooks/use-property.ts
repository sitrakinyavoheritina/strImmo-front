import { useQuery } from '@tanstack/react-query';
import { listingService } from '../services/listing-service';

export function useProperty(id: string | undefined) {
  return useQuery({
    queryKey: ['property', id],
    queryFn: () => listingService.getById(id as string),
    enabled: !!id,
  });
}
