/**
 * Sample data for the UAB Shipping demo. The real app fetches countries, per-kg prices
 * and the exchange rate from its API; these numbers are illustrative only.
 * The formula matches the app: usd = pricePerKg × weight, lyd = usd × exchangeRate.
 */
export type CountryId = 'china' | 'uae' | 'turkey'
export type Method = 'air' | 'sea'
export type Goods = 'normal_goods' | 'sensitive_goods' | 'priority_clearance'
export type Status = 'pending' | 'reviewing' | 'confirmed' | 'in_transit' | 'arrived' | 'delivered'

export const SAMPLE_EXCHANGE_RATE = 6.95

export const countries: { id: CountryId; code: string; rates: Record<Method, { perKg: number; days: [number, number] }> }[] = [
  { id: 'china', code: 'CN', rates: { air: { perKg: 9.5, days: [7, 12] }, sea: { perKg: 2.8, days: [40, 55] } } },
  { id: 'uae', code: 'AE', rates: { air: { perKg: 6.5, days: [3, 6] }, sea: { perKg: 1.9, days: [15, 22] } } },
  { id: 'turkey', code: 'TR', rates: { air: { perKg: 7.25, days: [5, 8] }, sea: { perKg: 2.2, days: [20, 30] } } },
]

export const goodsSurcharge: Record<Goods, Record<Method, number>> = {
  normal_goods: { air: 0, sea: 0 },
  sensitive_goods: { air: 2.5, sea: 0.8 },
  priority_clearance: { air: 1.5, sea: 0.5 },
}

/** Goods types listed per method on the rates screen. */
export const RATE_GOODS: Goods[] = ['normal_goods', 'sensitive_goods']

export interface RateRow {
  method: Method
  goods: Goods
  perKg: number
  days: [number, number]
}

export function rateRows(country: CountryId): RateRow[] {
  const c = countries.find((x) => x.id === country)!
  return (['air', 'sea'] as Method[]).flatMap((method) =>
    RATE_GOODS.map((goods) => ({ method, goods, perKg: c.rates[method].perKg + goodsSurcharge[goods][method], days: c.rates[method].days })),
  )
}

export const CUSTOMER_CODE = 'UAB-DEMO-1042'

export interface Estimate {
  pricePerKgUsd: number
  estimatedUsd: number
  exchangeRate: number
  estimatedLyd: number
  days: [number, number]
}

export function estimate(country: CountryId, method: Method, goods: Goods, weight: number): Estimate {
  const c = countries.find((x) => x.id === country)!
  const rate = c.rates[method]
  const pricePerKgUsd = rate.perKg + goodsSurcharge[goods][method]
  const estimatedUsd = Math.round(pricePerKgUsd * weight * 100) / 100
  return { pricePerKgUsd, estimatedUsd, exchangeRate: SAMPLE_EXCHANGE_RATE, estimatedLyd: Math.round(estimatedUsd * SAMPLE_EXCHANGE_RATE * 100) / 100, days: rate.days }
}

export interface Order {
  code: string
  kind: 'shipping' | 'buying'
  country: CountryId
  method: Method
  goods: Goods
  weight: number
  costUsd: number
  description: string
  /** Supplier page for buying orders. */
  link?: string
  address?: 'office' | 'home'
  /** Demo orders advance on their own from this timestamp. */
  placedAt: number
  /** Seed orders keep a fixed status. */
  fixedStatus?: Status
}

export const statusFlow: Status[] = ['pending', 'reviewing', 'confirmed', 'in_transit', 'arrived', 'delivered']
/** Seconds after placing when each status begins (compressed from days to seconds for the demo). */
export const statusAt: Record<Status, number> = { pending: 0, reviewing: 5, confirmed: 11, in_transit: 18, arrived: 27, delivered: 36 }

export function statusOf(o: Order, now: number): Status {
  if (o.fixedStatus) return o.fixedStatus
  const s = (now - o.placedAt) / 1000
  let current: Status = 'pending'
  for (const st of statusFlow) if (s >= statusAt[st]) current = st
  return current
}

/** 4-segment progress used on the home cards: created, confirmed, in transit, delivered. */
export function progressSegments(s: Status) {
  return { pending: 1, reviewing: 1, confirmed: 2, in_transit: 3, arrived: 3, delivered: 4 }[s]
}

const DAY = 86_400_000
export function seedOrders(now: number): Order[] {
  return [
    { code: 'UAB-2026-0036', kind: 'shipping', country: 'uae', method: 'air', goods: 'normal_goods', weight: 4, costUsd: 26, description: '', placedAt: now - 5 * DAY, fixedStatus: 'delivered' },
    { code: 'UAB-2026-0035', kind: 'buying', country: 'china', method: 'sea', goods: 'normal_goods', weight: 38, costUsd: 106.4, description: '', link: 'https://example-store.com/item/2045', placedAt: now - 19 * DAY, fixedStatus: 'in_transit' },
  ]
}

export interface Txn {
  id: string
  kind: 'deposit' | 'payment' | 'refund'
  amount: number
  at: number
  ref: string
}

export function seedTxns(now: number): Txn[] {
  return [
    { id: 't3', kind: 'payment', amount: 26, at: now - 5 * DAY, ref: 'UAB-2026-0036' },
    { id: 't2', kind: 'refund', amount: 12.5, at: now - 9 * DAY, ref: 'UAB-2026-0031' },
    { id: 't1', kind: 'deposit', amount: 300, at: now - 12 * DAY, ref: 'DEP-4821' },
  ]
}

export const STARTING_BALANCE = 412.5
