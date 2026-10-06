import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../services/admin-api';
import type { CreateUserAsAdminPayload } from '../types';

export function useCreateAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateUserAsAdminPayload) => adminApi.createUser(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  });
}
