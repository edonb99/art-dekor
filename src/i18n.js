import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

const supportedLngs = ['en', 'sq', 'de']

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs,
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    react: {
      useSuspense: false,
    },
    backend: {},
    resources: {},
  })

async function loadTranslations(language) {
  const response = await fetch(`/locales/${language}/translation.json`)
  const data = await response.json()
  i18n.addResourceBundle(language, 'translation', data, true, true)
}

Promise.all(supportedLngs.map((lng) => loadTranslations(lng))).catch((error) => {
  // Keep app usable even if locale files fail to load.
  console.error('[i18n] Failed loading locale files', error)
})

export default i18n
