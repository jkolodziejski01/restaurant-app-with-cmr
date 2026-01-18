import { getRequestConfig } from 'next-intl/server';

export const locales = ['en', 'de'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

// Helper to validate locale
function isValidLocale(locale: string | undefined): locale is Locale {
  return locales.includes(locale as Locale);
}

export default getRequestConfig(async ({ requestLocale }) => {
  // Get locale from the request (set by middleware)
  let locale = await requestLocale;

  // Fallback to default if not valid
  if (!locale || !isValidLocale(locale)) {
    locale = defaultLocale;
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
    now: new Date(),
    timeZone: 'Europe/Berlin',
  };
});

// Keep these exports if needed elsewhere
export const localeNames: Record<Locale, string> = {
  en: 'English',
  de: 'Deutsch',
};
export const localeFlags: Record<Locale, string> = {
  en: 'GB',
  de: 'DE',
};