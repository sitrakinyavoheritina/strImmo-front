import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { favoriteApi } from '../services/favorite-api';
import { useAuthStore } from '@/lib/state/use-auth-store';

/** Ids des annonces enregistrées par le compte connecté — vrai backend (voir
 *  strImmo/src/favorites), pas un stockage local par navigateur : se retrouve d'un appareil à
 *  l'autre, une fois connecté. `enabled: isAuthenticated` : l'endpoint est protégé, inutile
 *  d'appeler sans session (et ça éviterait un 401 systématique pour un visiteur non connecté). */
export function useFavoriteIds() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return useQuery({
    queryKey: ['favorites'],
    queryFn: favoriteApi.listIds,
    enabled: isAuthenticated,
  });
}

/** Bascule "Enregistrer" sur une annonce. Mise à jour optimiste de la liste d'ids ; les listes de
 *  propriétés (`['properties', ...]`, dont l'écran "Mes favoris" qui filtre par `favoritesOf`)
 *  sont invalidées après coup pour rester en phase, sans essayer de patcher leur contenu à la main
 *  (contrairement à `useLikeProperty`) — l'ajout/retrait doit faire apparaître/disparaître
 *  l'annonce de cette liste, pas juste changer un champ dessus. */
export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ propertyId, wasSaved }: { propertyId: string; wasSaved: boolean }) =>
      wasSaved ? favoriteApi.remove(propertyId) : favoriteApi.add(propertyId),
    onMutate: ({ propertyId, wasSaved }) => {
      queryClient.setQueryData<string[]>(['favorites'], (ids) => {
        if (!ids) return ids;
        return wasSaved ? ids.filter((id) => id !== propertyId) : [...ids, propertyId];
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });
}
