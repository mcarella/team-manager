// Single source of truth for which locales the app ships.
// Adding a locale = add it to this tuple AND drop matching JSON files
// under `apps/web/src/locales/<lng>/`. No other code changes required.
// The <LanguageToggle /> auto-appears when this list has 2+ entries.

export const SUPPORTED_LOCALES = ['en'] as const
export type Locale = typeof SUPPORTED_LOCALES[number]
export const DEFAULT_LOCALE: Locale = 'en'
