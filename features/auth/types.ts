export type AuthMethod = 'phone' | 'email';

export type UserRole = 'owner' | 'tenant' | 'agent' | 'agency' | 'admin' | 'superadmin';

export interface LoginPayload {
  identifier: string; // numéro de téléphone ou adresse email
  password: string;
}

interface RegisterBaseFields {
  firstName: string;
  lastName: string;
  phone: string;
  password: string;
}

export type RegisterOwnerPayload = RegisterBaseFields & { role: 'owner'; email?: string };
export type RegisterTenantPayload = RegisterBaseFields & { role: 'tenant'; email?: string };
export type RegisterAgentPayload = RegisterBaseFields & {
  role: 'agent';
  cinRecto: File | null;
  cinVerso: File | null;
};
export type RegisterAgencyPayload = RegisterBaseFields & {
  role: 'agency';
  email: string;
  agencyName: string;
  address: string;
  nif: File | null;
  stat: File | null;
};

export type RegisterPayload =
  | RegisterOwnerPayload
  | RegisterTenantPayload
  | RegisterAgentPayload
  | RegisterAgencyPayload;

// Issue d'une inscription owner/tenant (session ouverte immédiatement) vs agent/agency (compte en
// attente de validation admin, aucun token renvoyé) — voir strImmo/src/auth/services/*.
export type RegisterResult =
  | { status: 'authenticated'; user: User; token: string }
  | { status: 'pending' };

export interface UpdateProfilePayload {
  currentPassword: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  address?: string;
  /** Contact secondaire du compte — sert de valeur par défaut pour `phone2` de chaque nouvelle
   *  annonce (voir property-form.tsx), modifiable ensuite annonce par annonce. */
  phone2?: string;
  newPassword?: string;
  avatar?: File | null;
}

export type ThemePreference = 'system' | 'light' | 'dark';
export type FeedDisplayPreference = 'card' | 'list';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;
  email?: string;
  avatarUrl?: string;
  address?: string;
  phone2?: string;
  role: UserRole;
  themePreference: ThemePreference;
  feedDisplay: FeedDisplayPreference;
}
