import { apiClient } from '@/lib/api/client';
import type {
  BathroomLocation,
  LandStatus,
  ListingKind,
  PropertyFilters,
  PropertyModerationStatus,
  PropertyType,
  PublisherType,
  RoomType,
  WaterSource,
} from '../types/listing.types';

// Forme brute renvoyée par strImmo (les champs spécifiques à un type de bien vivent dans une
// sous-table à part) — le mapping vers l'union à plat se fait dans property-mapper.ts, pas ici.
// Port direct de Onina-mobile/src/services/api/property-api.ts.
export type ApiPropertyPhoto = { id: string; url: string; isCover: boolean; position: number };

export type ApiHouseDetails = {
  bedrooms: number;
  hasCarAccess: boolean;
  hasMotorbikeAccess: boolean;
  waterSource: WaterSource;
  bathroomLocation: BathroomLocation;
  hasIndividualMeter: boolean;
};

export type ApiResidentialDetails = {
  surfaceM2: number;
  isIndependent: boolean;
  roomType: RoomType;
  parkingSpots: number;
  isFurnished: boolean;
  hasComfort: boolean;
  hasCaretakerAnnex: boolean;
};

export type ApiLandDetails = {
  legalStatus: LandStatus;
  hasCarAccess: boolean;
  isResidentialArea: boolean;
  hasWaterAvailable: boolean;
  hasElectricityAvailable: boolean;
  isBuildReady: boolean;
};

export type ApiProperty = {
  id: string;
  propertyType: PropertyType;
  kind: ListingKind;
  title: string;
  description: string;
  // Les colonnes `decimal` de Postgres sont sérialisées en chaîne par le driver.
  price: string;
  location: string;
  commune?: { id: string; name: string } | null;
  fokontany?: { id: string; name: string } | null;
  address?: string | null;
  // Colonnes `decimal` Postgres → chaîne, comme `price` ci-dessus.
  latitude?: string | null;
  longitude?: string | null;
  available: boolean;
  moderationStatus: PropertyModerationStatus;
  rejectionReason?: string | null;
  moderatedBy?: { id: string; firstName?: string; lastName?: string } | null;
  phone2: string | null;
  commission: string | null;
  caution: string | null;
  viewCount: number;
  likesCount: number;
  // Liste (`GET /properties`) : nom/avatar/rôle seulement (jamais téléphone/email/adresse, voir
  // strImmo/src/properties/properties.service.ts:findAll). Détail (`GET /properties/:id`) : objet
  // complet, `phone` inclus (nécessaire pour "Contacter le vendeur").
  user?: {
    id: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string | null;
    role?: PublisherType;
    phone?: string;
  };
  // Calculé à la lecture (COUNT sur la table favorites), jamais persisté côté backend.
  favoritesCount?: number;
  photos: ApiPropertyPhoto[];
  houseDetails: ApiHouseDetails | null;
  residentialDetails: ApiResidentialDetails | null;
  landDetails: ApiLandDetails | null;
  createdAt: string;
};

export const propertyApi = {
  list: (filters?: PropertyFilters) =>
    apiClient.get<ApiProperty[]>('/properties', { params: filters }).then((r) => r.data),

  getById: (id: string) => apiClient.get<ApiProperty>(`/properties/${id}`).then((r) => r.data),

  create: (formData: FormData) =>
    apiClient
      .post<ApiProperty>('/properties', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((r) => r.data),

  remove: (id: string) => apiClient.delete<void>(`/properties/${id}`).then((r) => r.data),

  like: (id: string) =>
    apiClient.post<{ likesCount: number }>(`/properties/${id}/like`).then((r) => r.data),

  unlike: (id: string) =>
    apiClient.post<{ likesCount: number }>(`/properties/${id}/unlike`).then((r) => r.data),

  // Réservé admin/superadmin (voir strImmo/src/properties/properties.controller.ts, `@Roles`) —
  // le backend renvoie 403 sinon.
  approve: (id: string) => apiClient.patch<ApiProperty>(`/properties/${id}/approve`).then((r) => r.data),

  reject: (id: string, reason: string) =>
    apiClient.patch<ApiProperty>(`/properties/${id}/reject`, { reason }).then((r) => r.data),

  // Réservé admin/superadmin — voir app/admin/statistiques.
  getStats: () =>
    apiClient
      .get<{
        byMonth: { month: string; count: number }[];
        byModerator: { moderatorId: string; moderatorName: string; approvedCount: number; rejectedCount: number }[];
      }>('/properties/stats')
      .then((r) => r.data),
};
