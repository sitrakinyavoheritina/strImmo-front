import { useMutation } from '@tanstack/react-query';
import { adminApi } from '../services/admin-api';
import type { SendBulkEmailPayload } from '../types';

export function useSendBulkEmail() {
  return useMutation({
    mutationFn: (payload: SendBulkEmailPayload) => adminApi.sendBulkEmail(payload),
  });
}
