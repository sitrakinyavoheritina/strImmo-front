import { useMutation, useQueryClient } from '@tanstack/react-query';
import { listingService } from '../services/listing-service';
import type { PropertyFormValues } from '../types/listing.types';

// Invalide `['properties']` (listes) ET `['property', id]` (fiche détail) — même règle que
// use-moderate-property.ts, sans quoi la fiche détail déjà ouverte n'aurait pas reflété les
// nouvelles valeurs après un rendu vers celle-ci.
export function useUpdateProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: PropertyFormValues }) => listingService.update(id, values),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['property', variables.id] });
    },
  });
}
