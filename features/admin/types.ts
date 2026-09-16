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
  isPhoneVerified: boolean;
  createdAt: string;
  moderationStatus?: 'pending' | 'approved' | 'rejected';
  agencyName?: string;
}
