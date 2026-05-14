import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from './locales/index.js'
import enCommon from './locales/en/common.json'
import enHome from './locales/en/home.json'
import enLayer1 from './locales/en/layer1.json'
import enLayer2 from './locales/en/layer2.json'
import enLayer3 from './locales/en/layer3.json'
import enGrowth from './locales/en/growth.json'

const resources = {
  en: {
    common: enCommon,
    home: enHome,
    layer1: enLayer1,
    layer2: enLayer2,
    layer3: enLayer3,
    growth: enGrowth,
  },
} as const

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: DEFAULT_LOCALE,
    supportedLngs: [...SUPPORTED_LOCALES],
    ns: ['common', 'home', 'layer1', 'layer2', 'layer3', 'growth'],
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'forma.locale',
    },
  })

export default i18n
