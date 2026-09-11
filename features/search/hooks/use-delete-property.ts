import { useMutation, useQueryClient } from '@tanstack/react-query';
import { listingService } from '../services/listing-service';

export function useDeleteProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => listingService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['properties'] }),
  });
}
