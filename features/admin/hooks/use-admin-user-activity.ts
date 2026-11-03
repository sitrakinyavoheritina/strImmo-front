import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../services/admin-api';

export function useAdminUserActivity(userId: string | undefined, page: number) {
  return useQuery({
    queryKey: ['admin-user-activity', userId, page],
    queryFn: () => adminApi.getUserActivity(userId as string, page),
    enabled: !!userId,
  });
}
