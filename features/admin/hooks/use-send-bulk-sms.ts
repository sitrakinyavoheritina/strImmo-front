import { useMutation } from '@tanstack/react-query';
import { adminApi } from '../services/admin-api';
import type { SendBulkSmsPayload } from '../types';

export function useSendBulkSms() {
  return useMutation({
    mutationFn: (payload: SendBulkSmsPayload) => adminApi.sendBulkSms(payload),
  });
}
