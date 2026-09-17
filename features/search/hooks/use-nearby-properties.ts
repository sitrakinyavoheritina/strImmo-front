import { useQuery } from '@tanstack/react-query';
import { listingService } from '../services/listing-service';

// Position facultative : `enabled` reste `false` tant qu'on ne l'a pas (voir
// nearby-properties-map-widget.tsx, qui la demande automatiquement à la première ouverture de
// l'accueil, une seule fois par session — voir useNearbyPositionStore). `staleTime: Infinity` :
// une fois chargée pour une position donnée, cette liste ne doit plus se rafraîchir toute seule
// (changement d'onglet, retour sur l'accueil...) — demandé explicitement, la position elle-même
// ne bouge de toute façon plus une fois acquise pour la session.
export function useNearbyProperties(latitude?: number, longitude?: number, limit = 6) {
  return useQuery({
    queryKey: ['properties', 'nearby', latitude, longitude, limit],
    queryFn: () => listingService.nearby(latitude as number, longitude as number, limit),
    enabled: latitude != null && longitude != null,
    staleTime: Infinity,
  });
}
