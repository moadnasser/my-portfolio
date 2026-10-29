import { createContext, useCallback, useContext } from 'react'

export type Lang = 'en' | 'ar'
export const LANG_STORAGE_KEY = 'portfolio.lang'

export type Vars = Record<string, string | number>

export interface LanguageContextValue {
  lang: Lang
  dir: 'ltr' | 'rtl'
  setLang: (lang: Lang) => void
  toggleLang: () => void
  /** Translate a dot-path key, e.g. t('hero.primaryCta'). Supports {var} interpolation. */
  t: (key: string, vars?: Vars) => string
  /** Translation key for the current page's title prefix (e.g. 'projects.meta'); null on the home page. */
  setPageTitle: (key: string | null) => void
}

export const LanguageContext = createContext<LanguageContextValue | null>(null)

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used inside <LanguageProvider>')
  return ctx
}

/** Pick the current-language string from a bilingual field. */
export function useLocalized() {
  const { lang } = useLanguage()
  return useCallback(<T,>(value: { en: T; ar: T }) => value[lang], [lang])
}
