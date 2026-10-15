import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { trackEvent } from '@/lib/analytics/track';
import { useRequestLikesStore } from '@/lib/state/use-request-likes-store';
import { propertyRequestApi, type UpdateRequestViewBoostPayload } from '../services/property-request-api';
import type {
  CreatePropertyRequestPayload,
  PropertyRequest,
  PropertyRequestReportReason,
  PublicPropertyRequestFilters,
  UpdatePropertyRequestPayload,
} from '../types/property-request.types';

const MINE_KEY = ['property-requests', 'mine'];
// Clé racine du tableau public (chaque filtre différent a sa propre sous-clé, voir
// usePublicPropertyRequests) — un create/toggle/delete peut changer ce qui y apparaît, donc toutes
// les variantes doivent être invalidées, pas juste celle actuellement affichée.
const PUBLIC_KEY_PREFIX = ['property-requests', 'public'];
// Exportée : réutilisée par useCreatePropertyRequestAsAdmin (features/admin/hooks) pour
// invalidater la liste admin après une création "pour le compte de" un utilisateur.
export const ADMIN_KEY = ['property-requests', 'admin'];

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

// Préremplissage du formulaire de modification (app/demandes/[id]/modifier) — réservé à l'auteur
// côté backend (403/404 sinon, voir PropertyRequestsController.findOne), jamais utilisé pour
// afficher une demande à un tiers.
export function useRequest(id: string | undefined) {
  return useQuery({
    queryKey: ['property-requests', id],
    queryFn: () => propertyRequestApi.getOne(id as string),
    enabled: !!id,
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

// Modification du contenu d'une demande (PATCH /property-requests/:id) — distinct de
// useUpdatePropertyRequestVisibility ci-dessous, qui ne touche qu'`isPublic`. Invalide aussi la
// demande individuelle (le formulaire de modification peut rester monté après succès le temps de
// la redirection, voir app/demandes/nouvelle/page.tsx).
export function useUpdatePropertyRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdatePropertyRequestPayload }) =>
      propertyRequestApi.update(id, payload),
    onSuccess: (_data, { id }) => {
      invalidateAll(queryClient);
      void queryClient.invalidateQueries({ queryKey: ['property-requests', id] });
    },
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

// Vue admin (toutes les demandes, tous comptes) — voir app/admin/demandes/page.tsx.
export function useAdminPropertyRequests(enabled: boolean) {
  return useQuery({
    queryKey: ADMIN_KEY,
    queryFn: () => propertyRequestApi.listForAdmin(),
    enabled,
  });
}

// Vue admin : demandes supprimées uniquement (voir app/admin/demandes/page.tsx, onglet
// "Supprimées").
export function useAdminDeletedPropertyRequests(enabled: boolean) {
  return useQuery({
    queryKey: [...ADMIN_KEY, 'deleted'],
    queryFn: () => propertyRequestApi.listDeletedForAdmin(),
    enabled,
  });
}

export function useAdminDeletePropertyRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => propertyRequestApi.removeAsAdmin(id),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ADMIN_KEY }),
  });
}

// Boost des vues d'une demande (voir AdminRequestViewBoost) — même pattern que
// useUpdateViewBoost/useResetViewBoost (annonces, features/search/hooks/use-update-view-boost.ts)
// mais invalide ADMIN_KEY (liste admin) plutôt que `['property', id]` : ici c'est la vue admin en
// liste qui doit se rafraîchir, il n'y a pas de fiche unique par demande.
export function useUpdateRequestViewBoost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateRequestViewBoostPayload }) =>
      propertyRequestApi.updateViewBoost(id, payload),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ADMIN_KEY }),
  });
}

export function useResetRequestViewBoost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => propertyRequestApi.resetViewBoost(id),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ADMIN_KEY }),
  });
}
