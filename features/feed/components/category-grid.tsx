import Link from 'next/link';
import { Home, Building2, Castle, Trees, type LucideIcon } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';
import type { Translations } from '@/lib/i18n/translations';

interface Category {
  href: string;
  icon: LucideIcon;
  labelKey: keyof Translations['feed'];
}

// Pages catégories SEO (voir app/[categorie]/page.tsx) — mêmes liens que ceux lus par Google.
const CATEGORIES: Category[] = [
  { href: '/maison', icon: Home, labelKey: 'categoryHouses' },
  { href: '/appartement', icon: Building2, labelKey: 'categoryApartments' },
  { href: '/villa', icon: Castle, labelKey: 'categoryVillas' },
  { href: '/terrain', icon: Trees, labelKey: 'categoryLand' },
];

/** Grille 2x2 des catégories de biens, dans la colonne de droite (desktop). */
export function CategoryGrid() {
  const { t } = useTranslation();

  return (
    <div>
      <h3 className="text-sm font-semibold text-content-main mb-1.5">{t.feed.popularCategories}</h3>
      <div className="grid grid-cols-2 gap-1.5">
        {CATEGORIES.map(({ href, icon: Icon, labelKey }) => (
          <Link
            key={href}
            href={href}
            className="group grid grid-cols-[1fr_4fr] items-stretch overflow-hidden rounded-lg border border-stroke-default bg-surface-card text-xs leading-tight font-medium text-content-main hover:border-brand-primary hover:text-brand-primary transition"
          >
            {/* 1/5 de la carte pour l'icône (fond coloré), 4/5 pour le texte. */}
            <span className="flex items-center justify-center bg-brand-primary-soft text-brand-primary py-1">
              <Icon size={15} />
            </span>
            <span className="flex items-center px-1.5 py-1">{t.feed[labelKey]}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
