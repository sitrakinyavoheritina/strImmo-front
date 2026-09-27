import type { ListingKind, PropertyType } from '@/features/search/types/listing.types';

// Miroir de strImmo/src/property-requests/entities/property-request.entity.ts.
export type PropertyRequest = {
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

export type CreatePropertyRequestPayload = {
  kind: ListingKind;
  propertyType?: PropertyType;
  communeId?: string;
  fokontanyId?: string;
  minBudget?: number;
  maxBudget?: number;
  minBedrooms?: number;
  rawDescription?: string;
  isPublic?: boolean;
};

export type PublicPropertyRequestFilters = {
  kind?: ListingKind;
  propertyType?: PropertyType;
  communeId?: string;
};
