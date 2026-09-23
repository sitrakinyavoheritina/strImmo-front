'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/use-translation';
import { LOCALES, LOCALE_LABELS } from '@/lib/i18n/translations';

/**
 * Compact language control for tight header space (mobile): a single small
 * button showing the current locale that opens a short dropdown on tap,
 * instead of permanently occupying header space with both options visible.
 */
export function LanguageMenu() {
  const { locale, setLocale } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-label={LOCALE_LABELS[locale]}
        aria-expanded={isOpen}
        className="w-9 h-9 rounded-full bg-surface-app border border-stroke-default text-content-main text-[12px] font-bold flex items-center justify-center uppercase active:scale-95 transition"
      >
        {locale}
      </button>

      {isOpen && (
        <>
          {/* Ferme le menu au tap en dehors, sans backdrop visible */}
          <button
            type="button"
            aria-label="Fermer"
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-40 cursor-default"
          />
          <div className="absolute right-0 top-full mt-2 z-50 w-36 bg-surface-card border border-stroke-default rounded-xl shadow-lg py-1">
            {LOCALES.map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => {
                  setLocale(code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm text-left transition ${
                  locale === code ? 'text-brand-primary font-semibold' : 'text-content-main'
                } hover:bg-surface-app`}
              >
                {LOCALE_LABELS[code]}
                {locale === code && <Check size={14} />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
