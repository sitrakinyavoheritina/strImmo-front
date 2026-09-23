import type { UserRole } from '../types';

// Clé de traduction (t.auth.roleXxx) pour chaque rôle — partagé entre /profil (soi-même, tous les
// rôles possibles) et /profil/[id] (profil public, seulement owner/agent/agency puisque dérivé des
// annonces publiées, voir ce fichier).
export const ROLE_LABEL_KEY = {
  owner: 'roleOwner',
  tenant: 'roleTenant',
  agent: 'roleAgent',
  agency: 'roleAgency',
  admin: 'roleAdmin',
  superadmin: 'roleSuperadmin',
} as const satisfies Record<UserRole, string>;
