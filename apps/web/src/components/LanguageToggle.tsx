import { useTranslation } from 'react-i18next'
import { SUPPORTED_LOCALES, type Locale } from '../locales/index.js'

export default function LanguageToggle() {
  const { i18n } = useTranslation()

  // Auto-hide until at least one second locale is registered.
  if (SUPPORTED_LOCALES.length <= 1) return null

  const current = (i18n.resolvedLanguage ?? i18n.language) as Locale | undefined

  return (
    <div role="group" aria-label="Language" className="flex items-center gap-0.5">
      {SUPPORTED_LOCALES.map(locale => {
        const isActive = current === locale
        return (
          <button
            key={locale}
            type="button"
            onClick={() => void i18n.changeLanguage(locale)}
            aria-pressed={isActive}
            className={`text-[11px] px-2 py-1 rounded-md uppercase font-semibold tracking-wide transition-colors ${
              isActive
                ? 'bg-gray-900 text-white'
                : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            {locale}
          </button>
        )
      })}
    </div>
  )
}
