import type {
  BathroomLocation,
  LandStatus,
  ListingKind,
  PropertyType,
  RoomType,
  WaterSource,
} from '@/features/search/types/listing.types';

// Critères facultatifs supplémentaires ("Plus de critères") — mêmes noms/valeurs que
// PropertyFilters (features/search/types/listing.types.ts), voir FilterFields, réutilisé tel quel
// par app/demandes/nouvelle/page.tsx.
type PropertyRequestExtraCriteria = {
  hasCarAccess?: boolean;
  hasMotorbikeAccess?: boolean;
  waterSource?: WaterSource;
  bathroomLocation?: BathroomLocation;
  hasIndividualMeter?: boolean;
  isIndependent?: boolean;
  roomType?: RoomType;
  minParkingSpots?: number;
  isFurnished?: boolean;
  hasComfort?: boolean;
  hasCaretakerAnnex?: boolean;
  legalStatus?: LandStatus;
  isResidentialArea?: boolean;
  hasWaterAvailable?: boolean;
  hasElectricityAvailable?: boolean;
  isBuildReady?: boolean;
  noCommission?: boolean;
  noCaution?: boolean;
  noVisitFee?: boolean;
};

// Miroir de strImmo/src/property-requests/entities/property-request.entity.ts.
export type PropertyRequest = PropertyRequestExtraCriteria & {
  id: string;
  userId: string;
  kind: ListingKind;
  propertyType?: PropertyType;
  communeId?: string;
  communeName?: string;
  communeDistrict?: string;
  fokontanyId?: string;
  fokontanyName?: string;
  minBudget?: number;
  maxBudget?: number;
  minBedrooms?: number;
  rawDescription?: string;
  isPublic: boolean;
  likesCount: number;
  createdAt: string;
  updatedAt: string;
};

export const PROPERTY_REQUEST_REPORT_REASONS = ['spam', 'inappropriate', 'scam', 'other'] as const;
export type PropertyRequestReportReason = (typeof PROPERTY_REQUEST_REPORT_REASONS)[number];

// `communeId`/`fokontanyId`/`maxBudget` obligatoires côté serveur (voir
// CreatePropertyRequestDto) — une demande sans zone ni budget max ne serait pas assez précise
// pour être comparée utilement à une nouvelle annonce (voir matchAndNotify).
export type CreatePropertyRequestPayload = PropertyRequestExtraCriteria & {
  kind: ListingKind;
  propertyType?: PropertyType;
  communeId: string;
  fokontanyId: string;
  minBudget?: number;
  maxBudget: number;
  minBedrooms?: number;
  rawDescription?: string;
  isPublic?: boolean;
};

export type PublicPropertyRequestFilters = {
  kind?: ListingKind;
  propertyType?: PropertyType;
  communeId?: string;
};

// Miroir de AdminPropertyRequestRow (strImmo/src/property-requests/property-requests.service.ts)
// — vue admin uniquement (GET /property-requests/admin/all) : toutes les demandes, publiques ou
// non, avec les coordonnées de l'auteur pour modérer, jamais exposées sur le tableau public
// anonyme (voir PublicBoardCard).
export type AdminPropertyRequestRow = {
  id: string;
  kind: ListingKind;
  propertyType?: PropertyType;
  communeName?: string;
  fokontanyName?: string;
  minBudget?: number;
  maxBudget?: number;
  isPublic: boolean;
  createdAt: string;
  deletedAt?: string;
  rawDescription?: string;
  authorPhone: string;
  authorName: string;
  reportCount: number;
};
