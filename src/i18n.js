import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'
import de from './locales/de.json'
import en from './locales/en.json'
import sq from './locales/sq.json'

const supportedLngs = ['sq', 'en', 'de']

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      sq: { translation: sq },
      en: { translation: en },
      de: { translation: de },
    },
    fallbackLng: 'sq',
    supportedLngs,
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      // Prefer saved choice; otherwise Albanian (no navigator — avoids English default for local clients).
      order: ['localStorage'],
      caches: ['localStorage'],
    },
    react: {
      useSuspense: false,
    },
  })

export default i18n
