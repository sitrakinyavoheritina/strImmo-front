import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  buildCreatePropertyFormData,
  extractNewPhotoFiles,
  mapApiPropertyToProperty,
} from '@/features/search/services/property-mapper';
import type { ListingPhotoItem, PropertyFormValues } from '@/features/search/types/listing.types';
import { adminApi } from '../services/admin-api';

// Même construction de FormData que useCreateProperty (features/search/hooks/use-create-property.ts),
// avec `targetUserId` en plus — voir strImmo/src/properties/properties.controller.ts:createAsAdmin.
export function useCreatePropertyAsAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      values,
      photos,
      targetUserId,
    }: {
      values: PropertyFormValues;
      photos: ListingPhotoItem[];
      targetUserId: string;
    }) => {
      const formData = buildCreatePropertyFormData(values, extractNewPhotoFiles(photos));
      formData.append('targetUserId', targetUserId);
      return adminApi.createPropertyAsAdmin(formData).then(mapApiPropertyToProperty);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['properties'] }),
  });
}
