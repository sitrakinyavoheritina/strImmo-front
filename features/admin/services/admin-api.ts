import { apiClient } from '@/lib/api/client';
import type { AdminUser, AdminUserDetail, ErrorLogsParams, ErrorLogsResponse } from '../types';

export const adminApi = {
  // Réservé admin/superadmin — voir strImmo/src/auth/auth.controller.ts:listUsers (403 sinon).
  listUsers: () => apiClient.get<AdminUser[]>('/auth/users').then((r) => r.data),

  // Suppression définitive — le backend refuse son propre compte et tout compte admin (403).
  // Fiche d'un compte en lecture seule — voir strImmo/src/auth/auth.controller.ts:getUserDetail.
  getUser: (id: string) => apiClient.get<AdminUserDetail>(`/auth/users/${id}`).then((r) => r.data),

  // Journal d'erreurs (admin/superadmin) — voir strImmo/src/error-logs/error-logs.controller.ts.
  listErrorLogs: (params: ErrorLogsParams) =>
    apiClient.get<ErrorLogsResponse>('/error-logs', { params }).then((r) => r.data),

  deleteUser: (id: string) => apiClient.delete<{ deleted: boolean }>(`/auth/users/${id}`).then((r) => r.data),
};
