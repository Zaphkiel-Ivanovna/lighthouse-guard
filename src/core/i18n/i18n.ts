import { getLocales } from 'expo-localization';
import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';

import { usePreferencesStore, type LanguagePreference } from '@/core/preferences';

import { en } from './locales/en';
import { fr } from './locales/fr';

export const SUPPORTED_LANGUAGES = ['en', 'fr'] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];

const isSupported = (code: string | null | undefined): code is Language =>
  SUPPORTED_LANGUAGES.some((language) => language === code);

const deviceLanguage = getLocales()[0]?.languageCode;

export const resolveLanguage = (preference: LanguagePreference): Language =>
  preference !== 'system' ? preference : isSupported(deviceLanguage) ? deviceLanguage : 'en';

const i18n = createInstance();

void i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, fr: { translation: fr } },
  lng: resolveLanguage(usePreferencesStore.getState().language),
  fallbackLng: 'en',
  initAsync: false,
  interpolation: { escapeValue: false },
});

usePreferencesStore.subscribe((state, previous) => {
  if (state.language !== previous.language) void i18n.changeLanguage(resolveLanguage(state.language));
});

declare module 'i18next' {
  interface CustomTypeOptions {
    resources: { translation: typeof en };
  }
}

export { i18n };
