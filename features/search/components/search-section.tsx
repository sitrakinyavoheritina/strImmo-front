'use client';

import { useState } from 'react';
import { Sparkles, Search } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';
import { useHomeSearchFiltersStore } from '@/lib/state/use-home-search-filters-store';
import { Chip } from '@/components/ui/form-controls';
import { PROPERTY_TYPES } from './filter-fields';
import { QuickSearchForm } from './quick-search-form';
import { MobileSearchPanel } from './mobile-search-panel';
import { AiSearchPanel } from './ai-search-panel';
import { ActiveFilterChips } from './active-filter-chips';
import type { PropertyFilters } from '../types/listing.types';

/** Section recherche de l'accueil, au-dessus du fil — onglets Recherche / Recherche IA, puis
 * (location/vente + type de bien) sur la même ligne que les onglets, et (prix min/max, publié
 * par, localisation) sur la ligne suivante dans `QuickSearchForm` — mêmes filtres que la sidebar
 * "Filtres avancés", qui partage cet état pour ne pas les répéter.
 *
 * Location/vente est un contrôle segmenté joint (choix binaire, se lit comme "un seul bloc") —
 * volontairement différent visuellement des puces de type de bien / publié par (choix multiples
 * indépendants), pour que les deux groupes ne se confondent pas dans une même rangée de boutons
 * identiques (retour explicite de l'utilisateur). Un petit label précède chaque groupe de puces
 * pour la même raison, sans ajouter de hauteur. */
export function SearchSection() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<'search' | 'ai'>('search');
  // Change à chaque clic sur l'onglet "Recherche IA" (même si déjà actif) — passé en `key` à
  // AiSearchPanel plus bas pour forcer son remontage, seul moyen de vider son historique de chat
  // local (`useState` interne, pas dans un store partagé). Changer d'onglet le démonte déjà
  // naturellement, mais cliquer sur l'onglet déjà actif ne provoque autrement aucun remontage.
  const [aiPanelResetKey, setAiPanelResetKey] = useState(0);
  const filters = useHomeSearchFiltersStore((state) => state.filters);
  const update = useHomeSearchFiltersStore((state) => state.update);
  const selectPropertyType = useHomeSearchFiltersStore((state) => state.selectPropertyType);
  const resetFilters = useHomeSearchFiltersStore((state) => state.reset);

  // Retirer "Type de bien" doit aussi effacer les critères propres à ce type (chambres, eau...),
  // devenus sans objet — même logique que le choix d'un autre type dans la rangée du dessus.
  function handleRemoveFilter(key: keyof PropertyFilters) {
    if (key === 'propertyType') {
      selectPropertyType(undefined);
    } else {
      update(key, undefined);
    }
  }

  // Chaque onglet repart de zéro à chaque clic (demandé explicitement) — plutôt que de garder les
  // filtres/la conversation d'une recherche précédente en arrière-plan en changeant simplement
  // d'onglet.
  function handleClickSearchTab() {
    resetFilters();
    setTab('search');
  }

  function handleClickAiTab() {
    setAiPanelResetKey((key) => key + 1);
    setTab('ai');
  }

  return (
    // `overflow-anchor: none` : sans ça, le Chrome "scroll anchoring" recale automatiquement
    // scrollY quand ce bloc change de hauteur (repli/redéploiement de MobileSearchPanel pendant le
    // scroll), redéclenchant un événement "scroll" qui referme aussitôt le panneau qu'on venait
    // de rouvrir manuellement — bug constaté en testant le bouton d'expansion manuelle.
    <section
      className="sticky top-12 sm:top-14 z-30 bg-surface-card rounded-2xl border border-stroke-default/80 p-3 shadow-sm"
      style={{ overflowAnchor: 'none' }}
    >
      {/* `gap-5` entre groupes (onglets / location-vente / type de bien) pour bien les séparer
          visuellement, contre `gap-1.5` à l'intérieur d'un même groupe (entre ses propres
          boutons/puces) — sans ça, tout se retrouvait à équidistance et se lisait comme une
          seule longue rangée de boutons plutôt que des champs distincts. */}
      <div className="flex flex-wrap items-center gap-5 mb-2">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleClickSearchTab}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition ${
              tab === 'search' ? 'bg-brand-primary text-white' : 'text-content-muted hover:bg-surface-app'
            }`}
          >
            <Search size={12} />
            {t.search.searchTab}
          </button>
          <button
            type="button"
            onClick={handleClickAiTab}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition ${
              tab === 'ai' ? 'bg-brand-primary text-white' : 'text-content-muted hover:bg-surface-app'
            }`}
          >
            <Sparkles size={12} />
            {t.search.aiTab}
          </button>
        </div>

        {/* Rangée location/vente + type de bien : desktop seulement (`sm:` et plus) — en dessous,
            MobileSearchPanel reprend ces mêmes champs dans sa propre mise en page empilée, calquée
            sur l'app mobile (demandé explicitement : "rendre le Next.js en version responsive
            mobile comme le React Native"). */}
        {tab === 'search' && (
          <div className="hidden sm:flex sm:flex-wrap sm:items-center sm:gap-5">
            <div className="flex rounded-full border border-stroke-default overflow-hidden shrink-0">
              <button
                type="button"
                onClick={() => update('kind', filters.kind === 'rent' ? undefined : 'rent')}
                className={`px-3 py-1.5 text-xs font-semibold transition ${
                  filters.kind === 'rent' ? 'bg-brand-primary text-white' : 'text-content-muted hover:bg-surface-app'
                }`}
              >
                {t.search.rent}
              </button>
              <button
                type="button"
                onClick={() => update('kind', filters.kind === 'sale' ? undefined : 'sale')}
                className={`px-3 py-1.5 text-xs font-semibold transition border-l border-stroke-default ${
                  filters.kind === 'sale' ? 'bg-brand-primary text-white' : 'text-content-muted hover:bg-surface-app'
                }`}
              >
                {t.search.buy}
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-semibold text-content-muted shrink-0">{t.search.propertyType} :</span>
              <Chip active={!filters.propertyType} onClick={() => selectPropertyType(undefined)}>
                {t.search.allTypes}
              </Chip>
              {PROPERTY_TYPES.map(({ value, labelKey }) => (
                <Chip key={value} active={filters.propertyType === value} onClick={() => selectPropertyType(value)}>
                  {t.search[labelKey]}
                </Chip>
              ))}
            </div>
          </div>
        )}
      </div>

      {tab === 'search' && <hr className="hidden sm:block border-stroke-default mb-2" />}

      {tab === 'search' ? (
        <>
          <div className="hidden sm:block">
            <QuickSearchForm />
          </div>
          <div className="sm:hidden">
            <MobileSearchPanel />
          </div>
        </>
      ) : (
        <AiSearchPanel key={aiPanelResetKey} />
      )}

      {tab === 'search' && (
        <div className="hidden sm:block mt-2">
          <ActiveFilterChips filters={filters} onRemove={handleRemoveFilter} />
        </div>
      )}
    </section>
  );
}
