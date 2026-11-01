/** Money rules from Meezan's models/base/money.ts: integer minor units with scale 100. */
export const MONEY_SCALE = 100

/** Rounds halves away from zero. */
export function toMinor(major: number) {
  const scaled = major * MONEY_SCALE
  return Math.sign(scaled) * Math.round(Math.abs(scaled))
}

/** Accepts Arabic-Indic digits, the Arabic decimal mark and thousands separators. Returns minor units or null. */
export function parseMoney(input: string): number | null {
  const normalized = input
    .trim()
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/٫/g, '.')
    .replace(/[,٬\s]/g, '')
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null
  const minor = toMinor(parseFloat(normalized))
  return minor > 0 ? minor : null
}

export function formatMinor(minor: number, symbol: string) {
  const value = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.abs(minor) / MONEY_SCALE)
  return `${value} ${symbol}`
}
