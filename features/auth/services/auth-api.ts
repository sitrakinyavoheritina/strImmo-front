import { apiClient } from '@/lib/api/client';
import type { LoginPayload, UserRole, ThemePreference, FeedDisplayPreference } from '../types';

// Forme brute renvoyée par strImmo pour un utilisateur (voir strImmo/src/auth/auth.service.ts).
export type ApiUser = {
  id: string;
  // `null` pour un compte créé via Google (aucun numéro connu, voir loginWithGoogle ci-dessous).
  phone: string | null;
  email: string | null;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  coverUrl: string | null;
  address: string | null;
  phone2: string | null;
  isEmailVerified: boolean;
  hasPassword: boolean;
  role: UserRole;
  themePreference: ThemePreference;
  feedDisplay: FeedDisplayPreference;
};

export type AuthenticatedResponse = { user: ApiUser; access_token: string };
export type PendingResponse = { message: string; userId: string };

export const authApi = {
  login: (payload: LoginPayload) =>
    apiClient.post<AuthenticatedResponse>('/auth/login', payload).then((r) => r.data),

  // Connecte immédiatement, sans rien demander de plus — crée un compte à la volée si l'email
  // Google ne correspond à aucun compte existant (voir strImmo/src/auth/auth.service.ts:
  // loginWithGoogle). `idToken` obtenu côté client via Google Identity Services (voir
  // google-sign-in-button.tsx). `user.phone === null` signale qu'il reste à compléter le profil
  // (voir completeProfile ci-dessous) — géré côté appelant (use-google-auth.ts), pas ici.
  loginWithGoogle: (idToken: string) =>
    apiClient.post<AuthenticatedResponse>('/auth/google', { idToken }).then((r) => r.data),

  // Choix du rôle + téléphone (+ documents pour agent/agency) après une connexion Google — voir
  // strImmo/src/auth/auth.service.ts:completeProfile. Renvoie un nouveau token (le rôle a pu
  // changer depuis la création à la volée).
  completeProfile: (formData: FormData) =>
    apiClient
      .patch<AuthenticatedResponse>('/auth/complete-profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data),

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

  // Mot de passe oublié — code par email uniquement pour l'instant (voir
  // strImmo/src/auth/auth.service.ts:requestPasswordReset). Réponse volontairement générique,
  // ne pas s'en servir pour savoir si un compte existe.
  forgotPassword: (identifier: string) =>
    apiClient.post<{ message: string }>('/auth/forgot-password', { identifier }).then((r) => r.data),

  resetPassword: (payload: { identifier: string; code: string; newPassword: string }) =>
    apiClient.post<{ success: boolean }>('/auth/reset-password', payload).then((r) => r.data),

  // Vérification d'email (facultative, voir /parametres) — authentifiées, contrairement aux deux
  // ci-dessus.
  sendEmailVerification: () =>
    apiClient.post<{ message: string }>('/auth/send-email-verification').then((r) => r.data),

  verifyEmail: (code: string) =>
    apiClient.post<{ isEmailVerified: boolean }>('/auth/verify-email', { code }).then((r) => r.data),
};
