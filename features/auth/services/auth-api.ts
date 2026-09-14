import { apiClient } from '@/lib/api/client';
import type { LoginPayload, UserRole, ThemePreference, FeedDisplayPreference } from '../types';

// Forme brute renvoyée par strImmo pour un utilisateur (voir strImmo/src/auth/auth.service.ts).
export type ApiUser = {
  id: string;
  phone: string;
  email: string | null;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  address: string | null;
  role: UserRole;
  themePreference: ThemePreference;
  feedDisplay: FeedDisplayPreference;
};

export type AuthenticatedResponse = { user: ApiUser; access_token: string };
export type PendingResponse = { message: string; userId: string };

export const authApi = {
  login: (payload: LoginPayload) =>
    apiClient.post<AuthenticatedResponse>('/auth/login', payload).then((r) => r.data),

  registerOwner: (payload: { firstName: string; lastName: string; phone: string; email?: string; password: string }) =>
    apiClient.post<AuthenticatedResponse>('/auth/register/owner', payload).then((r) => r.data),

  registerTenant: (payload: { firstName: string; lastName: string; phone: string; email?: string; password: string }) =>
    apiClient.post<AuthenticatedResponse>('/auth/register/tenant', payload).then((r) => r.data),

  // Pas de session ouverte pour agent/agency (compte "pending", voir strImmo/src/auth/services).
  registerAgent: (formData: FormData) =>
    apiClient
      .post<PendingResponse>('/auth/register/agent', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data),

  registerAgency: (formData: FormData) =>
    apiClient
      .post<ApiUser>('/auth/register/agency', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data),

  updateProfile: (formData: FormData) =>
    apiClient
      .patch<ApiUser>('/auth/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data),

  // Pas de mot de passe requis ici (contrairement à updateProfile) — préférences d'affichage, pas
  // des données sensibles du compte (voir strImmo/src/auth/auth.controller.ts).
  updatePreferences: (payload: { themePreference?: ThemePreference; feedDisplay?: FeedDisplayPreference }) =>
    apiClient
      .patch<{ themePreference: ThemePreference; feedDisplay: FeedDisplayPreference }>('/auth/preferences', payload)
      .then((r) => r.data),
};
