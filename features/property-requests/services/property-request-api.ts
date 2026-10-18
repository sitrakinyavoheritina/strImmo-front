import { apiClient } from '@/lib/api/client';
import type {
  AdminPropertyRequestRow,
  CreatePropertyRequestPayload,
  PropertyRequest,
  PropertyRequestReportReason,
  PropertyRequestSummary,
  PublicPropertyRequestFilters,
  RequestViewBoostConfig,
  UpdatePropertyRequestPayload,
} from '../types/property-request.types';

// Payload de PATCH /property-requests/admin/:id/view-boost — mêmes champs que
// RequestViewBoostConfig MOINS la progression/calculs lus en retour uniquement (dayAdded,
// nightAdded, dayEffectiveTarget, nightEffectiveTarget, nextBoostAt, lastBoostAt). Voir
// UpdateViewBoostPayload (features/listings/services/view-boost-api.ts) pour l'équivalent
// annonces (qui a aussi les champs `like*`, absents ici — pas de boost des "j'aime" ici).
export type UpdateRequestViewBoostPayload = Omit<
  RequestViewBoostConfig,
  'dayAdded' | 'nightAdded' | 'dayEffectiveTarget' | 'nightEffectiveTarget' | 'nextBoostAt' | 'lastBoostAt'
>;

// Voir strImmo/src/property-requests/property-requests.controller.ts.
export const propertyRequestApi = {
  create: (payload: CreatePropertyRequestPayload) =>
    apiClient.post<PropertyRequest>('/property-requests', payload).then((r) => r.data),

  listMine: () => apiClient.get<PropertyRequest[]>('/property-requests/mine').then((r) => r.data),

  // Réservé à l'auteur (403 sinon, voir le contrôleur) — sert uniquement à préremplir le
  // formulaire de modification (app/demandes/[id]/modifier), jamais à afficher une demande à un
  // tiers.
  getOne: (id: string) => apiClient.get<PropertyRequest>(`/property-requests/${id}`).then((r) => r.data),

  // Route publique (pas d'auth requise), accessible aux deux participants d'une conversation
  // démarrée depuis une demande — même si la demande a depuis été rendue privée. Ne renvoie
  // aucune donnée sensible (pas d'userId, pas de téléphone), contrairement à `getOne` ci-dessus
  // qui reste réservé à l'auteur. Voir useRequestSummary (use-property-requests.ts) et l'encart
  // "Demande de recherche" de app/messages/[id]/page.tsx.
  getSummary: (id: string) =>
    apiClient.get<PropertyRequestSummary>(`/property-requests/${id}/summary`).then((r) => r.data),

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

  // Renvoie `void` (pas la demande mise à jour, contrairement à l'équivalent annonces) — il faut
  // invalider la query admin après succès plutôt que d'utiliser la réponse, voir
  // use-property-requests.ts.
  updateViewBoost: (id: string, payload: UpdateRequestViewBoostPayload) =>
    apiClient.patch<void>(`/property-requests/admin/${id}/view-boost`, payload).then(() => undefined),

  // Pas de `{ metric }` comme côté annonces : une seule métrique ici (les vues), aucun body.
  resetViewBoost: (id: string) =>
    apiClient.patch<void>(`/property-requests/admin/${id}/view-boost/reset`).then(() => undefined),
};
