import Link from 'next/link';
import { Home, Building2, Trees, KeyRound, type LucideIcon } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';
import type { Translations } from '@/lib/i18n/translations';

interface Category {
  href: string;
  icon: LucideIcon;
  labelKey: keyof Translations['feed'];
}

const CATEGORIES: Category[] = [
  { href: '/recherche?categorie=maison', icon: Home, labelKey: 'categoryHouses' },
  { href: '/recherche?categorie=appartement', icon: Building2, labelKey: 'categoryApartments' },
  { href: '/recherche?categorie=terrain', icon: Trees, labelKey: 'categoryLand' },
  { href: '/recherche?type=location', icon: KeyRound, labelKey: 'categoryRentals' },
];

/** Grille 2x2 de raccourcis vers les catégories les plus recherchées. */
export function CategoryGrid() {
  const { t } = useTranslation();

  return (
    <div>
      <h3 className="text-sm font-semibold text-content-main mb-2.5">{t.feed.popularCategories}</h3>
      <div className="grid grid-cols-2 gap-2.5">
        {CATEGORIES.map(({ href, icon: Icon, labelKey }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-1.5 rounded-xl border border-stroke-default bg-surface-card py-3 text-xs font-medium text-content-main hover:border-brand-primary hover:text-brand-primary transition"
          >
            <Icon size={20} />
            {t.feed[labelKey]}
          </Link>
        ))}
      </div>
    </div>
  );
}
