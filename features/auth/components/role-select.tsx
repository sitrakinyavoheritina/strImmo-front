'use client';

import Link from 'next/link';
import { Home, Key, Handshake, Building2 } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';

const ROLES = [
  { href: '/inscription/proprietaire', icon: Home, titleKey: 'roleOwnerChoice', descKey: 'roleOwnerDescription' },
  { href: '/inscription/locataire', icon: Key, titleKey: 'roleTenantChoice', descKey: 'roleTenantDescription' },
  { href: '/inscription/intermediaire', icon: Handshake, titleKey: 'roleAgentChoice', descKey: 'roleAgentDescription' },
  { href: '/inscription/agence', icon: Building2, titleKey: 'roleAgency', descKey: 'roleAgencyDescription' },
] as const;

/** Écran de sélection de rôle avant l'inscription — même principe que le mobile
 * (Onina-mobile/src/features/auth/screens/role-select-screen.tsx). Icône à gauche (~1/5 de la
 * carte) et texte à droite sur la même ligne — demandé explicitement, plutôt que l'icône empilée
 * au-dessus du texte. */
export function RoleSelect() {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {ROLES.map(({ href, icon: Icon, titleKey, descKey }) => (
        <Link
          key={href}
          href={href}
          className="flex items-center gap-3 text-left bg-surface-card border border-stroke-default/80 rounded-xl sm:rounded-2xl p-4 hover:border-brand-primary hover:shadow-sm transition"
        >
          <span className="shrink-0 basis-1/5 aspect-square flex items-center justify-center rounded-xl bg-brand-primary-soft text-brand-primary">
            <Icon size={20} />
          </span>
          <span className="min-w-0">
            <p className="font-semibold text-content-main text-sm">{t.auth[titleKey]}</p>
            <p className="text-[0.85rem] text-content-muted mt-0.5">{t.auth[descKey]}</p>
          </span>
        </Link>
      ))}
    </div>
  );
}
