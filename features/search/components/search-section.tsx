'use client';

import { useEffect, useRef, useState } from 'react';
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

// Distance de scroll (px) à partir du haut de la page avant que `MobileSearchPanel` se replie —
// un scroll franc, pas le moindre pixel. La sentinelle observée est positionnée exactement à cette
// distance (voir plus bas) : ajuster cette seule valeur suffit à changer la sensibilité du repli,
// sans toucher au mécanisme (IntersectionObserver) qui, lui, ne doit pas changer.
const COLLAPSE_SCROLL_DISTANCE = 120;

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

  // Repli mobile de `MobileSearchPanel` — voir le commentaire détaillé dans ce fichier pour
  // pourquoi c'est un IntersectionObserver sur une sentinelle (placée hors de la section sticky
  // juste en dessous) plutôt qu'un écouteur "scroll". `manualOverrideRef` : une fois déplié à la
  // main pendant qu'on est déjà scrollé, on ignore le repli automatique tant que la sentinelle
  // n'est pas réellement redevenue visible (retour près du haut) — sinon le premier événement
  // d'intersection après le clic (déclenché par le changement de hauteur du panneau qu'on vient de
  // rouvrir) le repliait aussitôt.
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const manualOverrideRef = useRef(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    // `rootMargin` positif : agrandit (pas rétrécit) la zone observée vers le haut, au-delà du
    // bord réel de l'écran — la sentinelle (qui reste juste au-dessus de la section, en flux
    // normal) ne "sort" donc de cette zone élargie qu'après avoir défilé de COLLAPSE_SCROLL_DISTANCE
    // px supplémentaires, pas dès le premier pixel de scroll.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) manualOverrideRef.current = false;
        if (manualOverrideRef.current) return;
        setIsPanelCollapsed(!entry.isIntersecting);
      },
      { rootMargin: `${COLLAPSE_SCROLL_DISTANCE}px 0px 0px 0px`, threshold: 0 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  function handleManualExpandPanel() {
    manualOverrideRef.current = true;
    setIsPanelCollapsed(false);
  }

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
    <>
      {/* Sentinelle invisible, en flux normal juste AVANT la section sticky (pas de wrapper
          `position: relative` autour des deux : ça réduirait le "conteneur" de l'élément sticky à
          sa propre hauteur et lui retirerait toute marge pour rester collé — bug constaté : la
          section ne collait plus du tout et défilait hors écran avec tout son contenu). Sa
          position ne dépend que du vrai scroll de la page, jamais des changements de hauteur de
          MobileSearchPanel juste en dessous (contrairement à un écouteur "scroll" classique) — ce
          qui casse à la racine la boucle de rétroaction scroll ↔ repli qui clignotait sur mobile
          avec les versions précédentes (seuil unique, hystérésis, valeur continue). */}
      <div ref={sentinelRef} aria-hidden className="h-px" />
      {/* `overflow-anchor: none` : sans ça, le Chrome "scroll anchoring" recale automatiquement
          scrollY quand ce bloc change de hauteur (repli/redéploiement de MobileSearchPanel pendant
          le scroll), redéclenchant un événement "scroll" qui referme aussitôt le panneau qu'on
          venait de rouvrir manuellement — bug constaté en testant le bouton d'expansion manuelle. */}
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
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[0.85rem] font-bold uppercase tracking-wide transition ${
              tab === 'search' ? 'bg-brand-secondary text-white' : 'text-content-muted hover:bg-surface-app'
            }`}
          >
            <Search size={12} />
            {t.search.searchTab}
          </button>
          <button
            type="button"
            onClick={handleClickAiTab}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[0.85rem] font-bold uppercase tracking-wide transition ${
              tab === 'ai' ? 'bg-brand-secondary text-white' : 'text-content-muted hover:bg-surface-app'
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
                className={`px-3 py-1.5 text-[0.85rem] font-semibold transition ${
                  filters.kind === 'rent' ? 'bg-brand-primary text-white' : 'text-content-muted hover:bg-surface-app'
                }`}
              >
                {t.search.rent}
              </button>
              <button
                type="button"
                onClick={() => update('kind', filters.kind === 'sale' ? undefined : 'sale')}
                className={`px-3 py-1.5 text-[0.85rem] font-semibold transition border-l border-stroke-default ${
                  filters.kind === 'sale' ? 'bg-brand-primary text-white' : 'text-content-muted hover:bg-surface-app'
                }`}
              >
                {t.search.buy}
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[0.85rem] font-semibold text-content-muted shrink-0">{t.search.propertyType} :</span>
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
            <MobileSearchPanel isCollapsed={isPanelCollapsed} onManualExpand={handleManualExpandPanel} />
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
    </>
  );
}
