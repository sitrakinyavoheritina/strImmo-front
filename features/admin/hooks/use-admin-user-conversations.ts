import { useQuery } from '@tanstack/react-query';
import { toConversation } from '@/features/messages/services/message-service';
import { adminApi } from '../services/admin-api';

export function useAdminUserConversations(userId: string | undefined) {
  return useQuery({
    queryKey: ['admin-user-conversations', userId],
    queryFn: () => adminApi.getUserConversations(userId as string).then((list) => list.map(toConversation)),
    enabled: !!userId,
  });
}
