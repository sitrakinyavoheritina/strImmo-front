import { propertyApi } from './property-api';
import { buildCreatePropertyFormData, mapApiPropertyToProperty } from './property-mapper';
import type { PropertyFilters, PropertyFormValues } from '../types/listing.types';

export const listingService = {
  list: (filters?: PropertyFilters) =>
    propertyApi.list(filters).then((list) => list.map(mapApiPropertyToProperty)),

  getById: (id: string) => propertyApi.getById(id).then(mapApiPropertyToProperty),

  create: (values: PropertyFormValues, photos: File[]) =>
    propertyApi.create(buildCreatePropertyFormData(values, photos)).then(mapApiPropertyToProperty),

  remove: (id: string) => propertyApi.remove(id),

  approve: (id: string) => propertyApi.approve(id).then(mapApiPropertyToProperty),

  reject: (id: string, reason: string) => propertyApi.reject(id, reason).then(mapApiPropertyToProperty),

  getStats: () => propertyApi.getStats(),
};
