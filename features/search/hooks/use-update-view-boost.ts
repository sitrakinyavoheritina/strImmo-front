import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateViewBoost, type UpdateViewBoostPayload } from '@/features/listings/services/view-boost-api';

// Réservé admin/superadmin (voir /annonce/[id], section "Boost des vues") — même pattern
// d'invalidation que use-moderate-property.ts (`['property', id]`, séparée de `['properties']`).
// Appelle `view-boost-api.ts` directement (pas `listingService`/`propertyApi`, partagés et chargés
// par tout le monde) : ce hook n'est lui-même atteint que depuis le chunk admin chargé
// dynamiquement par view-boost-section.tsx — garder cet appel isolé évite que le chemin
// `/view-boost` et sa charge utile ne finissent dans le bundle principal.
export function useUpdateViewBoost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateViewBoostPayload }) =>
      updateViewBoost(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['property', variables.id] });
    },
  });
}
