import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/state/use-auth-store';
import {
  getPushPermission,
  isSubscribedToPush,
  subscribeToPush,
  unsubscribeFromPush,
} from '@/lib/push/push-client';

// La clé porte l'id du compte : sur un même navigateur, l'état « abonné » d'un compte ne doit pas
// être réutilisé pour le suivant après une déconnexion/reconnexion.
const queryKeyFor = (userId?: string) => ['push-status', userId ?? 'anonymous'];

// État des notifications push sur CET appareil : abonné ou non, et permission du navigateur
// (`denied` = bloquées dans les réglages du navigateur, seul l'utilisateur peut les rétablir).
export function usePushNotifications() {
  const queryClient = useQueryClient();
  const QUERY_KEY = queryKeyFor(useAuthStore((s) => s.user?.id));

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
    // false tant que l'état de l'appareil n'a pas été lu (évite d'agir sur une valeur par défaut).
    ready: data !== undefined,
    permission: data?.permission ?? 'default',
    subscribed: data?.subscribed ?? false,
    isBusy: enable.isPending || disable.isPending,
    enable: enable.mutateAsync,
    disable: disable.mutateAsync,
  };
}
