// Port du contrat mobile (Onina-mobile/src/features/listings/types/listing.types.ts) — mêmes
// noms de champs, alignés 1:1 avec strImmo/src/properties/dto/list-properties-query.dto.ts, pour
// que web et mobile parlent exactement le même langage au même backend.

export type ListingKind = 'sale' | 'rent';

export type PropertyType = 'house' | 'apartment' | 'villa' | 'land';

export type WaterSource = 'jirama' | 'well' | 'other';
export type BathroomLocation = 'interior' | 'exterior';
export type LandStatus = 'titled' | 'cadastre' | 'fitanolorana' | 'other';
export type RoomType = 'T1' | 'T2' | 'T3' | 'T4' | 'T5' | 'T6plus';

export type PropertyModerationStatus = 'pending' | 'approved' | 'rejected';

type PropertyBase = {
  id: string;
  title: string;
  description: string;
  price: number;
  kind: ListingKind;
  location: string;
  mainPhotoUrl?: string;
  photoUrls: string[];
  ownerId: string;
  createdAt: string;
  available: boolean;
  moderationStatus: PropertyModerationStatus;
  /** Motif renseigné par un admin en cas de refus — absent sinon (voir "Mes Biens"). */
  rejectionReason?: string;
  phone2?: string;
  commission?: number;
  caution?: number;
  viewCount: number;
  // Renseignés seulement quand le backend renvoie `user` (toujours sur le détail, nom/avatar/rôle
  // seulement sur la liste — voir property-api.ts) — absents sinon.
  authorName?: string;
  authorAvatarUrl?: string;
  publisherType?: PublisherType;
  /** Téléphone principal du vendeur (détail uniquement) — `phone2` reste le numéro secondaire
   *  optionnel saisi sur l'annonce elle-même. */
  contactPhone?: string;
  /** Calculé côté backend (COUNT sur `favorites`), jamais persisté. */
  favoritesCount?: number;
};

export type HouseProperty = PropertyBase & {
  propertyType: 'house';
  bedrooms: number;
  hasCarAccess: boolean;
  hasMotorbikeAccess: boolean;
  waterSource: WaterSource;
  bathroomLocation: BathroomLocation;
  hasIndividualMeter: boolean;
};

// Villa et Appartement partagent le même jeu de champs métier — factorisé pour éviter la
// duplication (voir le commentaire équivalent côté mobile).
type ResidentialFields = {
  surfaceM2: number;
  isIndependent: boolean;
  roomType: RoomType;
  parkingSpots: number;
  isFurnished: boolean;
  hasComfort: boolean;
  hasCaretakerAnnex: boolean;
};

export type VillaProperty = PropertyBase & ResidentialFields & { propertyType: 'villa' };
export type ApartmentProperty = PropertyBase & ResidentialFields & { propertyType: 'apartment' };

export type LandProperty = PropertyBase & {
  propertyType: 'land';
  // `price` = prix AU M² pour un terrain (sémantique différente des autres types).
  legalStatus: LandStatus;
  hasCarAccess: boolean;
  isResidentialArea: boolean;
  hasWaterAvailable: boolean;
  hasElectricityAvailable: boolean;
  isBuildReady: boolean;
};

export type Property = HouseProperty | VillaProperty | ApartmentProperty | LandProperty;

export type PublisherType = 'owner' | 'agent' | 'agency';

export type PropertyFilters = {
  query?: string;
  kind?: ListingKind;
  propertyType?: PropertyType;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  /** Type de compte ayant publié l'annonce (propriétaire / intermédiaire / agence). */
  publisherType?: PublisherType;
  /** Restreint aux annonces publiées par cet utilisateur (écran "Mon compte"). */
  ownerId?: string;
  /** Statut de modération — sans ce filtre, seules les annonces approuvées sont retournées. */
  status?: 'pending' | 'approved' | 'rejected';
  sortBy?: 'recent' | 'price_asc' | 'price_desc' | 'popular';
  // Maison
  minBedrooms?: number;
  hasCarAccess?: boolean;
  hasMotorbikeAccess?: boolean;
  waterSource?: WaterSource;
  bathroomLocation?: BathroomLocation;
  hasIndividualMeter?: boolean;
  // Villa / Appartement
  isIndependent?: boolean;
  roomType?: RoomType;
  minParkingSpots?: number;
  isFurnished?: boolean;
  hasComfort?: boolean;
  hasCaretakerAnnex?: boolean;
  // Terrain
  legalStatus?: LandStatus;
  isResidentialArea?: boolean;
  hasWaterAvailable?: boolean;
  hasElectricityAvailable?: boolean;
  isBuildReady?: boolean;
};

// `Omit` distribué manuellement sur l'union : un `Omit<Property, ...>` naïf aplatirait tout en une
// intersection des clés communes et casserait le discriminant `propertyType`. Port de
// Onina-mobile/src/features/listings/types/listing.types.ts:PropertyFormValues (sans
// `rejectionReason`, absent du modèle web).
type DistributiveOmit<T, K extends keyof T> = T extends unknown ? Omit<T, K> : never;
export type PropertyFormValues = DistributiveOmit<
  Property,
  'id' | 'ownerId' | 'createdAt' | 'viewCount' | 'moderationStatus'
>;
