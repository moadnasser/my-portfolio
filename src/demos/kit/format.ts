import { useMemo } from 'react'
import { useLanguage } from '../../i18n/context'

/** Locale-aware formatters. Arabic keeps Latin digits, matching the source apps. */
export function useFormat() {
  const { lang } = useLanguage()
  return useMemo(() => {
    const locale = lang === 'ar' ? 'ar-LY-u-nu-latn' : 'en-GB'
    const number = (n: number, digits = 0) =>
      new Intl.NumberFormat('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(n)
    const money = (n: number, currency: string, digits = 2) => {
      const value = number(n, digits)
      const unit = lang === 'ar' ? ({ LYD: 'د.ل', USD: '$' } as Record<string, string>)[currency] ?? currency : currency
      return lang === 'ar' ? `${value} ${unit}` : `${currency === 'USD' ? '$' : ''}${value}${currency === 'USD' ? '' : ` ${unit}`}`
    }
    const date = (d: Date | string, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }) =>
      new Intl.DateTimeFormat(locale, opts).format(typeof d === 'string' ? new Date(d) : d)
    const time = (d: Date) => new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(d)
    return { locale, number, money, date, time }
  }, [lang])
}

/** Day key in local time (YYYY-MM-DD), never shifted by UTC conversion. */
export function dayKey(d = new Date()) {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}
