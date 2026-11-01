import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowLeftRight,
  ArrowRight,
  ArrowUpRight,
  Banknote,
  Bell,
  Box,
  Calculator,
  Check,
  ChevronDown,
  ChevronRight,
  CircleCheck,
  CircleHelp,
  Clock,
  Copy,
  FilePenLine,
  Globe,
  Hash,
  Headphones,
  Home,
  Image as ImageIcon,
  Languages,
  ListFilter,
  Lock,
  LockKeyhole,
  LogOut,
  MapPin,
  Maximize2,
  Navigation,
  Nfc,
  Package,
  PackagePlus,
  Paintbrush,
  Plane,
  Plus,
  ReceiptText,
  Scale,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Ship,
  ShoppingCart,
  Tag,
  User,
  WalletCards,
  Filter,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useLanguage } from '../../i18n/context'
import { useTheme } from '../../theme/context'
import { CountUp } from '../kit/CountUp'
import { useDemo } from '../kit/DemoContext'
import { useFormat } from '../kit/format'
import { AppRoot, PushBanner, PushStack, Segmented, press } from '../kit/mobile'
import { Sheet } from '../kit/Sheet'
import { useDemoStrings } from '../kit/strings'
import ar from './ar.json'
import {
  countries,
  CUSTOMER_CODE,
  estimate,
  progressSegments,
  rateRows,
  seedOrders,
  seedTxns,
  statusAt,
  statusFlow,
  statusOf,
  STARTING_BALANCE,
  type CountryId,
  type Goods,
  type Method,
  type Order,
  type RateRow,
  type Status,
  type Txn,
} from './data'
import en from './en.json'
import { LiveMap } from './LiveMap'

type Tab = 'home' | 'shipments' | 'addresses' | 'profile'
type Route =
  | { name: 'calculator'; prefill?: Partial<Prefill> }
  | { name: 'new'; prefill?: Partial<Prefill> }
  | { name: 'order'; code: string }
  | { name: 'track'; code: string }
  | { name: 'rates'; country: CountryId }
  | { name: 'wallet' }
interface Prefill {
  country: CountryId
  method: Method
  goods: Goods
  weight: number
}

const card = 'rounded-[1.5rem] border border-border bg-surface'
const GOODS: Goods[] = ['normal_goods', 'sensitive_goods', 'priority_clearance']
const primaryBtn = 'flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--app-primary)] text-[15px] font-bold text-white shadow-[0_14px_28px_-14px_rgba(29,78,216,0.9)]'

const statusTone: Record<Status, string> = {
  pending: 'bg-slate-500/12 text-slate-600 dark:text-slate-300',
  reviewing: 'bg-slate-500/12 text-slate-600 dark:text-slate-300',
  confirmed: 'bg-teal-500/12 text-teal-700 dark:text-teal-300',
  in_transit: 'bg-[var(--app-primary)]/12 text-[var(--app-primary)]',
  arrived: 'bg-sky-500/12 text-sky-700 dark:text-sky-300',
  delivered: 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-300',
}

