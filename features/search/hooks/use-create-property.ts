import { useMutation, useQueryClient } from '@tanstack/react-query';
import { trackEvent } from '@/lib/analytics/track';
import { listingService } from '../services/listing-service';
import { extractNewPhotoFiles } from '../services/property-mapper';
import type { ListingPhotoItem, PropertyFormValues } from '../types/listing.types';

export function useCreateProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ values, photos }: { values: PropertyFormValues; photos: ListingPhotoItem[] }) =>
      listingService.create(values, extractNewPhotoFiles(photos)),
    onSuccess: (_created, { values }) => {
      trackEvent('publish_property', { property_type: values.propertyType, kind: values.kind });
      return queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });
}
