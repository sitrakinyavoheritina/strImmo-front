import type { PropertyFilters } from '../types/listing.types';

const ADVANCED_KEYS: (keyof PropertyFilters)[] = [
  'minBedrooms',
  'hasCarAccess',
  'hasMotorbikeAccess',
  'waterSource',
  'bathroomLocation',
  'hasIndividualMeter',
  'isIndependent',
  'roomType',
  'minParkingSpots',
  'isFurnished',
  'hasComfort',
  'hasCaretakerAnnex',
  'legalStatus',
  'isResidentialArea',
  'hasWaterAvailable',
  'hasElectricityAvailable',
  'isBuildReady',
];

/** Sert au point (badge) affiché sur "Filtres avancés" — même repère visuel que le mobile. */
export function hasActiveAdvancedFilters(filters: PropertyFilters): boolean {
  return ADVANCED_KEYS.some((key) => filters[key] !== undefined);
}