export default function UabApp() {
  const t = useDemoStrings(en, ar)
  const f = useFormat()
  const { theme } = useTheme()
  const { complete } = useDemo()

  const [tab, setTab] = useState<Tab>('home')
  const [stack, setStack] = useState<Route[]>([])
  const [now, setNow] = useState(() => Date.now())
  const [orders, setOrders] = useState<Order[]>(() => seedOrders(Date.now()))
  const [txns] = useState<Txn[]>(() => seedTxns(Date.now()))
  const [balance] = useState(STARTING_BALANCE)
  const [seq, setSeq] = useState(37)
  const [sheet, setSheet] = useState<'addresses' | null>(null)
  const [note, setNote] = useState<{ id: number; title: string; body: string; code: string } | null>(null)
  const [unread, setUnread] = useState(0)
  const [toast, setToast] = useState<{ id: number; text: string } | null>(null)

  const usd = useCallback((n: number) => f.money(n, 'USD', Number.isInteger(n) ? 0 : 2), [f])
  const say = useCallback((text: string) => setToast({ id: Date.now(), text }), [])

  useEffect(() => {
    if (!toast) return
    const id = window.setTimeout(() => setToast(null), 2400)
    return () => window.clearTimeout(id)
  }, [toast])

  // Live clock only while a demo order is still moving.
  const moving = orders.some((o) => !o.fixedStatus && statusOf(o, now) !== 'delivered')
  useEffect(() => {
    if (!moving) return
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [moving])

  // Turn status changes into push notifications, as Firebase Messaging does in the real app.
  const lastSeen = useRef(new Map<string, Status>())
  useEffect(() => {
    for (const o of orders) {
      if (o.fixedStatus) continue
      const s = statusOf(o, now)
      const prev = lastSeen.current.get(o.code)
      lastSeen.current.set(o.code, s)
      if (prev && prev !== s) {
        setNote({
          id: now,
          code: o.code,
          title: `${o.code} · ${t(`status.${s}`)}`,
          body: t(`statusBody.${s}`, { method: t(`methods.${o.method}`), country: t(`countries.${o.country}`) }),
        })
        setUnread((n) => n + 1)
        if (s === 'in_transit') complete('track')
      }
    }
  }, [now, orders, t, complete])

  const placeOrder = (o: Omit<Order, 'code' | 'placedAt'>) => {
    const code = `UAB-2026-${String(seq).padStart(4, '0')}`
    const placedAt = Date.now()
    setSeq((n) => n + 1)
    setOrders((list) => [{ ...o, code, placedAt }, ...list])
    setNow(placedAt)
    complete('order')
    setTab('shipments')
    setStack([{ name: 'order', code }])
  }

  const tabs: { id: Tab; label: string; icon: typeof Home }[] = [
    { id: 'home', label: t('nav.home'), icon: Home },
    { id: 'shipments', label: t('nav.shipments'), icon: Box },
    { id: 'addresses', label: t('nav.addresses'), icon: MapPin },
    { id: 'profile', label: t('nav.profile'), icon: User },
  ]

  const onTab = (id: Tab) => {
    if (id === 'addresses') return setSheet('addresses') // An action in the real app, never a selected tab.
    setStack([])
    setTab(id)
  }

  const open = (r: Route) => setStack((s) => [...s, r])
  const back = () => setStack((s) => s.slice(0, -1))
  const onBell = () => {
    if (unread === 0) say(t('toast.notifications'))
    setUnread(0)
  }

  const base = (
    <>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {tab === 'home' && (
          <HomeTab t={t} usd={usd} balance={balance} orders={orders} now={now} unread={unread} onBell={onBell} open={open} showShipments={() => setTab('shipments')} say={say} />
        )}
        {tab === 'shipments' && <ShipmentsTab t={t} usd={usd} orders={orders} now={now} open={open} />}
        {tab === 'profile' && <SettingsTab t={t} unread={unread} onBell={onBell} open={open} openAddresses={() => setSheet('addresses')} say={say} />}
      </div>
      <UabTabBar items={tabs} active={tab} onChange={onTab} label={t('nav.label')} />
    </>
  )

  const route = stack[stack.length - 1]
  let top: ReactNode = null
  if (route?.name === 'calculator')
    top = <CalculatorScreen t={t} back={back} prefill={route.prefill} say={say} onCreate={(prefill) => open({ name: 'new', prefill })} onEstimate={() => complete('estimate')} />
  if (route?.name === 'new') top = <NewOrderScreen t={t} usd={usd} back={back} prefill={route.prefill} onSubmit={placeOrder} />
  if (route?.name === 'rates')
    top = (
      <RatesScreen
        t={t}
        country={route.country}
        back={back}
        onPick={(r) => open({ name: 'calculator', prefill: { country: route.country, method: r.method, goods: r.goods } })}
        onNew={() => open({ name: 'new', prefill: { country: route.country } })}
      />
    )
  if (route?.name === 'wallet') top = <WalletScreen t={t} usd={usd} balance={balance} txns={txns} back={back} />
  if (route?.name === 'order') {
    const o = orders.find((x) => x.code === route.code)
    if (o) top = <OrderScreen t={t} usd={usd} order={o} now={now} back={back} onTrack={() => open({ name: 'track', code: o.code })} />
  }
  if (route?.name === 'track') {
    const o = orders.find((x) => x.code === route.code)
    if (o) top = <TrackScreen t={t} order={o} now={now} back={back} onOpen={() => complete('map')} />
  }

  return (
    <AppRoot style={{ '--app-primary': theme === 'dark' ? '#608BF5' : '#1D4ED8' } as React.CSSProperties}>
      <PushStack base={base} top={top} topKey={route ? `${stack.length}:${JSON.stringify(route)}` : null} />
      <PushBanner
        note={note}
        appName={t('app')}
        onDone={useCallback(() => setNote(null), [])}
        onOpen={() => {
          if (!note) return
          setTab('shipments')
          setStack([{ name: 'order', code: note.code }])
        }}
      />
      <Toast toast={toast} />
      <Sheet open={sheet === 'addresses'} onClose={() => setSheet(null)} title={t('addresses.title')} closeLabel={t('close')}>
        <Addresses t={t} />
      </Sheet>
    </AppRoot>
  )
}

type T = ReturnType<typeof useDemoStrings>
type Usd = (n: number) => string

/* ------------------------------------------------------------------ Shared pieces */

function starPoints(cx: number, cy: number, r: number, rot = -90) {
  const pts: string[] = []
  for (let i = 0; i < 10; i++) {
    const rr = i % 2 ? r * 0.4 : r
    const a = ((rot + i * 36) * Math.PI) / 180
    pts.push(`${(cx + rr * Math.cos(a)).toFixed(2)},${(cy + rr * Math.sin(a)).toFixed(2)}`)
  }
  return pts.join(' ')
}

/** Simplified national flags, drawn inline so the demo needs no image requests. */
function Flag({ id, className = '' }: { id: CountryId | 'libya'; className?: string }) {
  return (
    <svg viewBox="0 0 30 20" preserveAspectRatio="none" className={`shrink-0 overflow-hidden rounded-[3px] shadow-[0_3px_8px_rgba(0,0,0,0.22)] ${className}`} aria-hidden="true">
      {id === 'china' && (
        <>
          <rect width="30" height="20" fill="#EE1C25" />
          <polygon points={starPoints(5, 5, 3)} fill="#FFDE00" />
          <polygon points={starPoints(10, 2, 1, -60)} fill="#FFDE00" />
          <polygon points={starPoints(12, 4, 1, -80)} fill="#FFDE00" />
          <polygon points={starPoints(12, 7, 1, -100)} fill="#FFDE00" />
          <polygon points={starPoints(10, 9, 1, -120)} fill="#FFDE00" />
        </>
      )}
      {id === 'uae' && (
        <>
          <rect width="30" height="6.67" fill="#00732F" />
          <rect y="6.67" width="30" height="6.67" fill="#FFFFFF" />
          <rect y="13.33" width="30" height="6.67" fill="#000000" />
          <rect width="7.5" height="20" fill="#FF0000" />
        </>
      )}
      {id === 'turkey' && (
        <>
          <rect width="30" height="20" fill="#E30A17" />
          <circle cx="11" cy="10" r="5" fill="#FFFFFF" />
          <circle cx="12.25" cy="10" r="4" fill="#E30A17" />
          <polygon points={starPoints(16.6, 10, 2.2, 0)} fill="#FFFFFF" />
        </>
      )}
      {id === 'libya' && (
        <>
          <rect width="30" height="5" fill="#E70013" />
          <rect y="5" width="30" height="10" fill="#000000" />
          <rect y="15" width="30" height="5" fill="#239E46" />
          <circle cx="14" cy="10" r="3.2" fill="#FFFFFF" />
          <circle cx="14.9" cy="10" r="2.6" fill="#000000" />
          <polygon points={starPoints(17.4, 10, 1.4, 0)} fill="#FFFFFF" />
        </>
      )}
    </svg>
  )
}

/** Pushed screen: round back button, centred title, optional trailing action. */
function Page({ t, title, back, trailing, footer, children }: { t: T; title: string; back: () => void; trailing?: ReactNode; footer?: ReactNode; children: ReactNode }) {
  return (
    <div className="relative flex h-full min-h-0 flex-col">
      <header className="grid h-16 shrink-0 grid-cols-[3rem_1fr_3rem] items-center px-4">
        <button type="button" onClick={back} aria-label={t('back')} className={`grid size-11 place-items-center rounded-full bg-surface-2 ${press}`}>
          <ArrowLeft className="size-5 rtl:-scale-x-100" aria-hidden="true" />
        </button>
        <h2 className="truncate text-center text-[17px] font-bold">{title}</h2>
        <div className="flex justify-end">{trailing}</div>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
      {footer && <div className="shrink-0 bg-bg/95 px-4 pt-3 pb-[max(0.75rem,var(--safe-bottom,env(safe-area-inset-bottom)))] backdrop-blur">{footer}</div>}
    </div>
  )
}

function Group({ label, children, error, htmlFor }: { label: string; children: ReactNode; error?: string; htmlFor?: string }) {
  return (
    <div className="flex flex-col gap-2.5">
      <label htmlFor={htmlFor} className="px-1 text-[13px] font-bold text-text-2">
        {label}
      </label>
      {children}
      {error && (
        <p className="px-1 text-[13px] font-medium text-[var(--app-primary)]" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

function IconBox({ children, tone = 'primary', className = '' }: { children: ReactNode; tone?: 'primary' | 'muted'; className?: string }) {
  const tones = { primary: 'bg-[var(--app-primary)]/12 text-[var(--app-primary)]', muted: 'bg-surface-2 text-text-2' }
  return <span className={`grid shrink-0 place-items-center rounded-xl ${tones[tone]} ${className || 'size-11'}`}>{children}</span>
}

function MethodIcon({ method, className = 'size-5' }: { method: Method; className?: string }) {
  const Icon = method === 'air' ? Plane : Ship
  return <Icon className={className} aria-hidden="true" />
}

function MethodPicker({ t, value, onChange }: { t: T; value: Method; onChange: (m: Method) => void }) {
  return (
    <div role="radiogroup" aria-label={t('calc.method')} className="grid grid-cols-2 gap-3">
      {(['air', 'sea'] as const).map((m) => {
        const on = m === value
        return (
          <button
            key={m}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(m)}
            className={`flex h-14 items-center justify-center gap-2 rounded-2xl text-[15px] font-bold transition-colors ${press} ${
              on ? 'bg-[var(--app-primary)] text-white shadow-[0_12px_24px_-12px_rgba(29,78,216,0.9)] ring-4 ring-[var(--app-primary)]/12' : 'border border-border bg-surface text-text-2'
            }`}
          >
            <MethodIcon method={m} />
            {t(`methods.${m}`)}
          </button>
        )
      })}
    </div>
  )
}

function PriceChip({ value, t }: { value: string; t: T }) {
  return (
    <span className="latin inline-flex h-8 shrink-0 items-center rounded-full border border-border bg-surface px-3 text-xs font-bold tabular-nums" dir="ltr">
      {value} {t('rates.perKg')}
    </span>
  )
}

/** Goods-type picker with the per-kg price for the chosen country and method. */
function GoodsSheet({ t, open, onClose, country, method, value, onChange }: { t: T; open: boolean; onClose: () => void; country: CountryId; method: Method; value: Goods | null; onChange: (g: Goods) => void }) {
  const f = useFormat()
  return (
    <Sheet open={open} onClose={onClose} title={t('goods.label')} closeLabel={t('close')}>
      <div role="radiogroup" aria-label={t('goods.label')} className="flex flex-col gap-2 pt-1">
        {GOODS.map((g) => {
          const e = estimate(country, method, g, 1)
          const on = g === value
          return (
            <button
              key={g}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => {
                onChange(g)
                onClose()
              }}
              className={`flex items-center gap-3 rounded-2xl border p-3 text-start ${press} ${on ? 'border-[var(--app-primary)] bg-[var(--app-primary)]/[0.06]' : 'border-border'}`}
            >
              <IconBox>
                <MethodIcon method={method} />
              </IconBox>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold">{t(`goods.${g}`)}</span>
                <span className="block text-xs text-text-2">{t('calc.days', { min: e.days[0], max: e.days[1] })}</span>
              </span>
              <PriceChip t={t} value={f.money(e.pricePerKgUsd, 'USD', 2)} />
              {on && <Check className="size-4.5 text-[var(--app-primary)]" aria-hidden="true" />}
            </button>
          )
        })}
      </div>
    </Sheet>
  )
}

function Toast({ toast }: { toast: { id: number; text: string } | null }) {
  const reduce = useReducedMotion()
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-28 z-50 flex justify-center px-6" role="status" aria-live="polite">
      <AnimatePresence>
        {toast && (
          <motion.p
            key={toast.id}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            className="rounded-full bg-text px-4 py-2.5 text-center text-[13px] font-semibold text-bg shadow-lg"
          >
            {toast.text}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

function UabTabBar({ items, active, onChange, label }: { items: { id: Tab; label: string; icon: typeof Home }[]; active: Tab; onChange: (id: Tab) => void; label: string }) {
  return (
    <nav aria-label={label} className="shrink-0 border-t border-border bg-surface/95 px-2 pt-1.5 pb-[max(0.25rem,var(--safe-bottom,env(safe-area-inset-bottom)))] backdrop-blur">
      <ul className="flex">
        {items.map((it) => {
          const on = it.id === active
          const Icon = it.icon
          return (
            <li key={it.id} className="flex-1">
              <button
                type="button"
                onClick={() => onChange(it.id)}
                aria-current={on ? 'page' : undefined}
                className={`relative flex h-16 w-full items-center justify-center text-[11px] font-semibold ${press} ${on ? 'text-[var(--app-primary)]' : 'text-text-2'}`}
              >
                {on && <motion.span layoutId="uab-tab" className="absolute inset-x-1 inset-y-1 rounded-[1.25rem] bg-[var(--app-primary)]/12" transition={{ type: 'spring', stiffness: 500, damping: 40 }} />}
                <span className="relative flex flex-col items-center gap-1">
                  <Icon className="size-6" strokeWidth={on ? 2.1 : 1.7} />
                  {it.label}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

/* ------------------------------------------------------------------ Home */

function HomeTab(props: {
  t: T
  usd: Usd
  balance: number
  orders: Order[]
  now: number
  unread: number
  onBell: () => void
  open: (r: Route) => void
  showShipments: () => void
  say: (s: string) => void
}) {
  const { t, usd, balance, orders, now, unread, onBell, open, showShipments, say } = props
  const reduce = useReducedMotion()
  const scroller = useRef<HTMLDivElement>(null)
  const [slide, setSlide] = useState(0)
  const morning = new Date().getHours() < 12

  const onScroll = () => {
    const el = scroller.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    setSlide(max > 0 ? Math.round((Math.abs(el.scrollLeft) / max) * (countries.length - 1)) : 0)
  }
  const goTo = (i: number) => {
    const child = scroller.current?.children[i] as HTMLElement | undefined
    child?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', inline: 'center', block: 'nearest' })
  }

  return (
    <div className="flex flex-col gap-6 pb-8">
      <header className="flex items-center gap-2.5 px-4 pt-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-full bg-text text-sm font-bold text-bg">{t('home.initials')}</span>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] text-text-2">{morning ? t('home.morning') : t('home.evening')}</p>
          <p className="truncate text-[17px] leading-tight font-bold">{t('home.name')}</p>
        </div>
        <button
          type="button"
          onClick={() => open({ name: 'wallet' })}
          aria-label={t('home.wallet')}
          className={`flex h-12 shrink-0 items-center gap-1.5 rounded-full border border-border bg-surface px-3.5 text-[var(--app-primary)] ${press}`}
        >
          <span className="latin text-[15px] font-bold tabular-nums">
            <CountUp value={balance} format={(n) => usd(Math.round(n))} />
          </span>
          <WalletCards className="size-5" aria-hidden="true" />
        </button>
        <button type="button" onClick={onBell} aria-label={t('home.notifications')} className={`relative grid size-12 shrink-0 place-items-center rounded-full border border-border bg-surface ${press}`}>
          <Bell className="size-5" aria-hidden="true" />
          {unread > 0 && <span className="absolute end-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-[var(--app-primary)] px-1 font-sans text-[10px] font-bold text-white">{unread}</span>}
        </button>
      </header>

      {/* Rates by country */}
      <section>
        <SectionHead title={t('home.ratesTitle')} action={t('home.viewAll')} onAction={() => open({ name: 'rates', country: countries[slide].id })} />
        <div ref={scroller} onScroll={onScroll} className="no-scrollbar mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pt-1 pb-7">
          {countries.map((c) => {
            const rows = rateRows(c.id)
            const min = Math.min(...rows.map((r) => r.perKg))
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => open({ name: 'rates', country: c.id })}
                className={`relative h-[12.5rem] w-[88%] shrink-0 snap-center overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-[#2D82F8] via-[#1F5FD6] to-[#0B3A8C] p-5 text-start text-white shadow-[0_22px_36px_-18px_rgba(37,99,235,0.85)] ${press}`}
              >
                <span className="pointer-events-none absolute -end-16 -top-16 size-60 rounded-full bg-white/10" aria-hidden="true" />
                <span className="pointer-events-none absolute -start-10 -bottom-24 size-48 rounded-full bg-[#00D4FF]/15 blur-2xl" aria-hidden="true" />
                <span className="relative flex h-full flex-col justify-between">
                  <span className="flex items-start justify-between gap-3">
                    <span className="flex flex-col">
                      <span className="text-xs text-white/75">{t('home.shipFrom')}</span>
                      <span className="mt-0.5 text-[1.75rem] leading-tight font-bold">{t(`countries.${c.id}`)}</span>
                      <span className="mt-1.5 text-sm text-white/85">
                        {t('home.from')} <span className="latin text-lg font-bold">{usd(min)}</span> <span className="latin text-xs">{t('rates.perKg')}</span>
                      </span>
                      <span className="text-xs text-white/70">{t('home.methodsCount', { n: 2 })}</span>
                    </span>
                    <Flag id={c.id} className="h-12 w-[72px]" />
                  </span>
                  <span className="inline-flex h-10 items-center gap-1 self-end rounded-full bg-white px-4 text-[13px] font-bold text-[#1D4ED8]">
                    {t('home.allRates')}
                    <ChevronRight className="size-4 rtl:-scale-x-100" aria-hidden="true" />
                  </span>
                </span>
              </button>
            )
          })}
        </div>
        <div className="-mt-3 flex justify-center gap-1.5">
          {countries.map((c, i) => (
            <button key={c.id} type="button" onClick={() => goTo(i)} aria-label={t(`countries.${c.id}`)} aria-current={i === slide} className="grid h-6 place-items-center px-0.5">
              <span className={`block h-1.5 rounded-full transition-all duration-300 ${i === slide ? 'w-6 bg-[var(--app-primary)]' : 'w-1.5 bg-text-2/30'}`} />
            </button>
          ))}
        </div>
      </section>

      {/* Quick actions */}
      <section className="px-5">
        <div className="flex items-center gap-3">
          <IconBox className="size-10 border border-[var(--app-primary)]/20">
            <Box className="size-5" aria-hidden="true" />
          </IconBox>
          <h3 className="text-lg font-bold">{t('home.quickActions')}</h3>
          <span className="h-px flex-1 bg-border" aria-hidden="true" />
        </div>
        <button
          type="button"
          onClick={() => open({ name: 'new' })}
          className={`mt-4 flex h-[4.5rem] w-full items-center gap-4 rounded-[1.25rem] bg-gradient-to-br from-[#2563EB] to-[#1E3A9A] ps-3 pe-4 text-white shadow-[0_16px_30px_-16px_rgba(29,78,216,0.9)] ${press}`}
        >
          <span className="grid size-12 place-items-center rounded-2xl border border-white/20 bg-white/15">
            <Box className="size-6" aria-hidden="true" />
          </span>
          <span className="flex-1 text-start text-lg font-bold">{t('home.newShipment')}</span>
          <span className="grid size-10 place-items-center rounded-full bg-white/15">
            <ArrowRight className="size-5 rtl:-scale-x-100" aria-hidden="true" />
          </span>
        </button>
        <div className="mt-3 grid grid-cols-[1.25fr_1fr] gap-3">
          <ActionTile icon={ArrowLeftRight} tone="text-emerald-600 dark:text-emerald-400" label={t('home.transfer')} onClick={() => say(t('toast.realApp'))} />
          <ActionTile icon={Calculator} tone="text-[var(--app-primary)]" label={t('home.calculator')} onClick={() => open({ name: 'calculator' })} />
        </div>
        <div className="mt-3 grid grid-cols-[1fr_1.25fr] gap-3">
          <ActionTile icon={FilePenLine} tone="text-sky-600 dark:text-sky-400" label={t('home.drafts')} onClick={() => say(t('toast.realApp'))} />
          <ActionTile icon={ShieldCheck} tone="text-teal-600 dark:text-teal-400" label={t('home.policies')} onClick={() => say(t('toast.realApp'))} />
        </div>
      </section>

      {/* Latest orders */}
      <section>
        <SectionHead title={t('home.latestOrders')} count={orders.length} action={t('home.viewAll')} onAction={showShipments} />
        <div className="no-scrollbar mt-3 flex snap-x gap-3 overflow-x-auto px-5 pb-2">
          {orders.slice(0, 4).map((o) => (
            <OrderCard key={o.code} o={o} now={now} t={t} usd={usd} onOpen={() => open({ name: 'order', code: o.code })} compact />
          ))}
        </div>
      </section>
    </div>
  )
}

function SectionHead({ title, count, action, onAction }: { title: string; count?: number; action?: string; onAction?: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3 px-5">
      <h3 className="flex items-center gap-2 text-lg font-bold">
        {title}
        {count !== undefined && <span className="latin grid size-7 place-items-center rounded-full bg-[var(--app-primary)]/12 text-xs font-bold text-[var(--app-primary)]">{count}</span>}
      </h3>
      {action && (
        <button type="button" onClick={onAction} className={`-me-2 inline-flex h-9 items-center gap-1 rounded-full px-3 text-sm font-medium text-[var(--app-primary)] ${press}`}>
          {action}
          <ChevronRight className="size-4 rtl:-scale-x-100" aria-hidden="true" />
        </button>
      )}
    </div>
  )
}

function ActionTile({ icon: Icon, label, tone, onClick }: { icon: typeof Calculator; label: string; tone: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`flex h-[4.5rem] items-center gap-3 rounded-[1.25rem] border border-border bg-surface px-4 text-start ${press}`}>
      <Icon className={`size-7 shrink-0 ${tone}`} strokeWidth={1.7} aria-hidden="true" />
      <span className="min-w-0 text-sm leading-tight font-bold">{label}</span>
    </button>
  )
}

function StatusBadge({ s, t }: { s: Status; t: T }) {
  return <span className={`inline-flex h-7 shrink-0 items-center rounded-full px-3 text-[11px] font-bold ${statusTone[s]}`}>{t(`status.${s}`)}</span>
}

function Progress({ s }: { s: Status }) {
  const n = progressSegments(s)
  return (
    <div className="flex gap-1" aria-hidden="true">
      {[1, 2, 3, 4].map((i) => (
        <span key={i} className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ${i <= n ? 'bg-[var(--app-primary)]' : 'bg-surface-2'}`} />
      ))}
    </div>
  )
}

function LivePill({ t }: { t: T }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--app-primary)]/10 px-2.5 py-1 text-[11px] font-semibold text-[var(--app-primary)]">
      <span className="relative flex size-1.5">
        <span className="absolute inline-flex size-full rounded-full bg-[var(--app-primary)] opacity-60 motion-safe:animate-ping" />
        <span className="relative inline-flex size-1.5 rounded-full bg-[var(--app-primary)]" />
      </span>
      {t('track.live')}
    </span>
  )
}

function OrderCard({ o, now, t, usd, onOpen, compact }: { o: Order; now: number; t: T; usd: Usd; onOpen: () => void; compact?: boolean }) {
  const s = statusOf(o, now)
  return (
    <button
      type="button"
      onClick={onOpen}
      className={`${card} flex flex-col gap-4 p-4 text-start shadow-[0_10px_28px_-22px_rgba(15,23,42,0.35)] ${compact ? 'w-[17.5rem] shrink-0 snap-start' : 'w-full'} ${press}`}
    >
      <div className="flex items-center gap-3">
        <Flag id={o.country} className="h-6 w-9" />
        <div className="min-w-0 flex-1">
          <p className="latin truncate font-bold">{o.code}</p>
          <p className="truncate text-xs text-text-2">
            {t(`order.${o.kind}`)} · {t('order.methodShip', { method: t(`methods.${o.method}`) })}
          </p>
        </div>
        <StatusBadge s={s} t={t} />
      </div>
      <div className="flex items-center gap-2 text-xs font-bold">
        <span>{t(`countries.${o.country}`)}</span>
        <span className="h-0 flex-1 border-t-2 border-dashed border-border" aria-hidden="true" />
        <IconBox className="size-8 rounded-full">
          <MethodIcon method={o.method} className="size-4 rtl:-scale-x-100" />
        </IconBox>
        <span className="h-0 flex-1 border-t-2 border-dashed border-border" aria-hidden="true" />
        <span>{t('countries.libya')}</span>
      </div>
      <Progress s={s} />
      <div className="flex min-h-6 items-center justify-between gap-3">
        {s === 'in_transit' || s === 'arrived' ? <LivePill t={t} /> : <span className="text-xs text-text-2">{t(`goods.${o.goods}`)}</span>}
        {o.costUsd > 0 && <span className="latin text-sm font-bold text-[var(--app-primary)]">{usd(o.costUsd)}</span>}
      </div>
    </button>
  )
}

/* ------------------------------------------------------------------ Shipments */

function ShipmentsTab({ t, usd, orders, now, open }: { t: T; usd: Usd; orders: Order[]; now: number; open: (r: Route) => void }) {
  const [filter, setFilter] = useState<'all' | 'active' | 'delivered'>('all')
  const list = orders.filter((o) => {
    const s = statusOf(o, now)
    return filter === 'all' || (filter === 'delivered' ? s === 'delivered' : s !== 'delivered')
  })
  return (
    <div className="flex flex-col gap-4 px-4 pt-4 pb-6">
      <div className="flex items-center justify-between">
        <h2 className="text-[1.75rem] font-bold">{t('nav.shipments')}</h2>
        <button type="button" onClick={() => open({ name: 'new' })} aria-label={t('home.newShipment')} className={`grid size-12 place-items-center rounded-2xl bg-[var(--app-primary)] text-white ${press}`}>
          <Plus className="size-5" aria-hidden="true" />
        </button>
      </div>
      <Segmented label={t('nav.shipments')} value={filter} onChange={setFilter} options={(['all', 'active', 'delivered'] as const).map((id) => ({ id, label: t(`filters.${id}`) }))} />
      {list.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-16 text-center text-text-2">
          <Package className="size-10" aria-hidden="true" />
          <p className="text-sm">{t('order.empty')}</p>
        </div>
      )}
      {list.map((o) => (
        <OrderCard key={o.code} o={o} now={now} t={t} usd={usd} onOpen={() => open({ name: 'order', code: o.code })} />
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ Rates by country */

function RatesScreen({ t, country, back, onPick, onNew }: { t: T; country: CountryId; back: () => void; onPick: (r: RateRow) => void; onNew: () => void }) {
  const f = useFormat()
  const rows = rateRows(country)
  return (
    <Page t={t} title={t(`countries.${country}`)} back={back}>
      <div className="flex flex-col gap-3 px-4 pt-1 pb-28">
        <div className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-[#2D82F8] via-[#1F5FD6] to-[#0B3A8C] p-5 text-white shadow-[0_22px_36px_-20px_rgba(37,99,235,0.85)]">
          <span className="pointer-events-none absolute -start-12 -top-20 size-52 rounded-full bg-white/10" aria-hidden="true" />
          <div className="relative flex items-center gap-4">
            <Flag id={country} className="h-12 w-[72px]" />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-white/75">{t('home.shipFrom')}</p>
              <p className="text-2xl leading-tight font-bold">{t(`countries.${country}`)}</p>
            </div>
            <span className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-white/15 px-3 text-xs font-bold">
              <Box className="size-4" aria-hidden="true" />
              {t('home.methodsCount', { n: 2 })}
            </span>
          </div>
        </div>
        <p className="px-1 pt-1 text-xs text-text-2">{t('rates.pick')}</p>
        {rows.map((r) => (
          <button key={`${r.method}-${r.goods}`} type="button" onClick={() => onPick(r)} className={`${card} flex items-center gap-3 p-4 text-start ${press}`}>
            <IconBox className="size-14 rounded-2xl">
              <MethodIcon method={r.method} className="size-6" />
            </IconBox>
            <div className="min-w-0 flex-1">
              <p className="text-lg leading-tight font-bold">{t(`methods.${r.method}`)}</p>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-text-2">
                <span className="inline-flex h-7 items-center gap-1 rounded-lg border border-border bg-surface-2 px-2 font-semibold">
                  <Tag className="size-3.5" aria-hidden="true" />
                  {t(`goods.${r.goods}`)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="size-3.5" aria-hidden="true" />
                  {t('calc.days', { min: r.days[0], max: r.days[1] })}
                </span>
              </div>
            </div>
            <p className="latin shrink-0 text-end" dir="ltr">
              <span className="text-xl font-bold text-[var(--app-primary)] tabular-nums">{f.money(r.perKg, 'USD', 2)}</span>
              <span className="block text-xs font-semibold text-text-2">{t('rates.perKg')}</span>
            </p>
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={onNew}
        className={`absolute end-4 bottom-[max(1.25rem,var(--safe-bottom,env(safe-area-inset-bottom)))] flex h-14 items-center gap-2 rounded-2xl bg-[var(--app-primary)] px-5 text-[15px] font-bold text-white shadow-[0_16px_30px_-12px_rgba(29,78,216,0.9)] ${press}`}
      >
        <PackagePlus className="size-5" aria-hidden="true" />
        {t('rates.newRequest')}
      </button>
    </Page>
  )
}

/* ------------------------------------------------------------------ Calculator */

function CalculatorScreen({ t, back, prefill, say, onCreate, onEstimate }: { t: T; back: () => void; prefill?: Partial<Prefill>; say: (s: string) => void; onCreate: (p: Prefill) => void; onEstimate: () => void }) {
  const f = useFormat()
  const reduce = useReducedMotion()
  const [country, setCountry] = useState<CountryId>(prefill?.country ?? 'china')
  const [method, setMethod] = useState<Method>(prefill?.method ?? 'air')
  const [goods, setGoods] = useState<Goods>(prefill?.goods ?? 'normal_goods')
  const [weight, setWeight] = useState('5')
  const [shown, setShown] = useState(false)
  const [error, setError] = useState(false)
  const [picker, setPicker] = useState(false)
  const w = parseFloat(weight.replace(',', '.'))
  const valid = Number.isFinite(w) && w > 0
  const unit = estimate(country, method, goods, 1)
  const result = useMemo(() => (valid ? estimate(country, method, goods, w) : null), [country, method, goods, w, valid])
  const usd2 = (n: number) => f.money(n, 'USD', 2)

  const calculate = () => {
    if (!valid) return setError(true)
    setError(false)
    setShown(true)
    onEstimate()
  }

  return (
    <Page
      t={t}
      title={t('calc.title')}
      back={back}
      trailing={
        <button type="button" onClick={() => say(t('calc.disclaimer'))} aria-label={t('calc.help')} className={`grid size-11 place-items-center rounded-full border border-border bg-surface text-[var(--app-primary)] ${press}`}>
          <CircleHelp className="size-5" aria-hidden="true" />
        </button>
      }
    >
      <div className="flex flex-col gap-6 px-4 pt-1 pb-8">
        <Group label={t('calc.country')}>
          <div role="radiogroup" aria-label={t('calc.country')} className="flex flex-wrap gap-2">
            {countries.map((c) => {
              const on = c.id === country
              return (
                <button
                  key={c.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setCountry(c.id)}
                  className={`inline-flex h-12 items-center gap-2 rounded-2xl px-4 text-sm font-bold transition-colors ${press} ${
                    on ? 'bg-[var(--app-primary)] text-white shadow-[0_12px_24px_-12px_rgba(29,78,216,0.9)]' : 'border border-border bg-surface'
                  }`}
                >
                  <Flag id={c.id} className="h-5 w-7" />
                  {t(`countries.${c.id}`)}
                  {on && <CircleCheck className="size-4.5" aria-hidden="true" />}
                </button>
              )
            })}
          </div>
        </Group>
        <Group label={t('calc.method')}>
          <MethodPicker t={t} value={method} onChange={setMethod} />
        </Group>
        <Group label={t('goods.label')}>
          <button
            type="button"
            onClick={() => setPicker(true)}
            className={`flex items-center gap-3 rounded-[1.25rem] border border-[var(--app-primary)]/30 bg-[var(--app-primary)]/[0.06] p-3 text-start ${press}`}
          >
            <IconBox className="size-12">
              <MethodIcon method={method} />
            </IconBox>
            <span className="min-w-0 flex-1">
              <span className="block font-bold">{t(`goods.${goods}`)}</span>
              <span className="block text-xs text-text-2">{t('calc.days', { min: unit.days[0], max: unit.days[1] })}</span>
            </span>
            <PriceChip t={t} value={usd2(unit.pricePerKgUsd)} />
            <ChevronDown className="size-5 shrink-0 text-text-2" aria-hidden="true" />
          </button>
        </Group>
        <Group label={t('calc.weight')} htmlFor="uab-weight" error={error ? t('calc.invalid') : undefined}>
          <div className={`flex h-24 items-center gap-3 rounded-[1.5rem] border bg-surface px-5 transition-colors focus-within:border-[var(--app-primary)] ${error ? 'border-[var(--app-primary)]' : 'border-border'}`}>
            <input
              id="uab-weight"
              inputMode="decimal"
              autoComplete="off"
              placeholder="0.00"
              value={weight}
              onChange={(e) => {
                setWeight(e.target.value.replace(/[^\d.,]/g, ''))
                if (error) setError(false)
              }}
              aria-invalid={error}
              className="latin h-full min-w-0 flex-1 bg-transparent text-start text-[2.25rem] font-bold tabular-nums outline-none placeholder:text-text-2/40"
            />
            <span className="latin rounded-full bg-[var(--app-primary)]/12 px-3.5 py-2 text-sm font-bold text-[var(--app-primary)]">{t('calc.kg')}</span>
          </div>
        </Group>

        {!(shown && result) && (
          <button type="button" onClick={calculate} className={`${primaryBtn} ${press}`}>
            <Calculator className="size-5" aria-hidden="true" />
            {t('calc.calculate')}
          </button>
        )}

        {shown && result && (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-4"
            aria-live="polite"
          >
            <div className="overflow-hidden rounded-[1.5rem] border border-[var(--app-primary)]/25 bg-[var(--app-primary)]/[0.06]">
              <div className="p-5">
                <p className="text-sm font-medium text-text-2">{t('calc.estimatedCost')}</p>
                <p className="latin mt-1 text-[2.25rem] leading-none font-bold text-[var(--app-primary)] tabular-nums">
                  <CountUp value={result.estimatedLyd} format={(n) => f.money(n, 'LYD')} />
                </p>
                <p className="mt-2 text-[13px] text-text-2">{t('calc.disclaimer')}</p>
              </div>
              <dl className="grid grid-cols-2 gap-px bg-[var(--app-primary)]/15 text-sm">
                <Stat label={t('calc.pricePerKg')} value={usd2(result.pricePerKgUsd)} />
                <Stat label={t('calc.estimatedUsd')} value={usd2(result.estimatedUsd)} />
                <Stat label={t('calc.exchangeRate')} value={f.number(result.exchangeRate, 2)} />
                <Stat label={t('calc.arrival')} value={t('calc.days', { min: result.days[0], max: result.days[1] })} />
              </dl>
              <p className="flex items-center justify-between gap-2 px-5 py-3 text-xs text-text-2">
                <span>{t('calc.customs')}</span>
                <span className="shrink-0 rounded-full bg-surface px-2 py-0.5 font-medium">{t('calc.sample')}</span>
              </p>
            </div>
            <button type="button" onClick={() => onCreate({ country, method, goods, weight: w })} className={`${primaryBtn} ${press}`}>
              <PackagePlus className="size-5" aria-hidden="true" />
              {t('calc.createOrder')}
            </button>
          </motion.div>
        )}
      </div>
      <GoodsSheet
        t={t}
        open={picker}
        onClose={() => setPicker(false)}
        country={country}
        method={method}
        value={goods}
        onChange={(g) => {
          setGoods(g)
          setShown(false)
        }}
      />
    </Page>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface px-5 py-3.5">
      <dt className="text-xs text-text-2">{label}</dt>
      <dd className="latin mt-0.5 font-semibold tabular-nums">{value}</dd>
    </div>
  )
}

/* ------------------------------------------------------------------ New order */

function NewOrderScreen({ t, usd, back, prefill, onSubmit }: { t: T; usd: Usd; back: () => void; prefill?: Partial<Prefill>; onSubmit: (o: Omit<Order, 'code' | 'placedAt'>) => void }) {
  const f = useFormat()
  const [country, setCountry] = useState<CountryId>(prefill?.country ?? 'china')
  const [method, setMethod] = useState<Method>(prefill?.method ?? 'air')
  const [goods, setGoods] = useState<Goods | null>(prefill?.goods ?? null)
  const [link, setLink] = useState('')
  const [address, setAddress] = useState<'office' | 'home' | null>(null)
  const [notes, setNotes] = useState('')
  const [sheet, setSheet] = useState<'goods' | 'address' | null>(null)
  const [errors, setErrors] = useState<{ goods?: boolean; link?: boolean; address?: boolean }>({})
  const weight = prefill?.weight ?? 0
  const est = goods && weight > 0 ? estimate(country, method, goods, weight) : null

  const submit = () => {
    const next = { goods: !goods, link: !/^https:\/\/[^\s.]+\.[^\s]{2,}/i.test(link.trim()), address: !address }
    setErrors(next)
    if (next.goods || next.link || next.address) return
    onSubmit({ kind: 'buying', country, method, goods: goods!, weight, costUsd: est?.estimatedUsd ?? 0, description: notes.trim(), link: link.trim(), address: address! })
  }

  const detailsError = errors.link ? t('order.linkError') : errors.address ? t('order.addressError') : undefined

  return (
    <Page
      t={t}
      title={t('order.createTitle')}
      back={back}
      footer={
        <button type="button" onClick={submit} className={`flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 text-[15px] font-bold text-white shadow-[0_14px_28px_-14px_rgba(16,185,129,0.9)] ${press}`}>
          <Box className="size-5" aria-hidden="true" />
          {t('order.submit')}
        </button>
      }
    >
      <div className="flex flex-col gap-6 px-4 pt-1 pb-6">
        <Group label={t('order.route')}>
          <div className={`${card} flex items-center gap-2 px-5 py-5`}>
            <div className="flex w-20 flex-col items-start gap-1.5">
              <Flag id={country} className="h-9 w-[54px]" />
              <p className="truncate font-bold">{t(`countries.${country}`)}</p>
              <p className="-mt-1 text-xs text-text-2">{t('order.from')}</p>
            </div>
            <div className="flex flex-1 flex-col items-center gap-1.5">
              <div className="flex w-full items-center">
                <span className="h-0.5 flex-1 rounded-full bg-[var(--app-primary)]/25" />
                <IconBox className="size-12 rounded-full">
                  <MethodIcon method={method} className="size-5 rtl:-scale-x-100" />
                </IconBox>
                <span className="h-0.5 flex-1 rounded-full bg-[var(--app-primary)]/25" />
              </div>
              <span className="text-xs font-bold text-[var(--app-primary)]">{t(`methods.${method}`)}</span>
            </div>
            <div className="flex w-20 flex-col items-end gap-1.5">
              <span className="relative">
                <Flag id="libya" className="h-9 w-[54px]" />
                <span className="absolute -start-2 -bottom-2 grid size-5 place-items-center rounded-full border border-border bg-surface text-text-2">
                  <Lock className="size-3" aria-hidden="true" />
                </span>
              </span>
              <p className="font-bold">{t('countries.libya')}</p>
              <p className="-mt-1 text-xs text-text-2">{t('order.to')}</p>
            </div>
          </div>
        </Group>

        <Group label={t('order.settings')}>
          <div role="radiogroup" aria-label={t('calc.country')} className="flex flex-col gap-2">
            {countries.map((c) => {
              const on = c.id === country
              return (
                <button
                  key={c.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => setCountry(c.id)}
                  className={`flex h-14 items-center gap-3 rounded-2xl border bg-surface px-4 text-start transition-colors ${press} ${on ? 'border-[var(--app-primary)] ring-4 ring-[var(--app-primary)]/10' : 'border-border'}`}
                >
                  <Flag id={c.id} className="h-5 w-8" />
                  <span className="flex-1 font-bold">{t(`countries.${c.id}`)}</span>
                  {on && <Check className="size-5 text-emerald-500" aria-hidden="true" />}
                </button>
              )
            })}
          </div>
          <div className="mt-1">
            <MethodPicker t={t} value={method} onChange={setMethod} />
          </div>
        </Group>

        <Group label={t('goods.label')} error={errors.goods ? t('order.goodsError') : undefined}>
          <button
            type="button"
            onClick={() => setSheet('goods')}
            className={`flex h-14 items-center gap-3 rounded-2xl border bg-surface px-4 text-start ${press} ${errors.goods ? 'border-[var(--app-primary)]' : 'border-border'}`}
          >
            <Package className="size-5 shrink-0 text-text-2" aria-hidden="true" />
            <span className={`min-w-0 flex-1 truncate ${goods ? 'font-bold' : 'text-text-2'}`}>{goods ? t(`goods.${goods}`) : t('goods.choose')}</span>
            {goods && <PriceChip t={t} value={f.money(estimate(country, method, goods, 1).pricePerKgUsd, 'USD', 2)} />}
            <ChevronDown className="size-5 shrink-0 text-text-2" aria-hidden="true" />
          </button>
        </Group>

        <Group label={t('order.orderDetails')} error={detailsError}>
          <div className={`${card} divide-y divide-border overflow-hidden`}>
            <label className="flex items-center gap-3 px-4 py-3">
              <IconBox>
                <ShoppingCart className="size-5" aria-hidden="true" />
              </IconBox>
              <input
                type="url"
                inputMode="url"
                autoComplete="off"
                placeholder={t('order.supplierLink')}
                aria-label={t('order.supplierLink')}
                value={link}
                onChange={(e) => setLink(e.target.value)}
                aria-invalid={errors.link}
                dir={link ? 'ltr' : undefined}
                className="h-11 min-w-0 flex-1 bg-transparent text-[16px] outline-none placeholder:text-text-2"
              />
            </label>
            <button type="button" onClick={() => setSheet('address')} className={`flex w-full items-center gap-3 px-4 py-3 text-start ${press}`}>
              <IconBox>
                <MapPin className="size-5" aria-hidden="true" />
              </IconBox>
              <span className={`min-w-0 flex-1 truncate ${address ? 'font-semibold' : 'text-text-2'}`}>{address ? t(`order.${address}`) : t('order.chooseAddress')}</span>
              <span className="grid size-7 shrink-0 place-items-center rounded-full border border-border text-text-2">
                <ArrowRight className="size-3.5 rtl:-scale-x-100" aria-hidden="true" />
              </span>
            </button>
            <label className="flex items-start gap-3 px-4 py-3">
              <IconBox tone="muted">
                <Package className="size-5" aria-hidden="true" />
              </IconBox>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t('order.descPlaceholder')}
                aria-label={t('order.notes')}
                className="min-w-0 flex-1 resize-none bg-transparent pt-2.5 text-[16px] outline-none placeholder:text-text-2"
              />
            </label>
          </div>
        </Group>

        {est && (
          <p className="flex items-center gap-2 rounded-2xl bg-[var(--app-primary)]/[0.07] px-4 py-3 text-[13px] text-text-2">
            <Calculator className="size-4 shrink-0 text-[var(--app-primary)]" aria-hidden="true" />
            {t('order.fromCalc', { weight: f.number(weight, weight % 1 ? 1 : 0), cost: usd(est.estimatedUsd) })}
          </p>
        )}
      </div>

      <GoodsSheet
        t={t}
        open={sheet === 'goods'}
        onClose={() => setSheet(null)}
        country={country}
        method={method}
        value={goods}
        onChange={(g) => {
          setGoods(g)
          setErrors((e) => ({ ...e, goods: false }))
        }}
      />
      <Sheet open={sheet === 'address'} onClose={() => setSheet(null)} title={t('order.address')} closeLabel={t('close')}>
        <div role="radiogroup" aria-label={t('order.address')} className="flex flex-col gap-2 pt-1">
          {(['office', 'home'] as const).map((a) => (
            <button
              key={a}
              type="button"
              role="radio"
              aria-checked={address === a}
              onClick={() => {
                setAddress(a)
                setErrors((e) => ({ ...e, address: false }))
                setSheet(null)
              }}
              className={`flex min-h-14 items-center gap-3 rounded-2xl border px-4 text-start text-sm font-semibold ${press} ${address === a ? 'border-[var(--app-primary)] bg-[var(--app-primary)]/[0.07]' : 'border-border'}`}
            >
              <IconBox className="size-10">
                <MapPin className="size-4.5" aria-hidden="true" />
              </IconBox>
              <span className="flex-1">{t(`order.${a}`)}</span>
              {address === a && <Check className="size-4.5 text-[var(--app-primary)]" aria-hidden="true" />}
            </button>
          ))}
        </div>
      </Sheet>
    </Page>
  )
}

/* ------------------------------------------------------------------ Order detail */

const DAY = 86_400_000

function OrderScreen({ t, usd, order, now, back, onTrack }: { t: T; usd: Usd; order: Order; now: number; back: () => void; onTrack: () => void }) {
  const f = useFormat()
  const s = statusOf(order, now)
  const idx = statusFlow.indexOf(s)
  const est = estimate(order.country, order.method, order.goods, Math.max(order.weight, 0))
  const updated = order.fixedStatus ? Math.min(now, order.placedAt + idx * 2 * DAY) : order.placedAt + statusAt[s] * 1000
  const stamp = (ms: number) => `${f.date(new Date(ms), { day: 'numeric', month: 'long', year: 'numeric' })} - ${f.time(new Date(ms))}`
  const methodShip = t('order.methodShip', { method: t(`methods.${order.method}`) })
  let host = ''
  try {
    host = order.link ? new URL(order.link).host : ''
  } catch {
    host = ''
  }

  return (
    <Page t={t} title={t('order.orderDetails')} back={back}>
      <div className="flex flex-col gap-4 px-4 pt-1 pb-8">
        <section className={`${card} p-5`}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="latin truncate text-2xl font-bold">{order.code}</p>
              <p className="mt-1 text-[13px] text-text-2">
                {t(`order.${order.kind}`)} · {methodShip}
              </p>
            </div>
            <StatusBadge s={s} t={t} />
          </div>
          <div className="my-4 h-px bg-border" />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-text-2">{t('order.created')}</p>
              <p className="mt-1 text-[13px] font-bold">{stamp(order.placedAt)}</p>
            </div>
            <div className="text-end">
              <p className="text-xs text-text-2">{t('order.updated')}</p>
              <p className="mt-1 text-[13px] font-bold">{stamp(updated)}</p>
            </div>
          </div>
          {!order.fixedStatus && s !== 'delivered' && <p className="mt-4 rounded-xl bg-surface-2 px-3 py-2.5 text-xs leading-relaxed text-text-2">{t('order.demoHint')}</p>}
        </section>

        <TrackPreview t={t} order={order} now={now} onTrack={onTrack} />

        <section className={`${card} p-5`}>
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-bold">{t('order.details')}</h3>
            <span className="inline-flex h-8 items-center gap-1.5 rounded-full bg-[var(--app-primary)]/10 px-3 text-xs font-bold text-[var(--app-primary)]">
              <MethodIcon method={order.method} className="size-3.5" />
              {methodShip}
            </span>
          </div>
          <div className="mt-4 rounded-2xl bg-surface-2 p-4">
            <IconBox className="size-9">
              <Scale className="size-4.5" aria-hidden="true" />
            </IconBox>
            <p className="latin mt-3 text-2xl font-bold tabular-nums">
              {f.number(order.weight, order.weight % 1 ? 1 : 0)} <span className="text-sm font-semibold text-text-2">{t('calc.kg')}</span>
            </p>
            <p className="text-xs text-text-2">{t('order.approvedWeight')}</p>
          </div>
          <dl className="mt-2 divide-y divide-border">
            <InfoRow icon={User} label={t('order.customer')} value={t('home.name')} />
            <InfoRow icon={Globe} label={t('order.country')} value={t(`countries.${order.country}`)} />
            <InfoRow icon={Tag} label={t('order.kindLabel')} value={t(`order.${order.kind}`)} />
            <InfoRow icon={Package} label={t('goods.label')} value={t(`goods.${order.goods}`)} />
            {order.costUsd > 0 && <InfoRow icon={Banknote} label={t('order.cost')} value={`${usd(order.costUsd)} · ${f.money(est.estimatedLyd, 'LYD')}`} />}
            {order.address && <InfoRow icon={MapPin} label={t('order.address')} value={t(`order.${order.address}`)} />}
          </dl>
        </section>

        {order.kind === 'buying' && (
          <section className={`${card} p-5`}>
            <h3 className="flex items-center gap-2 text-lg font-bold">
              {t('order.products')}
              <span className="latin grid size-7 place-items-center rounded-full bg-surface-2 text-xs font-bold text-text-2">1</span>
            </h3>
            <div className="mt-4 flex items-center gap-3">
              <IconBox tone="muted" className="size-16 rounded-2xl">
                <ImageIcon className="size-6" strokeWidth={1.6} aria-hidden="true" />
              </IconBox>
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold">{order.description || t('order.product')}</p>
                {host && <p className="latin truncate text-xs text-text-2">{host}</p>}
                <p className="text-xs text-text-2">{t('order.qty', { n: 1 })}</p>
              </div>
              <span className="latin font-bold text-[var(--app-primary)]">{order.costUsd > 0 ? usd(order.costUsd) : '—'}</span>
            </div>
          </section>
        )}

        <section className={`${card} p-5`}>
          <h3 className="text-lg font-bold">{t('order.timeline')}</h3>
          <ol className="mt-4">
            {statusFlow.map((st, i) => {
              const reached = i <= idx
              const current = i === idx
              const at = order.fixedStatus ? null : new Date(order.placedAt + statusAt[st] * 1000)
              return (
                <li key={st} className="relative flex gap-4 pb-5 last:pb-0">
                  {i < statusFlow.length - 1 && (
                    <span className={`absolute start-[11px] top-6 bottom-0 w-0.5 rounded-full transition-colors duration-500 ${i < idx ? 'bg-[var(--app-primary)]' : 'bg-surface-2'}`} aria-hidden="true" />
                  )}
                  <span className={`relative z-10 grid size-6 shrink-0 place-items-center rounded-full transition-colors duration-500 ${reached ? 'bg-[var(--app-primary)] text-white' : 'border-2 border-surface-2 bg-surface'}`}>
                    {reached && <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />}
                    {current && s !== 'delivered' && <span className="absolute inset-0 rounded-full ring-4 ring-[var(--app-primary)]/25 motion-safe:animate-pulse" aria-hidden="true" />}
                  </span>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <p className={`text-sm font-semibold ${reached ? '' : 'text-text-2'}`}>{t(`status.${st}`)}</p>
                    {reached && <p className="mt-0.5 text-[13px] leading-snug text-text-2">{t(`statusBody.${st}`, { method: t(`methods.${order.method}`), country: t(`countries.${order.country}`) })}</p>}
                  </div>
                  {reached && at && <span className="latin pt-0.5 text-xs text-text-2">{f.time(at)}</span>}
                </li>
              )
            })}
          </ol>
        </section>
      </div>
    </Page>
  )
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof User; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 py-3">
      <IconBox tone="muted" className="size-10">
        <Icon className="size-4.5" aria-hidden="true" />
      </IconBox>
      <dt className="flex-1 text-sm text-text-2">{label}</dt>
      <dd className="text-end text-sm font-bold">{value}</dd>
    </div>
  )
}

/* ------------------------------------------------------------------ Wallet */

function WalletScreen({ t, usd, balance, txns, back }: { t: T; usd: Usd; balance: number; txns: Txn[]; back: () => void }) {
  const f = useFormat()
  const [newest, setNewest] = useState(true)
  const kinds = ['all', 'deposit', 'payment', 'refund'] as const
  const [kind, setKind] = useState<(typeof kinds)[number]>('all')
  const list = txns.filter((x) => kind === 'all' || x.kind === kind).sort((a, b) => (newest ? b.at - a.at : a.at - b.at))

  return (
    <Page t={t} title={t('wallet.title')} back={back}>
      <div className="flex flex-col gap-5 px-4 pt-2 pb-8">
        <div className="relative h-52 overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-[#1E3A8A] via-[#1D4ED8] to-[#7DB8F2] p-6 text-white shadow-[0_26px_40px_-22px_rgba(29,78,216,0.9)]">
          <span className="pointer-events-none absolute -end-10 -bottom-16 size-56 rounded-full bg-white/10 blur-xl" aria-hidden="true" />
          <div className="relative flex h-full flex-col">
            <div className="flex items-center justify-between">
              <span className="latin text-sm font-bold tracking-[0.28em]">UAB SHIPPING</span>
              <Nfc className="size-6 opacity-90" aria-hidden="true" />
            </div>
            <span className="mt-4 grid h-9 w-12 grid-cols-3 gap-px overflow-hidden rounded-md bg-gradient-to-br from-slate-100 to-slate-400 p-1 shadow-inner" aria-hidden="true">
              {Array.from({ length: 6 }, (_, i) => (
                <span key={i} className="rounded-[2px] border border-slate-500/30" />
              ))}
            </span>
            <p className="mt-auto text-xs text-white/75">{t('wallet.balance')}</p>
            <div className="flex items-end justify-between gap-3">
              <p className="latin text-[2.25rem] leading-none font-bold tabular-nums">
                <CountUp value={balance} format={usd} />
              </p>
              <span className="latin pb-1 text-sm tracking-[0.2em] text-white/80" dir="ltr">
                •••• 1042
              </span>
            </div>
          </div>
        </div>

        <h3 className="text-xl font-bold">{t('wallet.history')}</h3>
        <div className="-mt-2 flex flex-wrap gap-2">
          <button type="button" onClick={() => setNewest((v) => !v)} className={`inline-flex h-10 items-center gap-2 rounded-full border border-border bg-surface px-3.5 text-[13px] ${press}`}>
            <ListFilter className="size-4 text-text-2" aria-hidden="true" />
            <span className="text-text-2">{t('wallet.sort')}</span>
            <span className="font-bold">{newest ? t('wallet.newest') : t('wallet.oldest')}</span>
          </button>
          <button
            type="button"
            onClick={() => setKind((k) => kinds[(kinds.indexOf(k) + 1) % kinds.length])}
            className={`inline-flex h-10 items-center gap-2 rounded-full border border-border bg-surface px-3.5 text-[13px] ${press}`}
          >
            <Filter className="size-4 text-text-2" aria-hidden="true" />
            <span className="text-text-2">{t('wallet.filter')}</span>
            <span className="font-bold">{kind === 'all' ? t('filters.all') : t(`txn.${kind}`)}</span>
          </button>
        </div>

        <ul className="flex flex-col gap-3" aria-live="polite">
          {list.length === 0 && <li className="py-10 text-center text-sm text-text-2">{t('wallet.empty')}</li>}
          {list.map((x) => {
            const incoming = x.kind !== 'payment'
            return (
              <li key={x.id} className={`${card} flex items-center gap-3 p-4`}>
                <span className={`grid size-12 shrink-0 place-items-center rounded-xl ${incoming ? 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-400' : 'bg-surface-2 text-text-2'}`}>
                  {incoming ? <ArrowDownLeft className="size-5" aria-hidden="true" /> : <ArrowUpRight className="size-5" aria-hidden="true" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold">{t(`txn.${x.kind}`)}</p>
                  <p className="latin truncate text-xs text-text-2">
                    {x.kind.toUpperCase()} · <bdi dir="ltr">{f.date(new Date(x.at), { day: '2-digit', month: '2-digit' })}</bdi> · {x.ref}
                  </p>
                </div>
                <span className={`latin font-bold tabular-nums ${incoming ? 'text-emerald-600 dark:text-emerald-400' : ''}`} dir="ltr">
                  {incoming ? '+' : '−'}
                  {f.number(x.amount, 2)}
                </span>
              </li>
            )
          })}
        </ul>
      </div>
    </Page>
  )
}

/* ------------------------------------------------------------------ Sheets */

function Addresses({ t }: { t: T }) {
  const [copied, setCopied] = useState<string | null>(null)
  const copy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(id)
      window.setTimeout(() => setCopied(null), 1600)
    } catch {
      /* clipboard blocked: nothing to do in a demo */
    }
  }
  return (
    <div className="flex flex-col gap-3 pt-1">
      <p className="text-sm leading-relaxed text-text-2">{t('addresses.intro')}</p>
      <div className="flex items-center justify-between rounded-2xl bg-[var(--app-primary)]/10 px-4 py-3 text-sm">
        <span>{t('addresses.customerCode')}</span>
        <span className="latin font-bold text-[var(--app-primary)]">{CUSTOMER_CODE}</span>
      </div>
      {countries.map((c) => {
        const text = `${t(`addresses.${c.id}`)} · ${CUSTOMER_CODE}`
        return (
          <div key={c.id} className="flex items-start gap-3 rounded-2xl border border-border p-4">
            <Flag id={c.id} className="mt-0.5 h-6 w-9" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{t(`countries.${c.id}`)}</p>
              <p className="mt-0.5 text-[13px] leading-snug text-text-2">{t(`addresses.${c.id}`)}</p>
            </div>
            <button type="button" onClick={() => copy(c.id, text)} aria-label={t('addresses.copy')} className={`grid size-11 shrink-0 place-items-center rounded-full text-text-2 hover:bg-surface-2 ${press}`}>
              {copied === c.id ? <Check className="size-4.5 text-[var(--app-primary)]" aria-hidden="true" /> : <Copy className="size-4.5" aria-hidden="true" />}
            </button>
          </div>
        )
      })}
      <span className="sr-only" aria-live="polite">
        {copied ? t('addresses.copied') : ''}
      </span>
    </div>
  )
}

/* ------------------------------------------------------------------ Settings */

interface SettingsRowDef {
  icon: typeof User
  label: string
  value?: string
  trailing?: ReactNode
  onClick: () => void
}

function SettingsTab({ t, unread, onBell, open, openAddresses, say }: { t: T; unread: number; onBell: () => void; open: (r: Route) => void; openAddresses: () => void; say: (s: string) => void }) {
  const { toggleLang } = useLanguage()
  const { theme, toggleTheme } = useTheme()
  const later = () => say(t('toast.realApp'))
  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(CUSTOMER_CODE)
    } catch {
      /* clipboard blocked: still confirm, the code is on screen */
    }
    say(t('settings.copied'))
  }

  const groups: { title: string; rows: SettingsRowDef[] }[] = [
    {
      title: t('settings.account'),
      rows: [
        {
          icon: Hash,
          label: t('settings.customerCode'),
          onClick: copyCode,
          trailing: (
            <span className="inline-flex items-center gap-2 text-[var(--app-primary)]">
              <span className="latin text-sm font-bold text-text">{CUSTOMER_CODE}</span>
              <Copy className="size-4.5" aria-hidden="true" />
            </span>
          ),
        },
        { icon: User, label: t('settings.manage'), onClick: later },
        { icon: MapPin, label: t('settings.addresses'), onClick: openAddresses },
        { icon: Globe, label: t('settings.rates'), onClick: () => open({ name: 'rates', country: 'china' }) },
      ],
    },
    {
      title: t('settings.preferences'),
      rows: [
        { icon: Paintbrush, label: t('settings.appearance'), value: theme === 'dark' ? t('settings.dark') : t('settings.light'), onClick: toggleTheme },
        { icon: Languages, label: t('settings.language'), value: t('settings.languageValue'), onClick: toggleLang },
        { icon: WalletCards, label: t('settings.wallet'), onClick: () => open({ name: 'wallet' }) },
      ],
    },
    {
      title: t('settings.legal'),
      rows: [
        { icon: ReceiptText, label: t('settings.terms'), onClick: later },
        { icon: Shield, label: t('settings.freightTerms'), onClick: later },
        { icon: ShieldAlert, label: t('settings.prohibited'), onClick: later },
        { icon: LockKeyhole, label: t('settings.privacy'), onClick: later },
      ],
    },
    {
      title: t('settings.actions'),
      rows: [
        { icon: Headphones, label: t('settings.support'), onClick: () => say(t('toast.support')) },
        { icon: LogOut, label: t('settings.logout'), onClick: () => say(t('toast.logout')) },
      ],
    },
  ]

  return (
    <div className="flex flex-col gap-6 px-4 pt-4 pb-8">
      <div className="flex items-center justify-between">
        <h2 className="text-[1.75rem] font-bold">{t('settings.title')}</h2>
        <button type="button" onClick={onBell} aria-label={t('home.notifications')} className={`relative grid size-12 place-items-center rounded-2xl border border-border bg-surface ${press}`}>
          <Bell className="size-5" aria-hidden="true" />
          {unread > 0 && <span className="absolute end-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-[var(--app-primary)] px-1 font-sans text-[10px] font-bold text-white">{unread}</span>}
        </button>
      </div>

      <div className={`${card} flex items-center gap-4 p-4`}>
        <span className="grid size-14 shrink-0 place-items-center rounded-full bg-text text-base font-bold text-bg">{t('home.initials')}</span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-bold">{t('home.name')}</p>
          <p className="latin text-sm text-text-2" dir="ltr">
            {t('settings.phone')}
          </p>
        </div>
        <span className="shrink-0 rounded-lg bg-[var(--app-primary)]/12 px-2.5 py-1 text-xs font-bold text-[var(--app-primary)]">{t('settings.verified')}</span>
      </div>

      {groups.map((g) => (
        <section key={g.title}>
          <h3 className="px-1 pb-2.5 text-[13px] font-bold text-text-2">{g.title}</h3>
          <ul className={`${card} overflow-hidden`}>
            {g.rows.map((r) => {
              const Icon = r.icon
              return (
                <li key={r.label} className="relative after:absolute after:start-14 after:end-4 after:bottom-0 after:h-px after:bg-border last:after:hidden">
                  <button type="button" onClick={r.onClick} className={`flex min-h-[3.75rem] w-full items-center gap-4 px-4 text-start ${press}`}>
                    <Icon className="size-6 shrink-0" strokeWidth={1.6} aria-hidden="true" />
                    <span className="min-w-0 flex-1 truncate text-[15px] font-bold">{r.label}</span>
                    {r.trailing ?? (
                      <>
                        {r.value && <span className="text-sm text-text-2">{r.value}</span>}
                        <ChevronRight className="size-4.5 shrink-0 text-text-2 rtl:-scale-x-100" aria-hidden="true" />
                      </>
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ Live tracking */

/** 0..1 along the route: moves while shipping, full once arrived. Seed orders sit mid-route. */
function routeProgress(o: Order, now: number) {
  const s = statusOf(o, now)
  if (s === 'arrived' || s === 'delivered') return 1
  if (s !== 'in_transit') return 0
  if (o.fixedStatus) return 0.58
  const sec = (now - o.placedAt) / 1000
  return Math.min(1, Math.max(0, (sec - statusAt.in_transit) / (statusAt.arrived - statusAt.in_transit)))
}

function TrackPreview({ t, order, now, onTrack }: { t: T; order: Order; now: number; onTrack: () => void }) {
  const s = statusOf(order, now)
  const open = s === 'in_transit' || s === 'arrived'
  if (!open) {
    const done = s === 'delivered'
    return (
      <div className={`${card} flex gap-3 p-4`}>
        <IconBox tone="muted" className="size-10">
          {done ? <Check className="size-5" aria-hidden="true" /> : <Lock className="size-5" aria-hidden="true" />}
        </IconBox>
        <div>
          <p className="text-sm font-semibold">{done ? t('track.endedTitle') : t('track.lockedTitle')}</p>
          <p className="mt-0.5 text-[13px] leading-snug text-text-2">{done ? t('track.endedBody') : t('track.lockedBody', { status: t(`status.${s}`) })}</p>
        </div>
      </div>
    )
  }
  return (
    <button type="button" onClick={onTrack} className={`${card} relative block overflow-hidden text-start ${press}`} aria-label={t('track.open')}>
      <div className="h-44">
        <LiveMap country={order.country} method={order.method} progress={routeProgress(order, now)} statusLabel={t(`status.${s}`)} originLabel={t(`countries.${order.country}`)} destinationLabel={t('countries.libya')} compact />
      </div>
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <span className="flex items-center gap-2 text-sm font-semibold">
          <Navigation className="size-4 text-[var(--app-primary)]" aria-hidden="true" />
          {t('track.open')}
        </span>
        <Maximize2 className="size-4 text-text-2" aria-hidden="true" />
      </div>
    </button>
  )
}

function TrackScreen({ t, order, now, back, onOpen }: { t: T; order: Order; now: number; back: () => void; onOpen: () => void }) {
  const s = statusOf(order, now)
  const progress = routeProgress(order, now)
  const est = estimate(order.country, order.method, order.goods, order.weight)
  const daysLeft = Math.max(0, Math.round(est.days[1] * (1 - progress)))
  useEffect(() => {
    onOpen()
  }, [onOpen])
  return (
    <div className="relative flex h-full min-h-0 flex-col">
      <div className="relative min-h-0 flex-1">
        <LiveMap country={order.country} method={order.method} progress={progress} statusLabel={t(`status.${s}`)} originLabel={t(`countries.${order.country}`)} destinationLabel={t('countries.libya')} />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-bg/90 to-transparent" aria-hidden="true" />
        <div className="absolute inset-x-0 top-0 flex items-center gap-2 px-3 pt-2">
          <button type="button" onClick={back} aria-label={t('back')} className={`grid size-11 place-items-center rounded-full border border-border bg-surface/90 backdrop-blur ${press}`}>
            <ArrowLeft className="size-5 rtl:-scale-x-100" aria-hidden="true" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-semibold">{t('track.title')}</p>
            <p className="latin truncate text-xs text-text-2">{order.code}</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-surface/90 px-3 py-1.5 text-xs font-semibold text-[var(--app-primary)] backdrop-blur">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full rounded-full bg-[var(--app-primary)] opacity-60 motion-safe:animate-ping" />
              <span className="relative inline-flex size-2 rounded-full bg-[var(--app-primary)]" />
            </span>
            {t('track.live')}
          </span>
        </div>
      </div>
      <div className="shrink-0 rounded-t-[1.75rem] border-t border-border bg-surface px-5 pt-4 pb-[max(1rem,var(--safe-bottom,env(safe-area-inset-bottom)))] shadow-[0_-20px_40px_-24px_rgba(0,0,0,0.3)]">
        <div className="flex items-center justify-between gap-3">
          <StatusBadge s={s} t={t} />
          <span className="text-xs text-text-2">{progress >= 1 ? t('track.arrived') : t('track.eta', { n: daysLeft })}</span>
        </div>
        <div className="mt-4 flex items-center justify-between text-xs font-semibold">
          <span>{t(`countries.${order.country}`)}</span>
          <span className="latin text-[var(--app-primary)] tabular-nums">{Math.round(progress * 100)}%</span>
          <span>{t('countries.libya')}</span>
        </div>
        <div className="relative mt-2 h-2 rounded-full bg-surface-2" role="progressbar" aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100} aria-label={t('track.journey')}>
          <div className="h-full rounded-full bg-[var(--app-primary)] transition-[width] duration-700 ease-out" style={{ width: `${progress * 100}%` }} />
        </div>
        <p className="mt-3 text-[13px] leading-snug text-text-2">{t(`statusBody.${s}`, { method: t(`methods.${order.method}`), country: t(`countries.${order.country}`) })}</p>
      </div>
    </div>
  )
}
