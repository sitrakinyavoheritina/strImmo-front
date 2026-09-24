// Port du contrat mobile (Onina-mobile/src/features/listings/types/listing.types.ts) — mêmes
// noms de champs, alignés 1:1 avec strImmo/src/properties/dto/list-properties-query.dto.ts, pour
// que web et mobile parlent exactement le même langage au même backend.

export type ListingKind = 'sale' | 'rent';

export type PropertyType = 'house' | 'apartment' | 'villa' | 'land';

export type WaterSource = 'jirama' | 'well' | 'other';
export type BathroomLocation = 'interior' | 'exterior';
export type LandStatus = 'titled' | 'cadastre' | 'fitanolorana' | 'other';
export type LandPriceType = 'total' | 'per_m2';
export type RoomType = 'T1' | 'T2' | 'T3' | 'T4' | 'T5' | 'T6plus';

export type PropertyModerationStatus = 'pending' | 'approved' | 'rejected';

type PropertyBase = {
  id: string;
  title: string;
  description: string;
  price: number;
  kind: ListingKind;
  /** Texte affichable ("<fokontany>, <commune>" pour une annonce créée via le nouveau parcours,
   *  texte libre pour une annonce plus ancienne) — jamais saisi directement dans ce nouveau
   *  parcours, calculé côté serveur à partir de `communeId`/`fokontanyId` (voir property-form.tsx
   *  et strImmo/src/properties/properties.service.ts:resolveLocation). */
  location: string;
  /** Localisation précise — absents sur une annonce créée avant l'ajout de cette fonctionnalité
   *  (voir features/listings/components/property-form.tsx, map-position-picker.tsx). */
  communeId?: string;
  communeName?: string;
  fokontanyId?: string;
  fokontanyName?: string;
  /** Indication complémentaire facultative (ex. "Lot II B 123, près de..."), jamais utilisée
   *  seule pour localiser le bien. */
  address?: string;
  latitude?: number;
  longitude?: number;
  mainPhotoUrl?: string;
  photoUrls: string[];
  ownerId: string;
  createdAt: string;
  available: boolean;
  moderationStatus: PropertyModerationStatus;
  /** Motif renseigné par un admin en cas de refus — absent sinon (voir "Mes Biens"). */
  rejectionReason?: string;
  /** Nom de l'admin/superadmin ayant validé ou refusé l'annonce — absent tant qu'elle est
   *  "pending" (voir /admin, statistiques "par équipe"). */
  moderatorName?: string;
  phone2?: string;
  commission?: number;
  caution?: number;
  /** Frais facturé par un intermédiaire/une agence pour faire visiter le bien — facultatif même
   *  pour eux (contrairement à commission/caution), jamais présent pour un propriétaire. */
  visitFee?: number;
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
  /** Compteur de "j'aime" (cœur) — distinct de `favoritesCount` (annonces enregistrées pour plus
   *  tard). Colonne persistée (`properties.likes_count`), pas de suivi "qui a aimé quoi" côté
   *  backend — voir lib/state/use-likes-store.ts pour l'état local par navigateur. */
  likesCount: number;
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
  // Sens de `price` déterminé par `priceType` ('total' ou 'per_m2') — plus jamais implicite.
  priceType: LandPriceType;
  surfaceM2: number;
  legalStatus: LandStatus;
  hasCarAccess: boolean;
  isResidentialArea: boolean;
  hasWaterAvailable: boolean;
  hasElectricityAvailable: boolean;
  isBuildReady: boolean;
  isLotissement: boolean;
  isSubdivisible: boolean;
  /** Surface minimale (m²) d'un lot en cas de morcellement — absent si `isSubdivisible` est faux. */
  minSubdivisionM2?: number;
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
  /** Restreint à une commune précise (voir features/listings/services/location-api.ts) — plus
   *  fiable que `location` (texte libre) pour un lien construit à partir de données structurées,
   *  ex. le widget "communes les plus recherchées". */
  communeId?: string;
  /** Restreint aux annonces publiées il y a au plus ce nombre de jours (ex. 7 pour "nouveautés de
   *  la semaine") — calculé côté serveur par rapport à maintenant à chaque requête. */
  maxAgeDays?: number;
  /** Type de compte ayant publié l'annonce (propriétaire / intermédiaire / agence). */
  publisherType?: PublisherType;
  /** Restreint aux annonces publiées par cet utilisateur (écran "Mon compte"). */
  ownerId?: string;
  /** Restreint aux annonces mises en favori par cet utilisateur (écran "Mes favoris") — une seule
   *  requête groupée côté backend plutôt qu'une requête par annonce, voir
   *  strImmo/src/properties/dto/list-properties-query.dto.ts. */
  favoritesOf?: string;
  /** Statut de modération — sans ce filtre, seules les annonces approuvées sont retournées. */
  status?: 'pending' | 'approved' | 'rejected';
  sortBy?: 'recent' | 'price_asc' | 'price_desc' | 'popular';
  /** Scroll infini (accueil uniquement, voir use-infinite-properties.ts) — sans ces deux champs,
   *  le backend renvoie tous les résultats d'un coup (comportement historique, toujours utilisé
   *  par Mes Biens/Favoris/la modération admin). */
  limit?: number;
  offset?: number;
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
  'id' | 'ownerId' | 'createdAt' | 'viewCount' | 'moderationStatus' | 'likesCount'
>;
