import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { LANG_STORAGE_KEY, LanguageContext, type Lang, type LanguageContextValue, type Vars } from './context'
import en from './en.json'
import ar from './ar.json'

type Dict = typeof en
const dictionaries: Record<Lang, Dict> = { en, ar }

function readInitialLang(): Lang {
  if (typeof document !== 'undefined') {
    const attr = document.documentElement.getAttribute('lang')
    if (attr === 'ar' || attr === 'en') return attr
  }
  try {
    const stored = localStorage.getItem(LANG_STORAGE_KEY)
    if (stored === 'ar' || stored === 'en') return stored
  } catch {
    /* storage unavailable */
  }
  if (typeof navigator !== 'undefined' && /^ar\b/i.test(navigator.language)) return 'ar'
  return 'en'
}

function lookup(dict: Dict, key: string): string | undefined {
  let node: unknown = dict
  for (const part of key.split('.')) {
    if (node && typeof node === 'object' && part in (node as Record<string, unknown>)) {
      node = (node as Record<string, unknown>)[part]
    } else {
      return undefined
    }
  }
  return typeof node === 'string' ? node : undefined
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readInitialLang)

  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('lang', lang)
    root.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr')
    document.title = dictionaries[lang].meta.title
    try {
      localStorage.setItem(LANG_STORAGE_KEY, lang)
    } catch {
      /* storage unavailable */
    }
  }, [lang])

  const setLang = useCallback((next: Lang) => setLangState(next), [])
  const toggleLang = useCallback(() => setLangState((l) => (l === 'en' ? 'ar' : 'en')), [])

  const t = useCallback(
    (key: string, vars?: Vars) => {
      const raw = lookup(dictionaries[lang], key) ?? lookup(dictionaries.en, key) ?? key
      if (!vars) return raw
      return raw.replace(/\{(\w+)\}/g, (_, name: string) => String(vars[name] ?? `{${name}}`))
    },
    [lang],
  )

  const value = useMemo<LanguageContextValue>(
    () => ({ lang, dir: lang === 'ar' ? 'rtl' : 'ltr', setLang, toggleLang, t }),
    [lang, setLang, toggleLang, t],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}
