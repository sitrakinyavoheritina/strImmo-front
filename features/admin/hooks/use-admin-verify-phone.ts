import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../services/admin-api';

export function useAdminVerifyPhone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.verifyUserPhone(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['admin-user', id] });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });
}
