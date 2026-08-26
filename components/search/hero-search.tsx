'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { FilterModal } from './filter-modal';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n/use-translation';

export const HeroSearch = () => {
  const { t } = useTranslation();
  const [transactionType, setTransactionType] = useState<'location' | 'vente'>('location');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isSearchSheetOpen, setIsSearchSheetOpen] = useState(false);

  // Critères de recherche
  const [city, setCity] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [maxPrice, setMaxPrice] = useState<number>(150000);
  const [hasCarAccess, setHasCarAccess] = useState<boolean>(true);

  const activeFilterCount = [city, propertyType, maxPrice > 0, hasCarAccess].filter(Boolean).length;

  // Empêche le fond de défiler pendant qu'une feuille plein écran est ouverte (mobile)
  useEffect(() => {
    if (isSearchSheetOpen || isFilterModalOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isSearchSheetOpen, isFilterModalOpen]);

  // Réinitialisation d'un critère individuel
  const removeFilter = (filterType: 'maxPrice' | 'carAccess' | 'city' | 'propertyType') => {
    if (filterType === 'maxPrice') setMaxPrice(0);
    if (filterType === 'carAccess') setHasCarAccess(false);
    if (filterType === 'city') setCity('');
    if (filterType === 'propertyType') setPropertyType('');
  };

  const handleSearch = () => {
    const queryParams = new URLSearchParams({
      type: transactionType,
      ...(city && { city }),
      ...(propertyType && { propertyType }),
      ...(maxPrice > 0 && { maxPrice: maxPrice.toString() }),
      ...(hasCarAccess && { carAccess: 'true' }),
    });

    window.location.href = `/recherche?${queryParams.toString()}`;
  };

  const searchFields = (
    <>
      {/* Sélection Type de Transaction */}
      <div className="flex gap-2 border-b border-stroke-default pb-3 mb-4">
        <button
          type="button"
          onClick={() => setTransactionType('location')}
          className={`flex-1 sm:flex-none py-2.5 sm:py-2 px-4 font-semibold text-xs rounded-xl border transition ${
            transactionType === 'location'
              ? 'bg-brand-primary/10 text-brand-primary border-brand-primary/30'
              : 'bg-surface-app text-content-muted border-transparent'
          }`}
        >
          {t.hero.rent}
        </button>
        <button
          type="button"
          onClick={() => setTransactionType('vente')}
          className={`flex-1 sm:flex-none py-2.5 sm:py-2 px-4 font-semibold text-xs rounded-xl border transition ${
            transactionType === 'vente'
              ? 'bg-brand-primary/10 text-brand-primary border-brand-primary/30'
              : 'bg-surface-app text-content-muted border-transparent'
          }`}
        >
          {t.hero.buy}
        </button>
      </div>

      {/* Formulaire Principal */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div>
          <label className="block text-[11px] font-semibold text-content-muted mb-1">
            {t.hero.cityLabel}
          </label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder={t.hero.cityPlaceholder}
            className="w-full px-3 py-3 sm:py-2.5 bg-surface-app border border-stroke-default rounded-xl text-sm focus:outline-none focus:border-brand-primary"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-content-muted mb-1">
            {t.hero.propertyTypeLabel}
          </label>
          <select
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value)}
            className="w-full px-3 py-3 sm:py-2.5 bg-surface-app border border-stroke-default rounded-xl text-sm text-content-main focus:outline-none focus:border-brand-primary"
          >
            <option value="">{t.hero.allTypes}</option>
            <option value="appartement">{t.hero.apartment}</option>
            <option value="maison">{t.hero.house}</option>
            <option value="terrain">{t.hero.land}</option>
          </select>
        </div>

        {/* Bouton Filtres (Ouvre la modale sur Web & Mobile) */}
        <div className="flex items-end">
          <Button variant="outline" onClick={() => setIsFilterModalOpen(true)} className="w-full">
            ⚙️ {t.hero.filters}
            {(maxPrice > 0 || hasCarAccess) && (
              <span className="w-2.5 h-2.5 rounded-full bg-brand-primary" />
            )}
          </Button>
        </div>

        {/* Bouton Rechercher */}
        <div className="flex items-end">
          <Button variant="secondary" onClick={handleSearch} className="w-full">
            {t.hero.search}
          </Button>
        </div>
      </div>

      {/* BADGES DES FILTRES ACTIFS (Rappel visuel pour l'utilisateur) */}
      {(maxPrice > 0 || hasCarAccess || city || propertyType) && (
        <div className="flex flex-wrap items-center gap-2 pt-4 mt-4 border-t border-stroke-default">
          <span className="text-[11px] font-semibold text-content-muted">
            {t.hero.activeFilters}
          </span>

          {city && (
            <span className="inline-flex items-center gap-1 bg-brand-primary/10 text-brand-primary text-xs font-semibold px-2.5 py-1 rounded-lg border border-brand-primary/20">
              📍 {city}
              <button onClick={() => removeFilter('city')} className="hover:text-danger font-bold ml-1">
                ✕
              </button>
            </span>
          )}

          {propertyType && (
            <span className="inline-flex items-center gap-1 bg-brand-primary/10 text-brand-primary text-xs font-semibold px-2.5 py-1 rounded-lg border border-brand-primary/20">
              🏠 {propertyType}
              <button onClick={() => removeFilter('propertyType')} className="hover:text-danger font-bold ml-1">
                ✕
              </button>
            </span>
          )}

          {maxPrice > 0 && (
            <span className="inline-flex items-center gap-1 bg-brand-primary/10 text-brand-primary text-xs font-semibold px-2.5 py-1 rounded-lg border border-brand-primary/20">
              💰 {t.hero.maxPrefix} {maxPrice.toLocaleString('fr-FR')} Ar
              <button onClick={() => removeFilter('maxPrice')} className="hover:text-danger font-bold ml-1">
                ✕
              </button>
            </span>
          )}

          {hasCarAccess && (
            <span className="inline-flex items-center gap-1 bg-brand-primary/10 text-brand-primary text-xs font-semibold px-2.5 py-1 rounded-lg border border-brand-primary/20">
              🚗 {t.hero.carAccess}
              <button onClick={() => removeFilter('carAccess')} className="hover:text-danger font-bold ml-1">
                ✕
              </button>
            </span>
          )}
        </div>
      )}
    </>
  );

  return (
    <section className="relative text-white py-4 sm:py-20 px-3 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-br from-brand-primary to-surface-dark sm:bg-none">
      {/* Photo de fond : desktop/tablette uniquement — trop lourde et peu utile sur mobile */}
      <Image
        src="/immobilier.webp"
        alt="Arrière-plan immobilier"
        fill
        priority
        className="hidden sm:block object-cover object-center"
      />
      <div className="hidden sm:block absolute inset-0 bg-surface-dark/75" />

      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-1.5 sm:space-y-4">
        <h1 className="text-lg sm:text-5xl font-extrabold tracking-tight leading-tight">
          {t.hero.title}
        </h1>
        <p className="hidden sm:block text-slate-200 text-xs sm:text-lg max-w-2xl mx-auto">
          {t.hero.subtitle}
        </p>

        {/* Desktop / tablette : formulaire complet en ligne */}
        <div className="hidden sm:block mt-6 bg-surface-card p-5 rounded-2xl shadow-xl text-content-main text-left">
          {searchFields}
        </div>

        {/* Mobile : barre de recherche compacte, façon app native, ouvre une feuille plein écran */}
        <button
          type="button"
          onClick={() => setIsSearchSheetOpen(true)}
          className="sm:hidden mt-2.5 w-full flex items-center gap-2 bg-surface-card text-left rounded-xl px-3 py-2.5 shadow-md active:scale-[0.98] transition"
        >
          <span className="text-sm leading-none">🔍</span>
          <span className="flex-1 text-xs font-medium text-content-muted truncate">
            {city || t.hero.searchBarPlaceholder}
          </span>
          {activeFilterCount > 0 && (
            <span className="w-4 h-4 shrink-0 rounded-full bg-brand-secondary text-white text-[9px] font-bold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Feuille de recherche plein écran (mobile uniquement) */}
      {isSearchSheetOpen && (
        <div
          className="sm:hidden fixed inset-0 z-[60] bg-surface-app text-content-main flex flex-col"
          style={{ paddingTop: 'var(--safe-top)', paddingBottom: 'var(--safe-bottom)' }}
        >
          <div className="flex items-center justify-between px-3 py-3 border-b border-stroke-default shrink-0">
            <h2 className="font-bold text-content-main text-sm">{t.hero.searchSheetTitle}</h2>
            <button
              type="button"
              onClick={() => setIsSearchSheetOpen(false)}
              aria-label={t.filterModal.title}
              className="text-content-muted hover:text-content-main text-xl font-bold p-2 -mr-2"
            >
              ✕
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 text-left">{searchFields}</div>
        </div>
      )}

      {/* Modale de Filtres Avancés */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        maxPrice={maxPrice}
        setMaxPrice={setMaxPrice}
        hasCarAccess={hasCarAccess}
        setHasCarAccess={setHasCarAccess}
        onApply={handleSearch}
      />
    </section>
  );
};
