import { useLocaleStore } from './use-locale-store';
import translations, { Locale, Translations } from './translations';

export function useTranslation() {
  const locale = useLocaleStore((state) => state.locale);
  const setLocale = useLocaleStore((state) => state.setLocale);

  return {
    locale,
    setLocale,
    t: translations[locale] as Translations,
  };
}

export type { Locale };
