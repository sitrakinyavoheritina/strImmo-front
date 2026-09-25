import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getPushPermission,
  isSubscribedToPush,
  subscribeToPush,
  unsubscribeFromPush,
} from '@/lib/push/push-client';

const QUERY_KEY = ['push-status'];

// État des notifications push sur CET appareil : abonné ou non, et permission du navigateur
// (`denied` = bloquées dans les réglages du navigateur, seul l'utilisateur peut les rétablir).
export function usePushNotifications() {
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => ({
      permission: getPushPermission(),
      subscribed: getPushPermission() === 'granted' ? await isSubscribedToPush() : false,
    }),
    staleTime: 0,
  });

  const enable = useMutation({
    mutationFn: subscribeToPush,
    onSettled: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
  const disable = useMutation({
    mutationFn: () => unsubscribeFromPush(),
    onSettled: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });

  return {
    permission: data?.permission ?? 'default',
    subscribed: data?.subscribed ?? false,
    isBusy: enable.isPending || disable.isPending,
    enable: enable.mutateAsync,
    disable: disable.mutateAsync,
  };
}
