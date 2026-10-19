import { apiClient } from '@/lib/api/client';
import type { ApiProperty } from '@/features/search/services/property-api';
import type { PropertyRequest } from '@/features/property-requests/types/property-request.types';
import type { ApiConversation } from '@/features/messages/services/message-api';
import type {
  AdminConversationDetail,
  AdminMessagingStats,
  AdminSearchUser,
  AdminUser,
  AdminUserDetail,
  AdminUserMessagingStats,
  BroadcastResult,
  CreateUserAsAdminPayload,
  CreateUserAsAdminResponse,
  ErrorLogsParams,
  ErrorLogsResponse,
  SendBulkEmailPayload,
  SendBulkSmsPayload,
} from '../types';

export const adminApi = {
  // Réservé admin/superadmin — voir strImmo/src/auth/auth.controller.ts:listUsers (403 sinon).
  listUsers: () => apiClient.get<AdminUser[]>('/auth/users').then((r) => r.data),

  // Suppression définitive — le backend refuse son propre compte et tout compte admin (403).
  // Fiche d'un compte en lecture seule — voir strImmo/src/auth/auth.controller.ts:getUserDetail.
  getUser: (id: string) => apiClient.get<AdminUserDetail>(`/auth/users/${id}`).then((r) => r.data),

  // Journal d'erreurs (admin/superadmin) — voir strImmo/src/error-logs/error-logs.controller.ts.
  listErrorLogs: (params: ErrorLogsParams) =>
    apiClient.get<ErrorLogsResponse>('/error-logs', { params }).then((r) => r.data),

  deleteUser: (id: string) => apiClient.delete<{ deleted: boolean }>(`/auth/users/${id}`).then((r) => r.data),

  // Contourne l'OTP pour un compte owner/agent/agency bloqué faute de l'avoir reçu/confirmé — voir
  // strImmo/src/auth/auth.service.ts:adminVerifyPhone.
  verifyUserPhone: (id: string) =>
    apiClient.patch<{ isPhoneVerified: boolean }>(`/auth/users/${id}/verify-phone`).then((r) => r.data),

  // Création directe par un admin (pas d'OTP, mot de passe fixe partagé) — voir
  // strImmo/src/auth/auth.service.ts:createUserAsAdmin.
  createUser: (payload: CreateUserAsAdminPayload) =>
    apiClient.post<CreateUserAsAdminResponse>('/auth/admin/users', payload).then((r) => r.data),

  // Recherche n'importe quel utilisateur (hors admin/superadmin) pour publier une annonce/demande
  // pour son compte — voir strImmo/src/auth/auth.service.ts:searchUsersAsAdmin.
  searchUsers: (query: string) =>
    apiClient.get<AdminSearchUser[]>('/auth/admin/search-users', { params: { query } }).then((r) => r.data),

  // Multipart, mêmes champs que la création normale + `targetUserId` déjà ajouté au FormData par
  // l'appelant — voir strImmo/src/properties/properties.controller.ts:createAsAdmin.
  createPropertyAsAdmin: (formData: FormData) =>
    apiClient
      .post<ApiProperty>('/properties/admin', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((r) => r.data),

  // JSON, voir strImmo/src/property-requests/property-requests.controller.ts:createAsAdmin.
  createPropertyRequestAsAdmin: (payload: Record<string, unknown>) =>
    apiClient.post<PropertyRequest>('/property-requests/admin', payload).then((r) => r.data),

  // Statistiques globales de la messagerie — voir strImmo/src/messaging/messaging.service.ts:getAdminStats.
  getMessagingStats: () =>
    apiClient.get<AdminMessagingStats>('/conversations/admin/stats').then((r) => r.data),

  // Statistiques d'un utilisateur précis — voir
  // strImmo/src/messaging/messaging.service.ts:getAdminUserStats.
  getUserMessagingStats: (userId: string) =>
    apiClient.get<AdminUserMessagingStats>(`/conversations/admin/stats/${userId}`).then((r) => r.data),

  // Conversations d'un utilisateur précis (avec qui il discute) — même forme que
  // GET /conversations (voir messageApi.listConversations), réutilisable avec toConversation.
  getUserConversations: (userId: string) =>
    apiClient.get<ApiConversation[]>(`/conversations/admin/user/${userId}`).then((r) => r.data),

  // Contenu complet d'une conversation (modération) — voir
  // strImmo/src/messaging/messaging.service.ts:getConversationAsAdmin.
  getConversation: (id: string) =>
    apiClient.get<AdminConversationDetail>(`/conversations/admin/${id}`).then((r) => r.data),

  // Aperçu du nombre de destinataires avant un envoi en masse — voir
  // strImmo/src/broadcast/broadcast.service.ts:countRecipients.
  getBroadcastRecipientsCount: (channel: 'sms' | 'email') =>
    apiClient.get<{ count: number }>('/broadcast/recipients-count', { params: { channel } }).then((r) => r.data.count),

  // Envoi en masse par SMS (admin/superadmin) — voir strImmo/src/broadcast/broadcast.service.ts:sendBulkSms.
  sendBulkSms: (payload: SendBulkSmsPayload) =>
    apiClient.post<BroadcastResult>('/broadcast/sms', payload).then((r) => r.data),

  // Envoi en masse par email (admin/superadmin) — voir strImmo/src/broadcast/broadcast.service.ts:sendBulkEmail.
  sendBulkEmail: (payload: SendBulkEmailPayload) =>
    apiClient.post<BroadcastResult>('/broadcast/email', payload).then((r) => r.data),
};
