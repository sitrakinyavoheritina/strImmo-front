'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n/use-translation';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  maxPrice: number;
  setMaxPrice: (val: number) => void;
  hasCarAccess: boolean;
  setHasCarAccess: (val: boolean) => void;
  onApply: () => void;
}

export const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  maxPrice,
  setMaxPrice,
  hasCarAccess,
  setHasCarAccess,
  onApply,
}) => {
  const { t } = useTranslation();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
      {/* Container type Sheet sur mobile / Modal sur Desktop */}
      <div
        className="w-full max-w-lg bg-surface-card rounded-t-3xl sm:rounded-2xl p-6 space-y-6 shadow-2xl animate-in fade-in slide-in-from-bottom duration-200"
        style={{ paddingBottom: 'calc(1.5rem + var(--safe-bottom))' }}
      >
        {/* Poignée de glissement (repère visuel type app native, mobile uniquement) */}
        <div className="sm:hidden -mt-2 mb-2 flex justify-center">
          <span className="w-10 h-1.5 rounded-full bg-stroke-default" />
        </div>

        <div className="flex justify-between items-center border-b border-stroke-default pb-4">
          <h2 className="text-lg font-bold text-content-main">{t.filterModal.title}</h2>
          <button
            onClick={onClose}
            aria-label={t.filterModal.title}
            className="text-content-muted hover:text-content-main text-xl font-bold p-2 -mr-2"
          >
            ✕
          </button>
        </div>

        {/* Filtre : Prix Maximum */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <label className="font-semibold text-content-main">{t.filterModal.maxBudget}</label>
            <span className="font-bold text-brand-primary">
              {maxPrice > 0 ? `${maxPrice.toLocaleString('fr-FR')} Ar` : t.filterModal.undefined}
            </span>
          </div>
          <input
            type="range"
            min="50000"
            max="5000000"
            step="50000"
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="w-full accent-brand-primary cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-content-muted">
            <span>50 000 Ar</span>
            <span>5 000 000 Ar+</span>
          </div>
        </div>

        {/* Filtre : Accès Voiture & Commodités */}
        <div className="space-y-3 pt-2 border-t border-stroke-default">
          <label className="block text-sm font-semibold text-content-main">{t.filterModal.specificCriteria}</label>

          <label className="flex items-center justify-between p-3 bg-surface-app border border-stroke-default rounded-xl cursor-pointer">
            <span className="text-sm font-medium text-content-main flex items-center gap-2">
              🚗 {t.filterModal.carAccess}
            </span>
            <input
              type="checkbox"
              checked={hasCarAccess}
              onChange={(e) => setHasCarAccess(e.target.checked)}
              className="w-5 h-5 rounded border-stroke-default text-brand-primary focus:ring-brand-primary accent-brand-primary"
            />
          </label>
        </div>

        {/* Boutons d'action */}
        <div className="flex gap-3 pt-4 border-t border-stroke-default">
          <Button
            variant="outline"
            onClick={() => {
              setMaxPrice(0);
              setHasCarAccess(false);
            }}
            className="flex-1 py-3"
          >
            {t.filterModal.reset}
          </Button>
          <Button
            onClick={() => {
              onApply();
              onClose();
            }}
            className="flex-1 py-3"
          >
            {t.filterModal.apply}
          </Button>
        </div>
      </div>
    </div>
  );
};