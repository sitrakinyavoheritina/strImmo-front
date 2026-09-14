import type { User } from '../types';

// Même règle que côté mobile (Onina-mobile/src/features/auth/utils/is-admin.ts) — admin et
// superadmin ont les mêmes droits de modération, seul superadmin gère en plus d'autres comptes
// admin (pas géré ici).
export function isAdmin(user?: User | null): boolean {
  return user?.role === 'admin' || user?.role === 'superadmin';
}
