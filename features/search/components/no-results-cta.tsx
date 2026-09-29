import Link from 'next/link';
import { ClipboardList } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';
import type { PropertyFilters } from '../types/listing.types';

// Repris par /demandes/nouvelle (voir ce fichier) pour préremplir le formulaire : mêmes noms de
// champs que PropertyFilters là où ça a un sens (kind/propertyType/communeId), `maxPrice` devient
// `maxBudget` (nom différent côté demande). `location` (texte libre) n'a pas d'équivalent — une
// demande a besoin d'une commune précise (communeId), pas d'un texte de recherche approximatif.
function noResultsCtaHref(filters: PropertyFilters): string {
  const params = new URLSearchParams();
  if (filters.kind) params.set('kind', filters.kind);
  if (filters.propertyType) params.set('propertyType', filters.propertyType);
  if (filters.communeId) params.set('communeId', filters.communeId);
  if (filters.maxPrice) params.set('maxBudget', String(filters.maxPrice));
  const query = params.toString();
  return query ? `/demandes/nouvelle?${query}` : '/demandes/nouvelle';
}

/** Bloc "Aucun résultat" avec proposition de créer une demande — partagé entre l'accueil
 *  (app/home-client.tsx) et la page de résultats (app/recherche/page.tsx), mêmes filtres
 *  (PropertyFilters) et même comportement dans les deux : visible même déconnecté (voir
 *  /demandes/nouvelle, qui renvoie vers /connexion?next=... si besoin, pas cette page). */
export function NoResultsCta({ filters }: { filters: PropertyFilters }) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center text-center py-10 px-4">
      <p className="text-sm text-content-muted">{t.search.noResults}</p>

      <div className="mt-6 w-full max-w-sm bg-surface-card border border-stroke-default/80 rounded-2xl p-5">
        <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-primary-soft text-brand-primary mb-3">
          <ClipboardList size={24} />
        </span>
        <p className="font-bold text-content-main text-base">{t.search.noResultsCtaTitle}</p>
        <p className="text-sm text-content-muted mt-1.5">{t.search.noResultsCtaBody}</p>
        <Link
          href={noResultsCtaHref(filters)}
          className="mt-4 inline-flex items-center justify-center w-full rounded-xl bg-brand-primary text-white font-semibold text-sm py-2.5 hover:bg-brand-primary-hover active:scale-[0.98] transition-all"
        >
          {t.search.noResultsCtaButton}
        </Link>
      </div>
    </div>
  );
}
