import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../services/admin-api';

export function useAdminActivityUsers(page: number, enabled: boolean) {
  return useQuery({
    queryKey: ['admin-activity-users', page],
    queryFn: () => adminApi.getActivityUsers(page),
    enabled,
  });
}
