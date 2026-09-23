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
  // NIF/STAT facultatifs (archive, jamais affichés sur le profil) : soit les photos (`nif`/`stat`),
  // soit les numéros saisis à la main, soit rien.
  nif?: File | null;
  stat?: File | null;
  nifNumber?: string;
  statNumber?: string;
  // Vitrine publique de l'agence — tout facultatif (voir AgencyProfile côté backend).
  website?: string;
  facebookUrl?: string;
  description?: string;
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

// Complète un compte créé via "Se connecter avec Google" (voir /completer-profil,
// strImmo/src/auth/auth.service.ts:completeProfile) — mêmes champs que l'inscription classique
// selon le rôle choisi, sans mot de passe (déjà géré côté serveur pour un compte Google).
export interface CompleteProfilePayload {
  role: 'owner' | 'tenant' | 'agent' | 'agency';
  phone: string;
  agencyName?: string;
  address?: string;
  cinRecto?: File | null;
  cinVerso?: File | null;
  nif?: File | null;
  stat?: File | null;
  nifNumber?: string;
  statNumber?: string;
}

export interface UpdateProfilePayload {
  /** Absent uniquement pour un compte sans vrai mot de passe (voir User.hasPassword) — requis pour
   *  tous les autres, validé côté formulaire (voir profil/modifier/page.tsx:validate). */
  currentPassword: string | undefined;
  firstName?: string;
  lastName?: string;
  email?: string;
  address?: string;
  /** Contact secondaire du compte — sert de valeur par défaut pour `phone2` de chaque nouvelle
   *  annonce (voir property-form.tsx), modifiable ensuite annonce par annonce. */
  phone2?: string;
  newPassword?: string;
  avatar?: File | null;
  cover?: File | null;
}

export type ThemePreference = 'system' | 'light' | 'dark';
export type FeedDisplayPreference = 'card' | 'list';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  /** Absent tant qu'un compte créé via "Se connecter avec Google" n'a pas complété son profil
   *  (Google ne fournit jamais de numéro) — c'est ce qui signale qu'il faut rediriger vers
   *  /completer-profil, voir use-google-auth.ts et strImmo/src/auth/auth.service.ts:
   *  loginWithGoogle/completeProfile. */
  phone?: string;
  email?: string;
  avatarUrl?: string;
  coverUrl?: string;
  address?: string;
  phone2?: string;
  isEmailVerified: boolean;
  /** `false` uniquement pour un compte créé via "Se connecter avec Google" qui n'a jamais lui-même
   *  choisi de mot de passe (voir strImmo/src/auth/entities/user.entity.ts) — /profil/modifier
   *  n'exige alors pas le mot de passe actuel, qu'il ne peut de toute façon pas connaître. */
  hasPassword: boolean;
  role: UserRole;
  themePreference: ThemePreference;
  feedDisplay: FeedDisplayPreference;
}
