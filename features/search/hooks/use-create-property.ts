import { useMutation, useQueryClient } from '@tanstack/react-query';
import { listingService } from '../services/listing-service';
import type { PropertyFormValues } from '../types/listing.types';

export function useCreateProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ values, photos }: { values: PropertyFormValues; photos: File[] }) =>
      listingService.create(values, photos),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['properties'] }),
  });
}
