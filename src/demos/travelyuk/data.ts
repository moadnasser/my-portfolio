import type { Localized } from '../../data/types'

/**
 * Catalogue, fees and policies ported from the Travelyuk backend seeders and booking code.
 * Group-trip prices are sample values; flights, hotels and visas follow the demo seeder.
 */
export const USD_RATE = 4.85
export const HOLD_MINUTES = 15
export const WARNING_SECONDS = 5 * 60
export const BOOKING_FEE = 5 // LYD per booking
export const FLIGHT_CHARGE = 0.015 // 1.5% per flight item
export const CITY_TAX_USD = 1 // per night
export const PAYMENT_WINDOW_HOURS = 72

const H = 3_600_000
const D = 24 * H

export type Policy = { hoursBefore: number; pct: number }[]
export const policies: Record<'standard' | 'flexible' | 'hotel' | 'visa' | 'none', Policy> = {
  standard: [{ hoursBefore: 168, pct: 100 }, { hoursBefore: 72, pct: 50 }, { hoursBefore: 0, pct: 0 }],
  flexible: [{ hoursBefore: 72, pct: 100 }, { hoursBefore: 24, pct: 50 }, { hoursBefore: 0, pct: 0 }],
  hotel: [{ hoursBefore: 48, pct: 100 }, { hoursBefore: 24, pct: 50 }, { hoursBefore: 0, pct: 0 }],
  visa: [{ hoursBefore: 48, pct: 100 }, { hoursBefore: 0, pct: 0 }],
  none: [],
}

/** The rule with the largest hoursBefore that is still ≤ hours remaining wins. */
export function refundPct(policy: Policy, hoursLeft: number) {
  const rule = [...policy].sort((a, b) => b.hoursBefore - a.hoursBefore).find((r) => r.hoursBefore <= hoursLeft)
  return rule?.pct ?? 0
}

export interface Flight {
  id: string
  no: string
  airline: Localized
  from: string
  to: string
  fromCity: Localized
  toCity: Localized
  dep: string
  minutes: number
  daysAhead: number
  priceLyd: number
  currency: 'LYD' | 'USD'
  priceOriginal: number
  seatsLeft: number
  baggage: [number, number]
  policy: keyof typeof policies
}

const city = {
  MJI: { en: 'Tripoli', ar: 'طرابلس' },
  CAI: { en: 'Cairo', ar: 'القاهرة' },
  IST: { en: 'Istanbul', ar: 'إسطنبول' },
}

export const flights: Flight[] = [
  { id: 'ln101', no: 'LN101', airline: { en: 'Libyan Airlines', ar: 'الخطوط الليبية' }, from: 'MJI', to: 'CAI', fromCity: city.MJI, toCity: city.CAI, dep: '09:00', minutes: 150, daysAhead: 4, priceLyd: 320, currency: 'LYD', priceOriginal: 320, seatsLeft: 9, baggage: [7, 23], policy: 'standard' },
  { id: 'tk611', no: 'TK611', airline: { en: 'Turkish Airlines', ar: 'الخطوط التركية' }, from: 'MJI', to: 'IST', fromCity: city.MJI, toCity: city.IST, dep: '06:30', minutes: 200, daysAhead: 12, priceLyd: 180 * USD_RATE, currency: 'USD', priceOriginal: 180, seatsLeft: 23, baggage: [7, 23], policy: 'standard' },
  { id: 'tk701', no: 'TK701', airline: { en: 'Turkish Airlines', ar: 'الخطوط التركية' }, from: 'IST', to: 'CAI', fromCity: city.IST, toCity: city.CAI, dep: '10:15', minutes: 120, daysAhead: 9, priceLyd: 180 * USD_RATE, currency: 'USD', priceOriginal: 180, seatsLeft: 4, baggage: [7, 23], policy: 'flexible' },
  { id: 'ln102', no: 'LN102', airline: { en: 'Libyan Airlines', ar: 'الخطوط الليبية' }, from: 'CAI', to: 'MJI', fromCity: city.CAI, toCity: city.MJI, dep: '15:30', minutes: 150, daysAhead: 2, priceLyd: 320, currency: 'LYD', priceOriginal: 320, seatsLeft: 31, baggage: [7, 23], policy: 'none' },
]

