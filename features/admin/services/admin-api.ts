import { apiClient } from '@/lib/api/client';
import type { AdminUser } from '../types';

export const adminApi = {
  // Réservé admin/superadmin — voir strImmo/src/auth/auth.controller.ts:listUsers (403 sinon).
  listUsers: () => apiClient.get<AdminUser[]>('/auth/users').then((r) => r.data),
};
