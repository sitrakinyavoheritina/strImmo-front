'use client';

import Link from 'next/link';
import { Home, Key, Handshake, Building2 } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';

const ROLES = [
  { href: '/inscription/proprietaire', icon: Home, titleKey: 'roleOwner', descKey: 'roleOwnerDescription' },
  { href: '/inscription/locataire', icon: Key, titleKey: 'roleTenant', descKey: 'roleTenantDescription' },
  { href: '/inscription/intermediaire', icon: Handshake, titleKey: 'roleAgent', descKey: 'roleAgentDescription' },
  { href: '/inscription/agence', icon: Building2, titleKey: 'roleAgency', descKey: 'roleAgencyDescription' },
] as const;

/** Écran de sélection de rôle avant l'inscription — même principe que le mobile
 * (Onina-mobile/src/features/auth/screens/role-select-screen.tsx). */
export function RoleSelect() {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {ROLES.map(({ href, icon: Icon, titleKey, descKey }) => (
        <Link
          key={href}
          href={href}
          className="text-left bg-surface-card border border-stroke-default/80 rounded-xl sm:rounded-2xl p-4 hover:border-brand-primary hover:shadow-sm transition"
        >
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-brand-primary-soft text-brand-primary mb-2.5">
            <Icon size={20} />
          </span>
          <p className="font-semibold text-content-main text-sm">{t.auth[titleKey]}</p>
          <p className="text-xs text-content-muted mt-0.5">{t.auth[descKey]}</p>
        </Link>
      ))}
    </div>
  );
}