export interface Hotel {
  id: string
  name: Localized
  stars: number
  city: Localized
  area: Localized
  daysAhead: number
  rooms: { id: string; name: Localized; board: 'BB' | 'HB'; nightLyd: number; currency: 'LYD' | 'USD'; original: number }[]
  usdTax: boolean
}

export const hotels: Hotel[] = [
  {
    id: 'bosphorus', name: { en: 'Bosphorus Palace Hotel', ar: 'فندق قصر البوسفور' }, stars: 5, city: city.IST, area: { en: 'Sultanahmet', ar: 'السلطان أحمد' }, daysAhead: 12, usdTax: true,
    rooms: [
      { id: 'std', name: { en: 'Standard Double', ar: 'غرفة مزدوجة' }, board: 'BB', nightLyd: 120 * USD_RATE, currency: 'USD', original: 120 },
      { id: 'suite', name: { en: 'Deluxe Suite', ar: 'جناح ديلوكس' }, board: 'HB', nightLyd: 240 * USD_RATE, currency: 'USD', original: 240 },
    ],
  },
  {
    id: 'nile', name: { en: 'Nile View Hotel', ar: 'فندق إطلالة النيل' }, stars: 4, city: city.CAI, area: { en: 'Corniche El Nil', ar: 'كورنيش النيل' }, daysAhead: 4, usdTax: true,
    rooms: [
      { id: 'std', name: { en: 'Standard Double', ar: 'غرفة مزدوجة' }, board: 'BB', nightLyd: 70 * USD_RATE, currency: 'USD', original: 70 },
      { id: 'suite', name: { en: 'Deluxe Suite', ar: 'جناح ديلوكس' }, board: 'HB', nightLyd: 140 * USD_RATE, currency: 'USD', original: 140 },
    ],
  },
  {
    id: 'tripoli', name: { en: 'Tripoli Grand Hotel', ar: 'فندق طرابلس الكبير' }, stars: 4, city: city.MJI, area: { en: 'Algeria Square', ar: 'ميدان الجزائر' }, daysAhead: 6, usdTax: false,
    rooms: [
      { id: 'std', name: { en: 'Standard Double', ar: 'غرفة مزدوجة' }, board: 'BB', nightLyd: 180, currency: 'LYD', original: 180 },
      { id: 'suite', name: { en: 'Deluxe Suite', ar: 'جناح ديلوكس' }, board: 'HB', nightLyd: 340, currency: 'LYD', original: 340 },
    ],
  },
]

export type Nationality = 'LY' | 'EG' | 'TN'
export interface Visa {
  id: string
  name: Localized
  processing: [number, number]
  validity: number
  stay: number
  govLyd: number
  serviceLyd: number
  currency: 'LYD' | 'USD'
  /** Extra fee in LYD per nationality, or null when not available for that nationality. */
  nationality: Partial<Record<Nationality, number | null>>
}

export const visas: Visa[] = [
  { id: 'tr', name: { en: 'Türkiye e-Visa', ar: 'التأشيرة الإلكترونية لتركيا' }, processing: [1, 3], validity: 180, stay: 30, govLyd: 50 * USD_RATE, serviceLyd: 15 * USD_RATE, currency: 'USD', nationality: {} },
  { id: 'eg', name: { en: 'Egypt Tourist Visa', ar: 'تأشيرة مصر السياحية' }, processing: [2, 5], validity: 90, stay: 30, govLyd: 25 * USD_RATE, serviceLyd: 20 * USD_RATE, currency: 'USD', nationality: { EG: null, LY: 5 * USD_RATE } },
  { id: 'ae', name: { en: 'UAE Tourist Visa (30 days)', ar: 'تأشيرة الإمارات السياحية (30 يومًا)' }, processing: [3, 5], validity: 60, stay: 30, govLyd: 1500, serviceLyd: 500, currency: 'LYD', nationality: {} },
]

