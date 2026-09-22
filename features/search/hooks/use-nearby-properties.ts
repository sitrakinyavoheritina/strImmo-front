import { useQuery } from '@tanstack/react-query';
import { listingService } from '../services/listing-service';

// Position facultative : `enabled` reste `false` tant qu'on ne l'a pas (voir
// nearby-properties-map-widget.tsx, qui la demande automatiquement à la première ouverture de
// l'accueil, une seule fois par session — voir useNearbyPositionStore). Pas de `staleTime`
// personnalisé (contrairement à avant) : la liste se rafraîchit comme le reste de l'app au retour
// sur l'onglet (défaut react-query, voir QueryProvider) — un `staleTime: Infinity` la figeait
// jusqu'au rechargement complet de la page, ce qui gardait des annonces obsolètes affichées
// (nouvelle annonce proche jamais montrée, annonce supprimée toujours affichée) — remonté
// explicitement par l'utilisateur. La position géolocalisée, elle, reste acquise pour la session
// (voir useNearbyPositionStore) : seule la liste d'annonces doit se rafraîchir, pas redemander la
// géolocalisation à chaque retour sur l'onglet.
export function useNearbyProperties(latitude?: number, longitude?: number, limit = 6) {
  return useQuery({
    queryKey: ['properties', 'nearby', latitude, longitude, limit],
    queryFn: () => listingService.nearby(latitude as number, longitude as number, limit),
    enabled: latitude != null && longitude != null,
  });
}
