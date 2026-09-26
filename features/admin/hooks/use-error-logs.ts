import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { adminApi } from '../services/admin-api';
import type { ErrorLogsParams } from '../types';

// `enabled` à passer par l'appelant (le backend renvoie 403 hors admin/superadmin). Les données
// précédentes restent affichées pendant un changement de filtre/de recherche (pas de clignotement).
export function useErrorLogs(params: ErrorLogsParams, enabled: boolean) {
  return useQuery({
    queryKey: ['admin-error-logs', params],
    queryFn: () => adminApi.listErrorLogs(params),
    enabled,
    placeholderData: keepPreviousData,
  });
}
