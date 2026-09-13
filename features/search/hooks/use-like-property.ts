import { useMutation, useQueryClient } from '@tanstack/react-query';
import { propertyApi } from '../services/property-api';
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
      setLiked(userId, id, !wasLiked);
    },
    onSuccess: ({ likesCount }, { id }) => {
      queryClient.setQueriesData<Property[]>({ queryKey: ['properties'] }, (properties) =>
        patchLikesCount(properties, id, likesCount)
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
