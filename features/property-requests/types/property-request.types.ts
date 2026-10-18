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
  // Facultatif, texte libre (pas de validation de format) — affiché publiquement sur le tableau
  // (GET /property-requests/public) même en mode anonyme : l'anonymat ne masque que le nom de
  // l'auteur, jamais ce contact qu'il a choisi de renseigner (voir PublicBoardCard).
  phone?: string | null;
  isPublic: boolean;
  likesCount: number;
  // Piloté UNIQUEMENT par le boost admin (voir RequestViewBoostConfig ci-dessous) — une demande
  // n'a pas de vraie vue trackée, contrairement à une annonce (Property.viewCount + boostViews).
  // Toujours présent, part de 0, défaut 0 côté backend.
  viewCount: number;
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
  phone?: string;
  isPublic?: boolean;
};

// Modification d'une demande existante (PATCH /property-requests/:id, réservé à l'auteur) —
// mêmes champs qu'à la création, mais TOUS facultatifs ici (une modification partielle n'a pas à
// redonner le type de transaction ou le quartier si seul le budget change, voir
// UpdatePropertyRequestDto côté backend). Distinct de `updateVisibility` (PATCH .../visibility),
// qui ne touche qu'`isPublic`.
export type UpdatePropertyRequestPayload = Partial<CreatePropertyRequestPayload>;

export type PublicPropertyRequestFilters = {
  kind?: ListingKind;
  propertyType?: PropertyType;
  communeId?: string;
};

// Miroir du résultat de GET /property-requests/:id/summary (route PUBLIQUE, pas d'auth requise)
// — volontairement accessible aux deux participants d'une conversation démarrée depuis une
// demande (pas seulement l'auteur, contrairement à `getOne`/`useRequest` ci-dessous), et même si
// la demande a depuis été rendue privée. Jamais de donnée sensible (pas d'userId, pas de
// téléphone) : sert uniquement à afficher l'encart "Demande de recherche" en haut du fil (voir
// app/messages/[id]/page.tsx).
export type PropertyRequestSummary = {
  id: string;
  kind: ListingKind;
  propertyType?: PropertyType;
  communeName?: string;
  fokontanyName?: string;
  minBudget?: number;
  maxBudget?: number;
};

// Config + progression du boost de vues d'une demande (voir PATCH
// /property-requests/admin/:id/view-boost) — même forme que ViewBoostConfig (annonces, voir
// features/search/types/listing.types.ts) MOINS tous les champs `like*` : une demande n'a pas de
// boost des "j'aime", ses "j'aime" restent 100% réels.
export type RequestViewBoostConfig = {
  enabled: boolean;
  dayStart: string;
  dayEnd: string;
  nightStart: string;
  nightEnd: string;
  dayTarget: number;
  nightTarget: number;
  dayAdded: number;
  nightAdded: number;
  dayEffectiveTarget: number;
  nightEffectiveTarget: number;
  nextBoostAt: string | null;
  lastBoostAt: string | null;
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
  // Admin-only (voir PropertyRequestsService.queryAdminRows) — présent uniquement si un admin a
  // créé cette demande pour le compte de l'auteur, jamais exposé sur le tableau public.
  createdByAdminId?: string;
  createdByAdminName?: string;
  // Même compteur que PropertyRequest.viewCount, toujours présent (0 par défaut).
  viewCount: number;
  // Absent = jamais configuré pour cette demande (voir toFormState côté AdminRequestViewBoost).
  viewBoost?: RequestViewBoostConfig;
};
