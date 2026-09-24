import { useMutation, useQueryClient } from '@tanstack/react-query';
import { trackEvent } from '@/lib/analytics/track';
import { listingService } from '../services/listing-service';
import type { PropertyFormValues } from '../types/listing.types';

export function useCreateProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ values, photos }: { values: PropertyFormValues; photos: File[] }) =>
      listingService.create(values, photos),
    onSuccess: (_created, { values }) => {
      trackEvent('publish_property', { property_type: values.propertyType, kind: values.kind });
      return queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });
}
