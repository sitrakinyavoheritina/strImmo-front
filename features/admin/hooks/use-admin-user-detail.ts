import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../services/admin-api';

export function useAdminUserDetail(id: string, enabled: boolean) {
  return useQuery({
    queryKey: ['admin-user', id],
    queryFn: () => adminApi.getUser(id),
    enabled,
  });
}
