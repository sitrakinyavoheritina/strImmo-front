'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { FilterModal } from './filter-modal';

export const HeroSearch = () => {
  const [transactionType, setTransactionType] = useState<'location' | 'vente'>('location');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Critères de recherche
  const [city, setCity] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [maxPrice, setMaxPrice] = useState<number>(150000);
  const [hasCarAccess, setHasCarAccess] = useState<boolean>(true);

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

  return (
    <section className="relative text-white py-10 sm:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <Image
        src="/immobilier.webp"
        alt="Arrière-plan immobilier"
        fill
        priority
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-surface-dark/75" />

      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-3 sm:space-y-4">
        <h1 className="text-2xl sm:text-5xl font-extrabold tracking-tight leading-tight">
          Trouvez votre chez-vous <br className="sm:hidden" />à Madagascar 🇲🇬
        </h1>
        <p className="text-slate-200 text-xs sm:text-lg max-w-2xl mx-auto">
          Maisons, appartements et terrains à louer ou à acheter.
        </p>

        <div className="mt-6 bg-surface-card p-4 sm:p-5 rounded-2xl shadow-xl text-content-main text-left">
          {/* Sélection Type de Transaction */}
          <div className="flex gap-2 border-b border-stroke-default pb-3 mb-4">
            <button
              type="button"
              onClick={() => setTransactionType('location')}
              className={`flex-1 sm:flex-none py-2 px-4 font-semibold text-xs rounded-xl border transition ${
                transactionType === 'location'
                  ? 'bg-brand-primary/10 text-brand-primary border-brand-primary/30'
                  : 'bg-surface-app text-content-muted border-transparent'
              }`}
            >
              Louer
            </button>
            <button
              type="button"
              onClick={() => setTransactionType('vente')}
              className={`flex-1 sm:flex-none py-2 px-4 font-semibold text-xs rounded-xl border transition ${
                transactionType === 'vente'
                  ? 'bg-brand-primary/10 text-brand-primary border-brand-primary/30'
                  : 'bg-surface-app text-content-muted border-transparent'
              }`}
            >
              Acheter
            </button>
          </div>

          {/* Formulaire Principal */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-content-muted mb-1">
                Ville ou Quartier
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="ex: Ivandry, Majunga..."
                className="w-full px-3 py-2.5 bg-surface-app border border-stroke-default rounded-xl text-sm focus:outline-none focus:border-brand-primary"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-content-muted mb-1">
                Type de bien
              </label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full px-3 py-2.5 bg-surface-app border border-stroke-default rounded-xl text-sm text-content-main focus:outline-none focus:border-brand-primary"
              >
                <option value="">Tous types</option>
                <option value="appartement">Appartement</option>
                <option value="maison">Maison / Villa</option>
                <option value="terrain">Terrain</option>
              </select>
            </div>

            {/* Bouton Filtres (Ouvre la modale sur Web & Mobile) */}
            <div className="flex items-end">
              <button
                type="button"
                onClick={() => setIsFilterModalOpen(true)}
                className="w-full py-2.5 px-3 bg-surface-app hover:bg-stroke-default border border-stroke-default text-content-main font-semibold rounded-xl text-sm flex items-center justify-center gap-2 transition"
              >
                ⚙️ Filtres
                {(maxPrice > 0 || hasCarAccess) && (
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-primary" />
                )}
              </button>
            </div>

            {/* Bouton Rechercher */}
            <div className="flex items-end">
              <button
                type="button"
                onClick={handleSearch}
                className="w-full py-2.5 bg-brand-secondary hover:bg-brand-secondary-hover text-white font-semibold rounded-xl text-sm shadow-md shadow-brand-secondary/20 transition active:scale-[0.98]"
              >
                Rechercher
              </button>
            </div>
          </div>

          {/* BADGES DES FILTRES ACTIFS (Rappel visuel pour l'utilisateur) */}
          {(maxPrice > 0 || hasCarAccess || city || propertyType) && (
            <div className="flex flex-wrap items-center gap-2 pt-4 mt-4 border-t border-stroke-default">
              <span className="text-[11px] font-semibold text-content-muted">
                Filtres appliqués :
              </span>

              {city && (
                <span className="inline-flex items-center gap-1 bg-brand-primary/10 text-brand-primary text-xs font-semibold px-2.5 py-1 rounded-lg border border-brand-primary/20">
                  📍 {city}
                  <button onClick={() => removeFilter('city')} className="hover:text-red-500 font-bold ml-1">
                    ✕
                  </button>
                </span>
              )}

              {propertyType && (
                <span className="inline-flex items-center gap-1 bg-brand-primary/10 text-brand-primary text-xs font-semibold px-2.5 py-1 rounded-lg border border-brand-primary/20">
                  🏠 {propertyType}
                  <button onClick={() => removeFilter('propertyType')} className="hover:text-red-500 font-bold ml-1">
                    ✕
                  </button>
                </span>
              )}

              {maxPrice > 0 && (
                <span className="inline-flex items-center gap-1 bg-brand-primary/10 text-brand-primary text-xs font-semibold px-2.5 py-1 rounded-lg border border-brand-primary/20">
                  💰 Max {maxPrice.toLocaleString('fr-FR')} Ar
                  <button onClick={() => removeFilter('maxPrice')} className="hover:text-red-500 font-bold ml-1">
                    ✕
                  </button>
                </span>
              )}

              {hasCarAccess && (
                <span className="inline-flex items-center gap-1 bg-brand-primary/10 text-brand-primary text-xs font-semibold px-2.5 py-1 rounded-lg border border-brand-primary/20">
                  🚗 Accès voiture
                  <button onClick={() => removeFilter('carAccess')} className="hover:text-red-500 font-bold ml-1">
                    ✕
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

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