import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../services/admin-api';

export function useBroadcastRecipientsCount(channel: 'sms' | 'email', enabled: boolean) {
  return useQuery({
    queryKey: ['broadcast-recipients-count', channel],
    queryFn: () => adminApi.getBroadcastRecipientsCount(channel),
    enabled,
  });
}
