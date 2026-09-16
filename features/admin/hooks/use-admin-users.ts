import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../services/admin-api';

// Même garde que usePropertyStats : le backend renvoie 403 hors admin/superadmin, `enabled` à
// passer explicitement par l'appelant plutôt que de partir d'une valeur par défaut.
export function useAdminUsers(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminApi.listUsers(),
    enabled: options?.enabled,
  });
}