export interface Trip {
  id: string
  title: Localized
  destination: Localized
  start: number
  end: number
  priceLyd: number
  available: number
  total: number
  tone: string
  icon: 'tent' | 'landmark' | 'mountain'
}

export function seedTrips(now: number): Trip[] {
  return [
    { id: 'desert', title: { en: 'Desert Camp', ar: 'مخيم الصحراء' }, destination: { en: 'Libyan Sahara', ar: 'الصحراء الليبية' }, start: now + 14 * D, end: now + 18 * D, priceLyd: 1450, available: 12, total: 30, tone: 'from-sky-700 to-cyan-500', icon: 'tent' },
    { id: 'banff', title: { en: 'Moraine Lake & the Valley of the Ten Peaks', ar: 'بحيرة مورين ووادي القمم العشر' }, destination: { en: 'Banff, Canada', ar: 'بانف، كندا' }, start: now + 40 * D, end: now + 49 * D, priceLyd: 9800, available: 8, total: 120, tone: 'from-indigo-800 to-sky-500', icon: 'mountain' },
    { id: 'rome', title: { en: 'Rome: into the heart of the Italian capital', ar: 'روما: رحلة إلى قلب العاصمة الإيطالية' }, destination: { en: 'Rome, Italy', ar: 'روما، إيطاليا' }, start: now + 25 * D, end: now + 31 * D, priceLyd: 6900, available: 0, total: 25, tone: 'from-slate-700 to-slate-500', icon: 'landmark' },
  ]
}

/* ---------------------------------------------------------------- Cart and bookings */

export type ItemType = 'flight' | 'hotel' | 'visa'
export interface CartItem {
  key: string
  type: ItemType
  refId: string
  title: Localized
  subtitle: Localized
  qty: number
  /** Price of the whole line in LYD, fees excluded. */
  lineLyd: number
  /** Hours until departure / check-in / expected visa decision, frozen at booking time. */
  startsAt: number
  policy: keyof typeof policies
  nights?: number
}

export function fees(items: CartItem[]) {
  const subtotal = items.reduce((s, i) => s + i.lineLyd, 0)
  const flightCharge = items.filter((i) => i.type === 'flight').reduce((s, i) => s + i.lineLyd * FLIGHT_CHARGE, 0)
  const cityTax = items.filter((i) => i.type === 'hotel').reduce((s, i) => s + (i.nights ?? 0) * CITY_TAX_USD * USD_RATE, 0)
  const bookingFee = items.length ? BOOKING_FEE : 0
  const r3 = (n: number) => Math.round(n * 1000) / 1000
  return { subtotal: r3(subtotal), flightCharge: r3(flightCharge), cityTax: r3(cityTax), bookingFee, total: r3(subtotal + flightCharge + cityTax + bookingFee) }
}

export type BookingStatus = 'pending_payment' | 'confirmed' | 'expired' | 'cancelled' | 'refunded'
export interface Booking {
  ref: string
  items: CartItem[]
  total: number
  status: BookingStatus
  createdAt: number
  holdExpiresAt: number
  payment?: { method: 'card' | 'bank_transfer'; status: 'pending' | 'paid' | 'refunded'; ref: string }
  refund?: number
}

export type RequestStatus = 'pending' | 'pending_payment' | 'confirmed' | 'rejected'
export interface TripRequest {
  id: string
  tripId: string
  travelers: number
  notes: string
  total: number
  status: RequestStatus
  createdAt: number
  paymentDueAt?: number
}

export const DAY = D
export const HOUR = H
