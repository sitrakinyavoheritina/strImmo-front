'use client';

import Link from 'next/link';
import { useTranslation } from '@/lib/i18n/use-translation';
import { filtersToSearchParams } from '@/features/search/utils/filters-query';
import { useDeletePropertyRequest, useUpdatePropertyRequestVisibility } from '../hooks/use-property-requests';
import { requestSentence } from '../utils/request-summary';
import type { PropertyRequest } from '../types/property-request.types';

/** Carte d'une de MES demandes — utilisée sur /demandes (onglet "Mes demandes") et sur
 *  /mes-biens (section "Mes demandes", à côté des annonces) : mêmes actions partout (voir les
 *  résultats, rendre publique/privée, supprimer), pas de duplication entre les deux écrans. */
export function MyRequestCard({ request }: { request: PropertyRequest }) {
  const { t, locale } = useTranslation();
  const { mutate: updateVisibility, isPending: isTogglingVisibility } = useUpdatePropertyRequestVisibility();
  const { mutate: remove, isPending: isDeleting } = useDeletePropertyRequest();

  const resultsHref = `/recherche?${filtersToSearchParams({
    kind: request.kind,
    propertyType: request.propertyType,
    communeId: request.communeId,
    minPrice: request.minBudget,
    maxPrice: request.maxBudget,
  }).toString()}`;

  return (
    <div className="bg-surface-card border border-stroke-default/80 rounded-xl p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm text-content-main whitespace-pre-line">{requestSentence(request, locale)}</p>
        </div>
        <span
          className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
            request.isPublic ? 'bg-brand-primary-soft text-brand-primary' : 'bg-surface-app text-content-muted border border-stroke-default'
          }`}
        >
          {request.isPublic ? t.propertyRequestsPage.publicBadge : t.propertyRequestsPage.privateBadge}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-3 mt-2.5">
        <Link href={resultsHref} className="text-[0.85rem] font-semibold text-brand-primary hover:underline">
          {t.propertyRequestsPage.viewResults}
        </Link>
        <button
          type="button"
          disabled={isTogglingVisibility}
          onClick={() => updateVisibility({ id: request.id, isPublic: !request.isPublic })}
          className="text-[0.85rem] font-semibold text-content-muted hover:text-content-main disabled:opacity-50"
        >
          {request.isPublic ? t.propertyRequestsPage.makePrivate : t.propertyRequestsPage.makePublic}
        </button>
        <button
          type="button"
          disabled={isDeleting}
          onClick={() => {
            if (window.confirm(t.propertyRequestsPage.deleteConfirm)) remove(request.id);
          }}
          className="text-[0.85rem] font-semibold text-danger hover:underline disabled:opacity-50"
        >
          {t.propertyRequestsPage.delete}
        </button>
      </div>
    </div>
  );
}
