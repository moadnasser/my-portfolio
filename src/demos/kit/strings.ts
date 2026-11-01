import { useCallback } from 'react'
import { useLanguage } from '../../i18n/context'

type Dict = { [key: string]: string | Dict }

function lookup(dict: Dict, key: string): string | undefined {
  let node: string | Dict | undefined = dict
  for (const part of key.split('.')) {
    if (node && typeof node === 'object') node = node[part]
    else return undefined
  }
  return typeof node === 'string' ? node : undefined
}

/**
 * Translator for a demo's own locale files. Each demo ships `en.json` / `ar.json`
 * next to its components so its strings load with the demo chunk, not the main bundle.
 */
export function useDemoStrings(en: Dict, ar: Dict) {
  const { lang } = useLanguage()
  return useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      const raw = lookup(lang === 'ar' ? ar : en, key) ?? lookup(en, key) ?? key
      return vars ? raw.replace(/\{(\w+)\}/g, (_, n: string) => String(vars[n] ?? `{${n}}`)) : raw
    },
    [lang, en, ar],
  )
}
