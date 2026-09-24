import { useMutation, useQuery } from '@tanstack/react-query';
import { propertyApi, type ReportReason } from '../services/property-api';

export function useReportProperty() {
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: ReportReason }) => propertyApi.report(id, reason),
  });
}

export function useReportedProperties(enabled: boolean) {
  return useQuery({ queryKey: ['property-reports'], queryFn: propertyApi.listReports, enabled });
}
