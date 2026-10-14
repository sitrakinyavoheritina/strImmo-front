import { apiClient } from '@/lib/api/client';
import type {
  AdminPropertyRequestRow,
  CreatePropertyRequestPayload,
  PropertyRequest,
  PropertyRequestReportReason,
  PublicPropertyRequestFilters,
  UpdatePropertyRequestPayload,
} from '../types/property-request.types';

// Voir strImmo/src/property-requests/property-requests.controller.ts.
export const propertyRequestApi = {
  create: (payload: CreatePropertyRequestPayload) =>
    apiClient.post<PropertyRequest>('/property-requests', payload).then((r) => r.data),

  listMine: () => apiClient.get<PropertyRequest[]>('/property-requests/mine').then((r) => r.data),

  // Réservé à l'auteur (403 sinon, voir le contrôleur) — sert uniquement à préremplir le
  // formulaire de modification (app/demandes/[id]/modifier), jamais à afficher une demande à un
  // tiers.
  getOne: (id: string) => apiClient.get<PropertyRequest>(`/property-requests/${id}`).then((r) => r.data),

  update: (id: string, payload: UpdatePropertyRequestPayload) =>
    apiClient.patch<PropertyRequest>(`/property-requests/${id}`, payload).then((r) => r.data),

  listPublic: (filters: PublicPropertyRequestFilters) =>
    apiClient.get<PropertyRequest[]>('/property-requests/public', { params: filters }).then((r) => r.data),

  updateVisibility: (id: string, isPublic: boolean) =>
    apiClient.patch<PropertyRequest>(`/property-requests/${id}/visibility`, { isPublic }).then((r) => r.data),

  remove: (id: string) => apiClient.delete<void>(`/property-requests/${id}`).then(() => undefined),

  like: (id: string) => apiClient.post<{ likesCount: number }>(`/property-requests/${id}/like`).then((r) => r.data),

  unlike: (id: string) => apiClient.post<{ likesCount: number }>(`/property-requests/${id}/unlike`).then((r) => r.data),

  report: (id: string, reason: PropertyRequestReportReason) =>
    apiClient.post<{ reported: true }>(`/property-requests/${id}/report`, { reason }).then((r) => r.data),

  listForAdmin: () => apiClient.get<AdminPropertyRequestRow[]>('/property-requests/admin/all').then((r) => r.data),

  listDeletedForAdmin: () =>
    apiClient.get<AdminPropertyRequestRow[]>('/property-requests/admin/deleted').then((r) => r.data),

  removeAsAdmin: (id: string) => apiClient.delete<void>(`/property-requests/admin/${id}`).then(() => undefined),
};
