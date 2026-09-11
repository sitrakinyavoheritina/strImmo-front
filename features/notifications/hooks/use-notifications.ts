import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/state/use-auth-store';
import { notificationApi } from '../services/notification-api';

export const notificationsQueryKey = ['notifications'] as const;

export function useNotifications() {
  return useQuery({
    queryKey: notificationsQueryKey,
    queryFn: notificationApi.list,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationApi.markAsRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: notificationsQueryKey }),
  });
}

// Dérivé de la liste déjà chargée, pas d'endpoint dédié — même principe que
// useUnreadMessagesCount (features/messages/hooks/use-messages.ts).
export function useUnreadNotificationsCount(): number {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { data } = useNotifications();
  if (!isAuthenticated) return 0;
  return data?.filter((notification) => !notification.read).length ?? 0;
}
