import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { trackEvent } from '@/lib/analytics/track';
import { useRequestLikesStore } from '@/lib/state/use-request-likes-store';
import { propertyRequestApi } from '../services/property-request-api';
import type {
  CreatePropertyRequestPayload,
  PropertyRequest,
  PropertyRequestReportReason,
  PublicPropertyRequestFilters,
} from '../types/property-request.types';

const MINE_KEY = ['property-requests', 'mine'];
// Clé racine du tableau public (chaque filtre différent a sa propre sous-clé, voir
// usePublicPropertyRequests) — un create/toggle/delete peut changer ce qui y apparaît, donc toutes
// les variantes doivent être invalidées, pas juste celle actuellement affichée.
const PUBLIC_KEY_PREFIX = ['property-requests', 'public'];

export function useMyPropertyRequests(enabled: boolean) {
  return useQuery({
    queryKey: MINE_KEY,
    queryFn: () => propertyRequestApi.listMine(),
    enabled,
  });
}

export function usePublicPropertyRequests(filters: PublicPropertyRequestFilters) {
  return useQuery({
    queryKey: [...PUBLIC_KEY_PREFIX, filters],
    queryFn: () => propertyRequestApi.listPublic(filters),
  });
}

function invalidateAll(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: MINE_KEY });
  void queryClient.invalidateQueries({ queryKey: PUBLIC_KEY_PREFIX });
}

export function useCreatePropertyRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePropertyRequestPayload) => propertyRequestApi.create(payload),
    onSuccess: () => invalidateAll(queryClient),
  });
}

export function useUpdatePropertyRequestVisibility() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isPublic }: { id: string; isPublic: boolean }) =>
      propertyRequestApi.updateVisibility(id, isPublic),
    onSuccess: () => invalidateAll(queryClient),
  });
}

export function useDeletePropertyRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => propertyRequestApi.remove(id),
    onSuccess: () => invalidateAll(queryClient),
  });
}

function patchLikesCount(list: PropertyRequest[] | undefined, id: string, likesCount: number) {
  return list?.map((request) => (request.id === id ? { ...request, likesCount } : request));
}

/** Bascule le "j'aime" (cœur) d'une demande — même mécanique que useLikeProperty : compteur
 *  partagé côté backend, état "aimé par ce navigateur" purement local (useRequestLikesStore),
 *  cœur qui revient à son état d'avant clic si l'appel réseau échoue. */
export function useLikePropertyRequest() {
  const queryClient = useQueryClient();
  const setLiked = useRequestLikesStore((state) => state.setLiked);

  return useMutation({
    mutationFn: ({ id, wasLiked }: { id: string; wasLiked: boolean; userId: string }) =>
      wasLiked ? propertyRequestApi.unlike(id) : propertyRequestApi.like(id),
    onMutate: ({ id, wasLiked, userId }) => {
      trackEvent('like_property_request', { action: wasLiked ? 'remove' : 'add', source: 'like' });
      setLiked(userId, id, !wasLiked);
    },
    onSuccess: ({ likesCount }, { id }) => {
      queryClient.setQueriesData<PropertyRequest[]>({ queryKey: PUBLIC_KEY_PREFIX }, (data) =>
        patchLikesCount(data, id, likesCount)
      );
      queryClient.setQueryData<PropertyRequest[]>(MINE_KEY, (data) => patchLikesCount(data, id, likesCount));
    },
    onError: (_error, { id, wasLiked, userId }) => {
      setLiked(userId, id, wasLiked);
    },
  });
}

export function useReportPropertyRequest() {
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: PropertyRequestReportReason }) =>
      propertyRequestApi.report(id, reason),
  });
}
