import { apiClient } from '@/lib/api/client';

// Voir strImmo/src/favorites/favorites.controller.ts — endpoints protégés (JwtAuthGuard), un
// favori appartient à un compte, pas à un navigateur.
export const favoriteApi = {
  listIds: () => apiClient.get<string[]>('/favorites').then((r) => r.data),
  add: (propertyId: string) => apiClient.post<void>(`/favorites/${propertyId}`).then((r) => r.data),
  remove: (propertyId: string) => apiClient.delete<void>(`/favorites/${propertyId}`).then((r) => r.data),
};
