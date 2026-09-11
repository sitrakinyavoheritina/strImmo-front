'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useHomeSearchFiltersStore } from '@/lib/state/use-home-search-filters-store';
import { FilterModal } from './filter-modal';
import { ActiveFilterChips } from './active-filter-chips';
import { PROPERTY_TYPES, PUBLISHER_TYPES } from './filter-fields';
import { filtersToSearchParams } from '../utils/filters-query';
import type { PropertyFilters, PublisherType } from '../types/listing.types';

// Au-delà de ce défilement, le panneau (barre de recherche + tous les champs) prend une part trop
// importante d'un écran de téléphone — sur les hauteurs les plus courtes, il ne restait plus
// qu'un filet de fil visible pendant le scroll, ce qui pouvait se lire comme "seuls les filtres
// s'affichent" — signalé explicitement par l'utilisateur. Repris de la même logique déjà
// éprouvée côté app mobile (Onina-mobile QuickSearchPanel : isCollapsed/onExpand).
const COLLAPSE_SCROLL_THRESHOLD = 80;
// En dessous de ce défilement, on considère qu'on est "revenu en haut" — réaffiche toujours le
// panneau complet, y compris après une expansion manuelle (voir manualOverrideRef ci-dessous).
const NEAR_TOP_SCROLL_THRESHOLD = 20;

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
 * (demandé explicitement). */
export function MobileSearchPanel() {
  const { t } = useTranslation();
  const router = useRouter();
  const filters = useHomeSearchFiltersStore((state) => state.filters);
  const update = useHomeSearchFiltersStore((state) => state.update);
  const setFilters = useHomeSearchFiltersStore((state) => state.setFilters);
  const selectPropertyType = useHomeSearchFiltersStore((state) => state.selectPropertyType);
  const reset = useHomeSearchFiltersStore((state) => state.reset);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  // Replié pendant le scroll (voir COLLAPSE_SCROLL_THRESHOLD) : ne garde que la barre de
  // recherche, elle, toujours visible, au-dessus (comme sur mobile). Réexpansion manuelle
  // possible (bouton dans le bloc replié) sans attendre de remonter en haut.
  const [isCollapsed, setIsCollapsed] = useState(false);
  // Replier/déplier ce bloc change sa hauteur pendant qu'on est déjà scrollé — Chrome (scroll
  // anchoring) recale alors scrollY tout seul pour garder le même contenu sous les yeux, ce qui
  // redéclenche un événement "scroll" resynthétisé. Sans ce garde-fou, ce second événement
  // artificiel (scrollY toujours > COLLAPSE_SCROLL_THRESHOLD) repliait aussitôt le panneau qu'on
  // venait de rouvrir manuellement — bug constaté en testant le bouton d'expansion. Le
  // contournement : une fois déplié à la main, on ignore le repli automatique tant qu'on n'est
  // pas réellement revenu en haut (voir NEAR_TOP_SCROLL_THRESHOLD), plutôt que d'essayer de
  // distinguer un "vrai" scroll utilisateur d'un recalage automatique.
  const manualOverrideRef = useRef(false);

  useEffect(() => {
    function handleScroll() {
      const y = window.scrollY;
      if (y <= NEAR_TOP_SCROLL_THRESHOLD) {
        manualOverrideRef.current = false;
        setIsCollapsed(false);
        return;
      }
      if (manualOverrideRef.current) return;
      setIsCollapsed(y > COLLAPSE_SCROLL_THRESHOLD);
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  function handleManualExpand() {
    manualOverrideRef.current = true;
    setIsCollapsed(false);
  }

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
          onChange={(event) => update('location', event.target.value || undefined)}
          placeholder={t.hero.searchBarPlaceholder}
          className="flex-1 min-w-0 text-sm text-content-main placeholder-content-muted outline-none"
        />
        {(filters.location || Object.keys(filters).length > 0) && (
          <button type="button" onClick={reset} aria-label={t.search.reset} className="shrink-0 text-content-muted">
            <X size={18} />
          </button>
        )}
      </div>

      {isCollapsed ? (
        <div className="flex items-center gap-1.5">
          <div className="flex-1 min-w-0">
            <ActiveFilterChips filters={filters} onRemove={handleRemoveFilter} />
          </div>
          <button
            type="button"
            onClick={handleManualExpand}
            aria-label={t.search.moreFilters}
            className="shrink-0 flex items-center justify-center w-9 h-9 rounded-full border border-stroke-default bg-surface-card text-brand-primary shadow-sm"
          >
            <SlidersHorizontal size={16} />
          </button>
        </div>
      ) : (
        <>
          {/* Une seule ligne, défilable horizontalement (pas de retour à la ligne) : les 4
              libellés mis bout à bout ne tiennent pas sur un écran de 390px sans rétrécir le
              texte à l'illisible — demandé explicitement de les garder tous sur la même ligne
              plutôt que de les empiler. */}
          <div className="flex gap-1.5 overflow-x-auto scroll-touch pb-0.5 -mx-0.5 px-0.5">
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
        </>
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
