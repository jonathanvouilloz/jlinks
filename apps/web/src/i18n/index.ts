// Import translations from shared package
import en from '@noko/shared/i18n/en.json';
import fr from '@noko/shared/i18n/fr.json';

export type Locale = 'en' | 'fr';

const translations: Record<Locale, Record<string, string>> = {
  en,
  fr,
};

/**
 * Get the locale from a URL pathname
 */
export function getLocaleFromUrl(url: URL): Locale {
  const pathname = url.pathname;
  if (pathname.startsWith('/fr')) return 'fr';
  return 'en';
}

/**
 * Get a translation by key
 */
export function t(key: string, locale: Locale = 'en'): string {
  return translations[locale]?.[key] || translations['en']?.[key] || key;
}

/**
 * Get all translations for a locale
 */
export function getTranslations(locale: Locale = 'en') {
  return translations[locale] || translations['en'];
}

/**
 * Create a translation helper bound to a specific locale
 */
export function useTranslations(locale: Locale) {
  return {
    t: (key: string) => t(key, locale),
    locale,
    translations: translations[locale],
  };
}
