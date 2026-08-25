'use client';

import { useTranslation } from '@/lib/i18n/use-translation';
import { LOCALES, LOCALE_LABELS } from '@/lib/i18n/translations';

export function LanguageSwitcher() {
  const { locale, setLocale } = useTranslation();

  return (
    <div className="flex items-center gap-1 rounded-xl border border-stroke-default bg-surface-app p-1 text-xs font-semibold">
      {LOCALES.map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLocale(code)}
          aria-pressed={locale === code}
          title={LOCALE_LABELS[code]}
          className={`px-2.5 py-1 rounded-lg uppercase transition ${
            locale === code
              ? 'bg-brand-primary text-white'
              : 'text-content-muted hover:text-content-main'
          }`}
        >
          {code}
        </button>
      ))}
    </div>
  );
}
