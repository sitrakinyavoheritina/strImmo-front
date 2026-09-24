import { useQuery } from '@tanstack/react-query';
import { listingService } from '../services/listing-service';
import type { Property } from '../types/listing.types';

// `initialData` : annonce déjà chargée côté serveur (rendu SEO, voir app/annonce/[id]/page.tsx) —
// le HTML contient ainsi le vrai contenu dès la première réponse. `initialDataUpdatedAt: 0` la
// marque périmée : le navigateur la recharge tout de suite (avec le jeton de l'utilisateur
// connecté, donc avec le contact du vendeur que le rendu serveur anonyme ne contient jamais).
export function useProperty(id: string | undefined, initialData?: Property) {
  return useQuery({
    queryKey: ['property', id],
    queryFn: () => listingService.getById(id as string),
    enabled: !!id,
    initialData,
    initialDataUpdatedAt: initialData ? 0 : undefined,
  });
}
