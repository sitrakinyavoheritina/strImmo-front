import { useMutation, useQueryClient } from '@tanstack/react-query';
import { newsApi } from '../services/news-api';
import type { NewsFormValues } from '../types/news.types';

// Réservées à un compte admin/superadmin (voir /admin/actus) — invalide `['news']` (liste) et,
// pour la mise à jour, `['news', id]` (fiche détail) en plus, même règle que
// use-moderate-property.ts pour les annonces.
export function useCreateNews() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ values, cover }: { values: NewsFormValues; cover?: File | null }) =>
      newsApi.create(values, cover),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
    },
  });
}

export function useUpdateNews() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, values, cover }: { id: string; values: NewsFormValues; cover?: File | null }) =>
      newsApi.update(id, values, cover),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
      queryClient.invalidateQueries({ queryKey: ['news', variables.id] });
    },
  });
}

export function useDeleteNews() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => newsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
    },
  });
}
