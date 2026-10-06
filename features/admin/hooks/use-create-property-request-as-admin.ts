import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ADMIN_KEY } from '@/features/property-requests/hooks/use-property-requests';
import type { CreatePropertyRequestPayload } from '@/features/property-requests/types/property-request.types';
import { adminApi } from '../services/admin-api';

// Voir strImmo/src/property-requests/property-requests.controller.ts:createAsAdmin — invalidate
// la liste admin (voir useAdminPropertyRequests), pas "mine"/"public" : ce n'est pas l'admin qui
// doit voir cette demande dans ses propres listes, seulement dans la vue admin/modération.
export function useCreatePropertyRequestAsAdmin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePropertyRequestPayload & { targetUserId: string }) =>
      adminApi.createPropertyRequestAsAdmin(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_KEY }),
  });
}
