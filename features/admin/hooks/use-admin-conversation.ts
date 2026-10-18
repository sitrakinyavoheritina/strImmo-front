import { useQuery } from '@tanstack/react-query';
import { toMessage } from '@/features/messages/services/message-service';
import { adminApi } from '../services/admin-api';

export function useAdminConversation(id: string | undefined) {
  return useQuery({
    queryKey: ['admin-conversation', id],
    queryFn: async () => {
      const data = await adminApi.getConversation(id as string);
      return { ...data, messages: data.messages.map(toMessage) };
    },
    enabled: !!id,
  });
}
