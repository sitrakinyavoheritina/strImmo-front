'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useHomeSearchFiltersStore } from '@/lib/state/use-home-search-filters-store';
import { FilterModal } from './filter-modal';
import { ActiveFilterChips } from './active-filter-chips';
import { PROPERTY_TYPES, PUBLISHER_TYPES } from './filter-fields';
import { filtersToSearchParams } from '../utils/filters-query';
import type { PropertyFilters, PublisherType } from '../types/listing.types';

/** Ligne de choix exclusifs pleine largeur (ici : Propriétaire/Intermédiaire/Agence) — même
 * principe que le SegmentedControl de l'app mobile (Onina-mobile), repris ici pour le web plutôt
 * que d'ajouter un composant partagé pour ce seul usage. */
function SegmentedRow<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T | undefined;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex rounded-full border border-stroke-default overflow-hidden bg-surface-card shadow-sm">
      {options.map((option) => {
        const isSelected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`flex-1 py-2.5 text-sm font-semibold transition ${
              isSelected ? 'bg-brand-primary text-white' : 'text-content-main hover:bg-surface-app'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

/** Version mobile (< sm) de la barre de recherche de l'accueil — reprend la mise en page de
 * l'app mobile (Onina-mobile QuickSearchPanel) : champs empilés pleine largeur plutôt que la
 * rangée qui s'enroule sur elle-même côté desktop (QuickSearchForm), demandé explicitement par
 * l'utilisateur ("rendre le Next.js en version responsive mobile comme le React Native"). Ne
 * remplace QuickSearchForm qu'en dessous de `sm:` — voir search-section.tsx.
 *
 * Louer/Acheter reste petit (pas pleine largeur) sur la dernière ligne, à côté de "Plus de
 * filtres" — pas de bouton "Rechercher" séparé : chaque sélection modifie directement les filtres
 * partagés, et "Plus de filtres" ouvre la feuille complète qui a son propre bouton de recherche
 * (demandé explicitement).
 *
 * Repli/déploiement au scroll : `isCollapsed` et `onManualExpand` viennent de `SearchSection`, qui
 * les pilote via un `IntersectionObserver` sur une sentinelle placée AVANT la section sticky (pas
 * un écouteur "scroll" ici). Plusieurs versions à base de scroll (seuil unique, seuils avec
 * hystérésis, valeur continue) clignotaient sur mobile : ce bloc étant dans un conteneur `sticky`,
 * le replier/déplier change la hauteur de ce qui est collé en haut, ce qui décale le contenu en
 * dessous et redéclenche un événement "scroll" de compensation du navigateur — un aller-retour qui
 * s'auto-entretient. Une sentinelle placée hors de la section sticky ne bouge, elle, jamais à
 * cause de nos propres changements de hauteur : sa position ne dépend que du vrai scroll de la
 * page, ce qui casse la boucle à la racine plutôt que d'essayer de la rendre moins sensible. */
export function MobileSearchPanel({
  isCollapsed,
  onManualExpand,
}: {
  isCollapsed: boolean;
  onManualExpand: () => void;
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const filters = useHomeSearchFiltersStore((state) => state.filters);
  const update = useHomeSearchFiltersStore((state) => state.update);
  const setFilters = useHomeSearchFiltersStore((state) => state.setFilters);
  const selectPropertyType = useHomeSearchFiltersStore((state) => state.selectPropertyType);
  const reset = useHomeSearchFiltersStore((state) => state.reset);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  // Avant toute interaction, seule la barre de recherche est visible (rien en dessous, pas même
  // les puces/le bouton pour déplier) — demandé explicitement, pour ne pas surcharger l'écran tant
  // que l'utilisateur n'a pas commencé à chercher. Se déclenche à la première frappe dans l'input
  // et ne revient plus en arrière ensuite (effacer le texte ne recache pas les filtres déjà
  // choisis). Initialisé à `true` si des filtres sont déjà actifs à l'arrivée sur la page (retour
  // depuis une recherche précédente) — sinon leurs puces seraient masquées de façon surprenante.
  const [hasStartedTyping, setHasStartedTyping] = useState(() => Object.keys(filters).length > 0);

  function handleRemoveFilter(key: keyof PropertyFilters) {
    if (key === 'propertyType') {
      selectPropertyType(undefined);
    } else {
      update(key, undefined);
    }
  }

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2 rounded-full border border-stroke-default bg-surface-card px-4 py-3 shadow-sm">
        <Search size={18} className="text-content-muted shrink-0" />
        <input
          value={filters.location ?? ''}
          onChange={(event) => {
            const value = event.target.value;
            update('location', value || undefined);
            if (value.trim().length > 0) setHasStartedTyping(true);
          }}
          placeholder={t.hero.searchBarPlaceholder}
          className="flex-1 min-w-0 text-sm text-content-main placeholder-content-muted outline-none"
        />
        {(filters.location || Object.keys(filters).length > 0) && (
          <button type="button" onClick={reset} aria-label={t.search.reset} className="shrink-0 text-content-muted">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Rien sous la barre de recherche tant que l'utilisateur n'a pas commencé à taper (voir
          `hasStartedTyping`) — demandé explicitement pour ne pas surcharger l'écran au chargement.
          Les deux blocs (replié / déplié) restent ensuite tous les deux montés en permanence —
          seule leur hauteur (via `grid-template-rows`, animable contrairement à `height: auto`) et
          leur opacité sont animées, plutôt qu'un démontage/remontage brutal du DOM à chaque
          bascule. Transition courte (200ms) : assez pour ne pas être un à-coup sec, assez peu pour
          ne pas laisser le temps à un empilement d'événements "scroll" tactiles de s'accumuler
          dessus. */}
      {hasStartedTyping && (
        <div>
      <div
        className="grid transition-[grid-template-rows] duration-200 ease-out"
        style={{ gridTemplateRows: isCollapsed ? '1fr' : '0fr' }}
      >
        <div
          className={`overflow-hidden min-h-0 transition-opacity duration-150 ${isCollapsed ? 'opacity-100 delay-75' : 'opacity-0'}`}
        >
          <div className="flex items-center gap-1.5 pt-0.5">
            <div className="flex-1 min-w-0">
              <ActiveFilterChips filters={filters} onRemove={handleRemoveFilter} />
            </div>
            <button
              type="button"
              onClick={onManualExpand}
              aria-label={t.search.moreFilters}
              className="shrink-0 flex items-center justify-center w-9 h-9 rounded-full border border-stroke-default bg-surface-card text-brand-primary shadow-sm"
            >
              <SlidersHorizontal size={16} />
            </button>
          </div>
        </div>
      </div>

      <div
        className="grid transition-[grid-template-rows] duration-200 ease-out"
        style={{ gridTemplateRows: isCollapsed ? '0fr' : '1fr' }}
      >
        <div
          className={`overflow-hidden min-h-0 space-y-2.5 transition-opacity duration-150 ${isCollapsed ? 'opacity-0' : 'opacity-100 delay-75'}`}
        >
          {/* Une seule ligne, défilable horizontalement (pas de retour à la ligne) : les 4
              libellés mis bout à bout ne tiennent pas sur un écran de 390px sans rétrécir le
              texte à l'illisible — demandé explicitement de les garder tous sur la même ligne
              plutôt que de les empiler. */}
          <div className="flex gap-1.5 overflow-x-auto scroll-touch pb-0.5 -mx-0.5 px-0.5 pt-0.5">
            {PROPERTY_TYPES.map(({ value, labelKey }) => {
              const isSelected = filters.propertyType === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => selectPropertyType(isSelected ? undefined : value)}
                  className={`shrink-0 px-3.5 py-2 rounded-full text-sm font-semibold border shadow-sm transition ${
                    isSelected
                      ? 'bg-brand-primary text-white border-brand-primary'
                      : 'bg-surface-card text-content-main border-stroke-default'
                  }`}
                >
                  {t.search[labelKey]}
                </button>
              );
            })}
          </div>

          <div className="flex gap-2">
            <input
              type="number"
              min={0}
              value={filters.minPrice ?? ''}
              onChange={(event) => update('minPrice', event.target.value ? Number(event.target.value) : undefined)}
              placeholder={t.search.minPrice}
              className="flex-1 min-w-0 rounded-2xl border border-stroke-default bg-surface-card px-4 py-3 text-sm font-semibold text-content-main placeholder-content-muted outline-none focus:border-brand-primary"
            />
            <input
              type="number"
              min={0}
              value={filters.maxPrice ?? ''}
              onChange={(event) => update('maxPrice', event.target.value ? Number(event.target.value) : undefined)}
              placeholder={t.search.maxPrice}
              className="flex-1 min-w-0 rounded-2xl border border-stroke-default bg-surface-card px-4 py-3 text-sm font-semibold text-content-main placeholder-content-muted outline-none focus:border-brand-primary"
            />
          </div>

          <SegmentedRow<PublisherType>
            value={filters.publisherType}
            options={PUBLISHER_TYPES.map(({ value, labelKey }) => ({ value, label: t.search[labelKey] }))}
            onChange={(value) => update('publisherType', filters.publisherType === value ? undefined : value)}
          />

          <div className="flex items-center justify-between gap-2">
            <div className="flex rounded-full border border-stroke-default overflow-hidden shrink-0">
              <button
                type="button"
                onClick={() => update('kind', filters.kind === 'rent' ? undefined : 'rent')}
                className={`px-4 py-2.5 text-sm font-semibold transition ${
                  filters.kind === 'rent' ? 'bg-brand-primary text-white' : 'text-content-muted hover:bg-surface-app'
                }`}
              >
                {t.search.rent}
              </button>
              <button
                type="button"
                onClick={() => update('kind', filters.kind === 'sale' ? undefined : 'sale')}
                className={`px-4 py-2.5 text-sm font-semibold transition border-l border-stroke-default ${
                  filters.kind === 'sale' ? 'bg-brand-primary text-white' : 'text-content-muted hover:bg-surface-app'
                }`}
              >
                {t.search.buy}
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsFilterModalOpen(true)}
              className="flex items-center gap-1 text-sm font-bold text-brand-primary"
            >
              <SlidersHorizontal size={14} />
              {t.search.moreFilters}
            </button>
          </div>

          <ActiveFilterChips filters={filters} onRemove={handleRemoveFilter} />
        </div>
      </div>
        </div>
      )}

      {isFilterModalOpen && (
        <FilterModal
          onClose={() => setIsFilterModalOpen(false)}
          filters={filters}
          onApply={(next) => {
            setFilters(next);
            router.push(`/recherche?${filtersToSearchParams(next).toString()}`);
          }}
        />
      )}
    </div>
  );
}
