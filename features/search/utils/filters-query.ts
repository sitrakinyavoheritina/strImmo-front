import type { PropertyFilters } from '../types/listing.types';

const NUMBER_KEYS = ['minPrice', 'maxPrice', 'minBedrooms', 'minParkingSpots', 'maxAgeDays'] as const;
const BOOLEAN_KEYS = [
  'hasCarAccess',
  'hasMotorbikeAccess',
  'hasIndividualMeter',
  'isIndependent',
  'isFurnished',
  'hasComfort',
  'hasCaretakerAnnex',
  'isResidentialArea',
  'hasWaterAvailable',
  'hasElectricityAvailable',
  'isBuildReady',
] as const;

/** Sérialise les filtres actifs en query string, pour la navigation vers /recherche. */
export function filtersToSearchParams(filters: PropertyFilters): URLSearchParams {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    params.set(key, String(value));
  });
  return params;
}

/** Reconstitue un objet PropertyFilters typé à partir de la query string de /recherche. */
export function searchParamsToFilters(params: URLSearchParams): PropertyFilters {
  const filters: PropertyFilters = {};
  params.forEach((value, key) => {
    if ((NUMBER_KEYS as readonly string[]).includes(key)) {
      (filters as Record<string, unknown>)[key] = Number(value);
    } else if ((BOOLEAN_KEYS as readonly string[]).includes(key)) {
      (filters as Record<string, unknown>)[key] = value === 'true';
    } else {
      (filters as Record<string, unknown>)[key] = value;
    }
  });
  return filters;
}
