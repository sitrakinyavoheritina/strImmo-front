import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../services/admin-api';

export function useAdminUserMessagingStats(userId: string | undefined) {
  return useQuery({
    queryKey: ['admin-user-messaging-stats', userId],
    queryFn: () => adminApi.getUserMessagingStats(userId as string),
    enabled: !!userId,
  });
}
