import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../services/admin-api';

export function useAdminMessagingStats(enabled: boolean) {
  return useQuery({
    queryKey: ['admin-messaging-stats'],
    queryFn: () => adminApi.getMessagingStats(),
    enabled,
  });
}
