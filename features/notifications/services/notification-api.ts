import { apiClient } from '@/lib/api/client';
import type { AppNotification } from '../types/notification.types';

// Forme brute déjà identique au type "app" (voir strImmo/src/notifications/entities/notification.entity.ts)
// — pas de mapper séparé nécessaire, contrairement à property-api.ts/message-api.ts.
export const notificationApi = {
  list: () => apiClient.get<AppNotification[]>('/notifications').then((r) => r.data),
  markAsRead: (id: string) => apiClient.patch<AppNotification>(`/notifications/${id}/read`).then((r) => r.data),
};
