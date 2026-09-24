'use client';

import { useTranslation } from '@/lib/i18n/use-translation';
import Link from 'next/link';

/** Habillage commun (logo, titre, sous-titre) partagé par connexion, sélection de rôle et les 4
 * formulaires d'inscription — évite de le répéter dans chacune des 6 pages. */
export function AuthPageShell({
  title,
  subtitle,
  children,
  maxWidthClassName = 'sm:max-w-md',
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  maxWidthClassName?: string;
}) {
  const { t } = useTranslation();
  return (
    <div className="bg-surface-app flex flex-col justify-start sm:justify-center py-4 sm:py-12 px-4 sm:px-6 lg:px-8 sm:min-h-[calc(100dvh-3.5rem)]">
      <div className={`sm:mx-auto sm:w-full ${maxWidthClassName} text-center`}>
        <Link href="/" className="inline-block mb-1.5 sm:mb-3">
          {/* eslint-disable-next-line @next/next/no-img-element -- logo décoratif (SVG statique dans /public) */}
          <img src="/logo.svg" alt="Onina" className="h-9 sm:h-12 w-auto mx-auto" />
        </Link>
        {/* Slogan de marque sous le logo : "L'immobilier à Madagascar" + "Trouvez. Fondez. Habitez." */}
        <p className="text-[12px] sm:text-[0.85rem] font-semibold text-brand-primary mb-1 sm:mb-2">
          {t.hero.title} · {t.hero.subtitle}
        </p>
        <h2 className="text-lg sm:text-2xl font-bold text-content-main tracking-tight">{title}</h2>
        <p className="mt-0.5 sm:mt-1 text-[0.85rem] sm:text-sm text-content-muted">{subtitle}</p>
      </div>

      <div className={`mt-3 sm:mt-8 sm:mx-auto sm:w-full ${maxWidthClassName}`}>{children}</div>
    </div>
  );
}
