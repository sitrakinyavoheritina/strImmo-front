import { useQuery } from '@tanstack/react-query';
import { listingService } from '../services/listing-service';

// Position facultative : `enabled` reste `false` tant qu'on ne l'a pas (voir
// nearby-properties-map-widget.tsx, qui ne la demande qu'au clic — jamais silencieusement au
// chargement de la page, même convention que le bouton "Utiliser ma position" du formulaire de
// création d'annonce).
export function useNearbyProperties(latitude?: number, longitude?: number, limit = 6) {
  return useQuery({
    queryKey: ['properties', 'nearby', latitude, longitude, limit],
    queryFn: () => listingService.nearby(latitude as number, longitude as number, limit),
    enabled: latitude != null && longitude != null,
  });
}
