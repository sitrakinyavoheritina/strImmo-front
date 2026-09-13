import { useDebouncedValue } from '@/lib/hooks/use-debounced-value';
import type { PropertyFilters } from '../types/listing.types';

const SEARCH_DEBOUNCE_MS = 400;
// Sous ce nombre de caractères, une recherche par lieu est trop peu spécifique pour valoir une
// requête (et se déclencherait à chaque lettre tapée) — demandé explicitement.
const MIN_LOCATION_LENGTH = 4;

/** Filtres tels qu'ils doivent être envoyés à `useProperties` pour une recherche "en direct"
 *  (fil d'accueil, page résultats) : le texte de localisation est retardé de 400ms après la
 *  dernière frappe et ignoré tant qu'il fait moins de 4 caractères — évite de déclencher une
 *  requête réseau à chaque lettre tapée. Les autres filtres (type de bien, prix...) s'appliquent
 *  tout de suite, seul le texte libre a besoin de ce traitement. */
export function useDebouncedSearchFilters(filters: PropertyFilters): PropertyFilters {
  const debouncedLocation = useDebouncedValue(filters.location, SEARCH_DEBOUNCE_MS);
  const effectiveLocation =
    debouncedLocation && debouncedLocation.trim().length >= MIN_LOCATION_LENGTH ? debouncedLocation : undefined;
  return { ...filters, location: effectiveLocation };
}
