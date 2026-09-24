import Link from 'next/link';
import { MapPinned, Wallet, FileCheck2, Sparkles, type LucideIcon } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';
import { filtersToSearchParams } from '@/features/search/utils/filters-query';
import type { PropertyFilters } from '@/features/search/types/listing.types';
import type { Translations } from '@/lib/i18n/translations';

type QuickFilter = {
  filters: PropertyFilters;
  icon: LucideIcon;
  labelKey: keyof Translations['feed'];
};

// Chaque raccourci construit son URL avec `filtersToSearchParams` — la même mécanique que la
// recherche classique et le panneau IA (voir ai-search-panel.tsx) — plutôt que des paramètres
// ad hoc (`?categorie=maison`) qui ne correspondaient en fait à aucun filtre réel côté
// `/recherche` (bug constaté sur l'ancienne version de ce composant).
const QUICK_FILTERS: QuickFilter[] = [
  // Quartier résidentiel + accès voiture — ces deux champs n'existent que sur maison/terrain
  // (voir ListPropertiesQueryDto), ce raccourci ne fera donc remonter que ces deux types.
  { filters: { isResidentialArea: true, hasCarAccess: true }, icon: MapPinned, labelKey: 'quickFilterCityCenter' },
  { filters: { maxPrice: 1_000_000 }, icon: Wallet, labelKey: 'quickFilterBudget' },
  { filters: { propertyType: 'land', legalStatus: 'titled' }, icon: FileCheck2, labelKey: 'quickFilterTitledLand' },
  { filters: { maxAgeDays: 7 }, icon: Sparkles, labelKey: 'quickFilterNewThisWeek' },
];

/** Grille 2x2 de raccourcis de recherche rapide, sur la page d'accueil et /recherche. */
export function CategoryGrid() {
  const { t } = useTranslation();

  return (
    <div>
      <h3 className="text-sm font-semibold text-content-main mb-2.5">{t.feed.popularCategories}</h3>
      <div className="grid grid-cols-2 gap-2.5">
        {QUICK_FILTERS.map(({ filters, icon: Icon, labelKey }) => (
          <Link
            key={labelKey}
            href={`/recherche?${filtersToSearchParams(filters).toString()}`}
            className="flex flex-col items-center gap-1.5 rounded-xl border border-stroke-default bg-surface-card py-3 px-2 text-center text-[0.85rem] font-medium text-content-main hover:border-brand-primary hover:text-brand-primary transition"
          >
            <Icon size={20} />
            {t.feed[labelKey]}
          </Link>
        ))}
      </div>
    </div>
  );
}
