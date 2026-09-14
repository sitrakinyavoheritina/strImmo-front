import { useMutation, useQueryClient } from '@tanstack/react-query';
import { listingService } from '../services/listing-service';

// Réservées à un compte admin/superadmin (voir /validation) — même paire de mutations que côté
// mobile (Onina-mobile/src/features/listings/hooks/use-moderate-property.ts). Invalide `['property',
// id]` EN PLUS de `['properties']` : la fiche détail (use-property.ts) a sa propre clé de requête
// séparée, jamais couverte par l'invalidation de la liste seule — sans ça, "Valider"/"Refuser"
// depuis la fiche détail changeait bien le statut côté serveur (confirmé) mais les boutons ne
// disparaissaient jamais, donnant l'impression que le clic n'avait aucun effet.
export function useApproveProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => listingService.approve(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['property', id] });
    },
  });
}

export function useRejectProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => listingService.reject(id, reason),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['property', variables.id] });
    },
  });
}
