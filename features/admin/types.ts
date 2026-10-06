import type { UserRole } from '@/features/auth/types';

// Forme renvoyée par GET /auth/users (voir strImmo/src/auth/auth.service.ts:listUsers) — jamais
// le mot de passe. `moderationStatus`/`agencyName` ne concernent qu'un compte agent/agency (voir
// agent_profiles/agency_profiles), absents sinon.
export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  email: string | null;
  avatarUrl: string | null;
  role: UserRole;
  isEmailVerified: boolean;
  hasPassword: boolean;
  isPhoneVerified: boolean;
  createdAt: string;
  moderationStatus?: 'pending' | 'approved' | 'rejected';
  agencyName?: string;
  createdByAdmin: boolean;
  isAnonymous: boolean;
}

// Forme renvoyée par GET /error-logs (voir strImmo/src/error-logs) — téléphone/email jamais en clair
// (`identifierMasked`), jamais de mot de passe ni de code.
export type ErrorLogSource = 'http' | 'sms' | 'email' | 'push' | 'upload';

export interface ErrorLogItem {
  id: string;
  createdAt: string;
  source: ErrorLogSource;
  level: 'warn' | 'error';
  method: string | null;
  path: string | null;
  statusCode: number | null;
  message: string;
  userId: string | null;
  identifierMasked: string | null;
  userAgent: string | null;
  stack: string | null;
}

export interface ErrorLogsResponse {
  items: ErrorLogItem[];
  total: number;
  retentionDays: number;
}

export interface ErrorLogsParams {
  search?: string;
  statusCode?: number;
  source?: ErrorLogSource;
  limit: number;
}

// Forme renvoyée par GET /auth/users/:id (voir strImmo/src/auth/auth.service.ts:getUserDetail) —
// consultation seule : jamais le mot de passe ni les liens vers les pièces d'identité.
export interface AdminUserDetail {
  id: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  phone2: string | null;
  email: string | null;
  address: string | null;
  avatarUrl: string | null;
  role: UserRole;
  hasPassword: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
  createdByAdmin: boolean;
  isAnonymous: boolean;
  agentProfile: { status: 'pending' | 'approved' | 'rejected'; rejectionReason: string | null; hasCin: boolean } | null;
  agencyProfile: {
    agencyName: string;
    address: string;
    status: 'pending' | 'approved' | 'rejected';
    rejectionReason: string | null;
    website: string | null;
    facebookUrl: string | null;
    description: string | null;
    nifNumber: string | null;
    statNumber: string | null;
    hasNif: boolean;
    hasStat: boolean;
  } | null;
  properties: {
    id: string;
    title: string;
    location: string;
    price: number;
    kind: 'sale' | 'rent';
    propertyType: string;
    moderationStatus: 'pending' | 'approved' | 'rejected';
    createdAt: string;
  }[];
}

// Payload de POST /auth/admin/users (voir strImmo/src/auth/dto/create-user-as-admin.dto.ts) —
// `agency` ne demande ni CIN ni document (seuls agencyName/address sont obligatoires), `agent`
// reste hors de ce formulaire (voir AuthService.createUserAsAdmin).
export interface CreateUserAsAdminPayload {
  role: 'owner' | 'tenant' | 'agency';
  isAnonymous: boolean;
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  // Obligatoires si role === 'agency', ignorés sinon.
  agencyName?: string;
  address?: string;
}

// Forme renvoyée par POST /auth/admin/users (voir AuthService.createUserAsAdmin) — `sharedPassword`
// est le mot de passe fixe partagé par tous les comptes créés par un admin, à communiquer
// soi-même (jamais envoyé par SMS/email).
export interface CreateUserAsAdminResponse {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string | null;
    email: string | null;
    role: 'owner' | 'tenant' | 'agency';
    isPhoneVerified: boolean;
    createdByAdmin: boolean;
    isAnonymous: boolean;
    agencyName?: string;
  };
  sharedPassword: string;
}

// Forme renvoyée par GET /auth/admin/search-users (voir AuthService.searchUsersAsAdmin) — pour
// choisir l'utilisateur "pour le compte de qui" publier une annonce/demande.
export interface AdminSearchUser {
  id: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: UserRole;
  isAnonymous: boolean;
}
