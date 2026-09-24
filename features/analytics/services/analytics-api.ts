import { apiClient } from '@/lib/api/client';

export type ViewedProperty = {
  propertyId: string;
  viewedAt: string;
  title: string;
  price: number;
  kind: 'rent' | 'sale';
  propertyType: string;
  location: string;
  coverUrl: string | null;
};

export type PropertyStatistics = {
  views: { total: number; today: number; week: number; month: number; uniqueVisitors: number };
  favorites: number;
  messages: number;
  contacts: number;
};

export const analyticsApi = {
  myHistory: () => apiClient.get<ViewedProperty[]>('/property-views/me').then((r) => r.data),
  statistics: (propertyId: string) =>
    apiClient.get<PropertyStatistics>(`/properties/${propertyId}/statistics`).then((r) => r.data),
};
