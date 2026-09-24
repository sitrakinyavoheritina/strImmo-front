import { useMutation, useQueryClient } from '@tanstack/react-query';
import { propertyApi } from '../services/property-api';
import { trackEvent } from '@/lib/analytics/track';
import { useLikesStore } from '@/lib/state/use-likes-store';
import type { Property } from '../types/listing.types';

function patchLikesCount(
  properties: Property[] | undefined,
  id: string,
  likesCount: number
): Property[] | undefined {
  if (!properties) return properties;
  return properties.map((property) => (property.id === id ? { ...property, likesCount } : property));
}

// Le fil d'accueil est un `useInfiniteQuery` (clé ['properties', 'infinite', ...]) : son cache est
// `{ pages: Property[][], pageParams }`, pas un tableau — l'appliquer tel quel à `patchLikesCount`
// levait une exception dans `onSuccess`, ce qui faisait échouer la mutation et déclenchait
// `onError` (retour du cœur à son état d'avant) alors que le like avait bien été enregistré.
type CachedProperties = Property[] | { pages: Property[][]; pageParams: unknown[] } | undefined;

function patchCachedProperties(data: CachedProperties, id: string, likesCount: number): CachedProperties {
  if (!data) return data;
  if (Array.isArray(data)) return patchLikesCount(data, id, likesCount);
  if ('pages' in data && Array.isArray(data.pages)) {
    return { ...data, pages: data.pages.map((page) => patchLikesCount(page, id, likesCount) ?? page) };
  }
  return data;
}

/** Bascule le "j'aime" d'une annonce (cœur) : appelle le backend (compteur partagé, voir
 *  strImmo/src/properties/properties.controller.ts), met à jour l'état "aimé par ce navigateur"
 *  (useLikesStore, indexé par `userId` — pas de suivi par utilisateur côté serveur) et patch le
 *  compteur dans le cache React Query — évite de refaire un GET /properties juste pour un chiffre
 *  qui a changé de 1. */
export function useLikeProperty() {
  const queryClient = useQueryClient();
  const setLiked = useLikesStore((state) => state.setLiked);

  return useMutation({
    mutationFn: ({ id, wasLiked }: { id: string; wasLiked: boolean; userId: string }) =>
      wasLiked ? propertyApi.unlike(id) : propertyApi.like(id),
    onMutate: ({ id, wasLiked, userId }) => {
      trackEvent('favorite_property', { property_id: id, action: wasLiked ? 'remove' : 'add', source: 'like' });
      setLiked(userId, id, !wasLiked);
    },
    onSuccess: ({ likesCount }, { id }) => {
      queryClient.setQueriesData<CachedProperties>({ queryKey: ['properties'] }, (data) =>
        patchCachedProperties(data, id, likesCount)
      );
      queryClient.setQueryData<Property>(['property', id], (property) =>
        property ? { ...property, likesCount } : property
      );
    },
    // L'appel réseau a échoué : le cœur revient à son état d'avant clic plutôt que de rester
    // "aimé" localement sans que ça se soit vraiment enregistré côté serveur.
    onError: (_error, { id, wasLiked, userId }) => {
      setLiked(userId, id, wasLiked);
    },
  });
}
