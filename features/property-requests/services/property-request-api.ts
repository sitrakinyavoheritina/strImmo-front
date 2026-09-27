import { apiClient } from '@/lib/api/client';
import type {
  CreatePropertyRequestPayload,
  PropertyRequest,
  PropertyRequestReportReason,
  PublicPropertyRequestFilters,
} from '../types/property-request.types';

// Voir strImmo/src/property-requests/property-requests.controller.ts.
export const propertyRequestApi = {
  create: (payload: CreatePropertyRequestPayload) =>
    apiClient.post<PropertyRequest>('/property-requests', payload).then((r) => r.data),

  listMine: () => apiClient.get<PropertyRequest[]>('/property-requests/mine').then((r) => r.data),

  listPublic: (filters: PublicPropertyRequestFilters) =>
    apiClient.get<PropertyRequest[]>('/property-requests/public', { params: filters }).then((r) => r.data),

  updateVisibility: (id: string, isPublic: boolean) =>
    apiClient.patch<PropertyRequest>(`/property-requests/${id}/visibility`, { isPublic }).then((r) => r.data),

  remove: (id: string) => apiClient.delete<void>(`/property-requests/${id}`).then(() => undefined),

  like: (id: string) => apiClient.post<{ likesCount: number }>(`/property-requests/${id}/like`).then((r) => r.data),

  unlike: (id: string) => apiClient.post<{ likesCount: number }>(`/property-requests/${id}/unlike`).then((r) => r.data),

  report: (id: string, reason: PropertyRequestReportReason) =>
    apiClient.post<{ reported: true }>(`/property-requests/${id}/report`, { reason }).then((r) => r.data),
};
