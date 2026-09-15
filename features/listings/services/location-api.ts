import { apiClient } from '@/lib/api/client';

export type ApiCommune = { id: string; name: string; district?: string; region?: string; province?: string };
export type ApiFokontany = { id: string; name: string; communeId: string };

export const locationApi = {
  listCommunes: () => apiClient.get<ApiCommune[]>('/communes').then((r) => r.data),

  listFokontanyByCommune: (communeId: string) =>
    apiClient.get<ApiFokontany[]>('/fokontany', { params: { communeId } }).then((r) => r.data),
};
