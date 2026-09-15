import { propertyApi } from './property-api';
import { buildCreatePropertyFormData, buildUpdatePropertyPayload, mapApiPropertyToProperty } from './property-mapper';
import type { PropertyFilters, PropertyFormValues } from '../types/listing.types';

export const listingService = {
  list: (filters?: PropertyFilters) =>
    propertyApi.list(filters).then((list) => list.map(mapApiPropertyToProperty)),

  getById: (id: string) => propertyApi.getById(id).then(mapApiPropertyToProperty),

  nearby: (lat: number, lng: number, limit?: number) => propertyApi.nearby(lat, lng, limit),

  create: (values: PropertyFormValues, photos: File[]) =>
    propertyApi.create(buildCreatePropertyFormData(values, photos)).then(mapApiPropertyToProperty),

  update: (id: string, values: PropertyFormValues) =>
    propertyApi.update(id, buildUpdatePropertyPayload(values)).then(mapApiPropertyToProperty),

  remove: (id: string) => propertyApi.remove(id),

  approve: (id: string) => propertyApi.approve(id).then(mapApiPropertyToProperty),

  reject: (id: string, reason: string) => propertyApi.reject(id, reason).then(mapApiPropertyToProperty),

  getStats: () => propertyApi.getStats(),
};
