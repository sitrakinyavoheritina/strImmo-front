import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/state/use-auth-store';
import { analyticsApi } from '../services/analytics-api';

export function useMyViewHistory() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return useQuery({
    queryKey: ['property-view-history'],
    queryFn: analyticsApi.myHistory,
    enabled: isAuthenticated,
  });
}

export function usePropertyStatistics(propertyId: string, enabled: boolean) {
  return useQuery({
    queryKey: ['property-statistics', propertyId],
    queryFn: () => analyticsApi.statistics(propertyId),
    enabled,
    staleTime: 60 * 1000,
  });
}
