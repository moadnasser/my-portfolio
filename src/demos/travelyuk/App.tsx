import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  BedDouble,
  Briefcase,
  CalendarDays,
  Check,
  ChevronRight,
  Clock,
  Compass,
  CreditCard,
  FileCheck2,
  Hourglass,
  Inbox,
  Landmark,
  Luggage,
  Minus,
  Mountain,
  Plane,
  Plus,
  ShieldCheck,
  ShoppingCart,
  Star,
  Tent,
  Ticket,
  Trash2,
  Users,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useLocalized } from '../../i18n/context'
import { useTheme } from '../../theme/context'
import { useDemo } from '../kit/DemoContext'
import { useFormat } from '../kit/format'
import { press } from '../kit/mobile'
import { Sheet } from '../kit/Sheet'
import { useDemoStrings } from '../kit/strings'
import ar from './ar.json'
import {
  DAY,
  fees,
  flights,
  HOLD_MINUTES,
  hotels,
  HOUR,
  PAYMENT_WINDOW_HOURS,
  policies,
  refundPct,
  seedTrips,
  visas,
  WARNING_SECONDS,
  type Booking,
  type BookingStatus,
  type CartItem,
  type Nationality,
  type Trip,
  type TripRequest,
} from './data'
import en from './en.json'

type Role = 'customer' | 'staff'
type CustomerTab = 'explore' | 'travel' | 'cart' | 'bookings' | 'trips'
type StaffTab = 'requests' | 'desk'
type Sub = { name: 'review' } | { name: 'pay'; kind: 'booking' | 'trip'; id: string } | { name: 'booking'; ref: string } | null

type T = ReturnType<typeof useDemoStrings>

export default function TravelyukApp() {
  const t = useDemoStrings(en, ar)
  const f = useFormat()
  const { theme } = useTheme()
  const { complete } = useDemo()
  const lyd = useCallback((n: number) => f.money(n, 'LYD', 3), [f])

  const [role, setRole] = useState<Role>('customer')
  const [ctab, setCtab] = useState<CustomerTab>('explore')
  const [stab, setStab] = useState<StaffTab>('requests')
  const [sub, setSub] = useState<Sub>(null)
  const [offset, setOffset] = useState(0) // demo fast-forward
  const [clock, setClock] = useState(() => Date.now())
  const now = clock + offset
  const [trips] = useState<Trip[]>(() => seedTrips(Date.now()))
  const [cart, setCart] = useState<CartItem[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [requests, setRequests] = useState<TripRequest[]>([])
  const [seq, setSeq] = useState(16)
  const [toast, setToast] = useState<{ id: number; text: string } | null>(null)

  const say = useCallback((text: string) => setToast({ id: Date.now(), text }), [])
  useEffect(() => {
    if (!toast) return
    const id = window.setTimeout(() => setToast(null), 2800)
    return () => window.clearTimeout(id)
  }, [toast])

  const holding = bookings.some((b) => b.status === 'pending_payment')
  useEffect(() => {
    if (!holding) return
    const id = window.setInterval(() => setClock(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [holding])

  // Unpaid holds expire on their own, as the backend does. Derived, never stored.
  const live = useMemo(
    () => bookings.map((b) => (b.status === 'pending_payment' && b.payment?.status !== 'pending' && b.holdExpiresAt <= now ? { ...b, status: 'expired' as const } : b)),
    [bookings, now],
  )

  const pendingRequests = requests.filter((r) => r.status === 'pending').length

  const goCustomer = (tab: CustomerTab) => {
    setRole('customer')
    setCtab(tab)
    setSub(null)
  }

  const reserve = () => {
    const ref = `TVL-2026-${String(seq).padStart(6, '0')}`
    setSeq((n) => n + 1)
    const { total } = fees(cart)
    const createdAt = now
    setBookings((list) => [{ ref, items: cart, total, status: 'pending_payment', createdAt, holdExpiresAt: createdAt + HOLD_MINUTES * 60_000 }, ...list])
    setCart([])
    complete('hold')
    setCtab('bookings')
    setSub({ name: 'pay', kind: 'booking', id: ref })
  }

  const paid = (kind: 'booking' | 'trip', id: string, method: 'card' | 'bank_transfer', payRef: string) => {
    if (kind === 'trip') {
      setRequests((list) => list.map((r) => (r.id === id ? { ...r, status: 'confirmed' } : r)))
      setCtab('trips')
    } else {
      setBookings((list) =>
        list.map((b) =>
          b.ref === id
            ? method === 'card'
              ? { ...b, status: 'confirmed', payment: { method, status: 'paid', ref: payRef } }
              : { ...b, holdExpiresAt: now + 24 * HOUR, payment: { method, status: 'pending', ref: payRef } }
            : b,
        ),
      )
      setCtab('bookings')
    }
    if (method === 'card') {
      complete('pay')
      say(t('toast.paid'))
    }
    setSub(kind === 'booking' ? { name: 'booking', ref: id } : null)
  }

  const primary = theme === 'dark' ? '#60A5FA' : '#2563EB'
  const onPrimary = theme === 'dark' ? '#0B1220' : '#FFFFFF'

  /* ------------------------------------------------ content */
  let content: ReactNode
  if (role === 'staff') {
    content =
      stab === 'requests' ? (
        <StaffRequests
          t={t}
          lyd={lyd}
          trips={trips}
          requests={requests}
          onApprove={(id, hours) => {
            setRequests((list) => list.map((r) => (r.id === id ? { ...r, status: 'pending_payment', paymentDueAt: now + hours * HOUR } : r)))
            complete('approve')
            say(t('toast.approved'))
          }}
          onDecline={(id) => {
            setRequests((list) => list.map((r) => (r.id === id ? { ...r, status: 'rejected' } : r)))
            say(t('toast.declined'))
          }}
        />
      ) : (
        <StaffDesk
          t={t}
          lyd={lyd}
          bookings={live}
          onConfirmTransfer={(ref) => {
            setBookings((list) => list.map((b) => (b.ref === ref ? { ...b, status: 'confirmed', payment: b.payment && { ...b.payment, status: 'paid' } } : b)))
            complete('pay')
            say(t('toast.paid'))
          }}
        />
      )
  } else if (sub?.name === 'review') {
    content = <Review t={t} lyd={lyd} cart={cart} back={() => setSub(null)} onReserve={reserve} />
  } else if (sub?.name === 'pay') {
    if (sub.kind === 'booking') {
      const b = live.find((x) => x.ref === sub.id)!
      content = <PayView t={t} lyd={lyd} title={b.ref} amount={b.total} items={b.items} hold={b} now={now} allowBank back={() => setSub(null)} onSkip={() => setOffset((o) => o + 5 * 60_000)} onExpiredSearch={() => goCustomer('travel')} onPaid={(m, ref) => paid('booking', b.ref, m, ref)} />
    } else {
      const r = requests.find((x) => x.id === sub.id)!
      const trip = trips.find((x) => x.id === r.tripId)!
      content = <PayView t={t} lyd={lyd} title={trip.title} amount={r.total} now={now} back={() => setSub(null)} onPaid={(m, ref) => paid('trip', r.id, m, ref)} />
    }
  } else if (sub?.name === 'booking') {
    const b = live.find((x) => x.ref === sub.ref)!
    content = (
      <BookingDetail
        t={t}
        lyd={lyd}
        b={b}
        now={now}
        back={() => setSub(null)}
        onPay={() => setSub({ name: 'pay', kind: 'booking', id: b.ref })}
        onCancel={(refund) => {
          setBookings((list) => list.map((x) => (x.ref === b.ref ? { ...x, status: 'refunded', refund, payment: x.payment && { ...x.payment, status: 'refunded' } } : x)))
          complete('cancel')
          say(t('bookings.cancelled'))
        }}
      />
    )
  } else {
    content = {
      explore: (
        <Explore
          t={t}
          lyd={lyd}
          trips={trips}
          onRequest={(trip, travelers, notes) => {
            setRequests((list) => [{ id: `r${Date.now()}`, tripId: trip.id, travelers, notes, total: trip.priceLyd * travelers, status: 'pending', createdAt: now }, ...list])
            complete('request')
            say(t('explore.sent'))
            setCtab('trips')
          }}
        />
      ),
      travel: <Travel t={t} lyd={lyd} cart={cart} setCart={setCart} now={now} />,
      cart: <Cart t={t} lyd={lyd} cart={cart} setCart={setCart} onCheckout={() => setSub({ name: 'review' })} browse={() => setCtab('travel')} />,
      bookings: <Bookings t={t} lyd={lyd} bookings={live} now={now} open={(ref) => setSub({ name: 'booking', ref })} browse={() => setCtab('travel')} />,
      trips: <Trips t={t} lyd={lyd} trips={trips} requests={requests} pay={(id) => setSub({ name: 'pay', kind: 'trip', id })} explore={() => setCtab('explore')} />,
    }[ctab]
  }

  const customerNav: NavItem[] = [
    { id: 'explore', label: t('nav.explore'), icon: Compass },
    { id: 'travel', label: t('nav.travel'), icon: Plane },
    { id: 'cart', label: t('nav.cart'), icon: ShoppingCart, badge: cart.length },
    { id: 'bookings', label: t('nav.bookings'), icon: Ticket },
    { id: 'trips', label: t('nav.trips'), icon: Briefcase },
  ]
  const staffNav: NavItem[] = [
    { id: 'requests', label: t('nav.requests'), icon: Inbox, badge: pendingRequests },
    { id: 'desk', label: t('nav.desk'), icon: CalendarDays },
  ]
  const nav = role === 'customer' ? customerNav : staffNav
  const active = role === 'customer' ? ctab : stab
  const select = (id: string) => {
    setSub(null)
    if (role === 'customer') setCtab(id as CustomerTab)
    else setStab(id as StaffTab)
  }
  const switchRole = (r: Role) => {
    setRole(r)
    setSub(null)
  }

  return (
    <div className="@container relative flex min-h-0 flex-1 overflow-hidden bg-bg text-text" style={{ '--app-primary': primary, '--on-app-primary': onPrimary } as React.CSSProperties}>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col @4xl:flex-row">
        {/* Sidebar (wide) */}
        <aside className="hidden w-60 shrink-0 flex-col border-e border-border bg-surface p-4 @4xl:flex">
          <Brand t={t} />
          <nav aria-label={t('nav.label')} className="mt-6 flex flex-col gap-1">
            {nav.map((n) => (
              <SideLink key={n.id} item={n} active={active === n.id && !sub} onClick={() => select(n.id)} />
            ))}
          </nav>
          <div className="mt-auto">
            <p className="mb-2 text-xs font-medium text-text-2">{t('role.label')}</p>
            <RoleSwitch t={t} role={role} onChange={switchRole} badge={pendingRequests} />
          </div>
        </aside>

        {/* Top bar (narrow) */}
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border bg-surface px-3 @4xl:hidden">
          <Brand t={t} compact />
          <div className="ms-auto">
            <RoleSwitch t={t} role={role} onChange={switchRole} badge={pendingRequests} compact />
          </div>
        </header>

        <main className="relative min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`${role}-${active}-${sub ? JSON.stringify(sub) : ''}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="mx-auto w-full max-w-5xl px-4 py-5 @2xl:px-6 @4xl:px-10 @4xl:py-8"
            >
              {content}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Bottom tabs (narrow) */}
        <nav aria-label={t('nav.label')} className="shrink-0 border-t border-border bg-surface pb-[var(--safe-bottom,env(safe-area-inset-bottom))] @4xl:hidden">
          <ul className="flex">
            {nav.map((n) => {
              const on = active === n.id && !sub
              const Icon = n.icon
              return (
                <li key={n.id} className="flex-1">
                  <button type="button" onClick={() => select(n.id)} aria-current={on ? 'page' : undefined} className={`flex h-16 w-full flex-col items-center justify-center gap-1 text-[11px] font-medium ${press} ${on ? 'text-[var(--app-primary)]' : 'text-text-2'}`}>
                    <span className="relative">
                      <Icon className="size-5.5" aria-hidden="true" />
                      {!!n.badge && <Badge n={n.badge} />}
                    </span>
                    <span className="max-w-full truncate px-1">{n.label}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-16 z-50 flex justify-center px-4 @4xl:top-5" aria-live="polite">
        <AnimatePresence>
          {toast && (
            <motion.p
              key={toast.id}
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="flex items-center gap-2 rounded-full bg-[#0f172a] px-4 py-2.5 text-sm font-medium text-white shadow-lg dark:bg-surface-2"
            >
              <Check className="size-4 text-[#93c5fd]" aria-hidden="true" />
              {toast.text}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ================================================================== shell bits */

interface NavItem {
  id: string
  label: string
  icon: typeof Plane
  badge?: number
}

function Badge({ n }: { n: number }) {
  return <span aria-hidden="true" className="absolute -end-2 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-[var(--app-primary)] px-1 font-sans text-[10px] font-bold text-[var(--on-app-primary)]">{n}</span>
}

function Brand({ t, compact }: { t: T; compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="grid size-9 place-items-center rounded-xl bg-[var(--app-primary)] text-[var(--on-app-primary)]">
        <Plane className="size-4.5 -rotate-45" aria-hidden="true" />
      </span>
      <span className={`font-bold tracking-tight ${compact ? 'text-base' : 'text-lg'}`}>{t('brand')}</span>
    </div>
  )
}

function SideLink({ item, active, onClick }: { item: NavItem; active: boolean; onClick: () => void }) {
  const Icon = item.icon
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`relative flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors ${active ? 'bg-[var(--app-primary)]/12 text-[var(--app-primary)]' : 'text-text-2 hover:bg-surface-2 hover:text-text'}`}
    >
      <Icon className="size-5" aria-hidden="true" />
      <span className="flex-1 text-start">{item.label}</span>
      {!!item.badge && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[var(--app-primary)] px-1.5 font-sans text-[11px] font-bold text-[var(--on-app-primary)]">{item.badge}</span>}
    </button>
  )
}

function RoleSwitch({ t, role, onChange, badge, compact }: { t: T; role: Role; onChange: (r: Role) => void; badge: number; compact?: boolean }) {
  return (
    <div role="radiogroup" aria-label={t('role.label')} className={`flex rounded-xl bg-surface-2 p-1 ${compact ? '' : 'w-full'}`}>
      {(['customer', 'staff'] as const).map((r) => {
        const on = role === r
        return (
          <button key={r} type="button" role="radio" aria-checked={on} onClick={() => onChange(r)} className={`relative flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg px-3 text-[13px] font-semibold ${press} ${on ? 'text-text' : 'text-text-2'}`}>
            {on && <motion.span layoutId="ty-role" className="absolute inset-0 rounded-lg bg-surface shadow-sm" transition={{ type: 'spring', stiffness: 500, damping: 38 }} />}
            <span className="relative">{t(`role.${r}`)}</span>
            {r === 'staff' && badge > 0 && role !== 'staff' && (
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full rounded-full bg-[var(--app-primary)] opacity-75 motion-safe:animate-ping" />
                <span className="relative inline-flex size-2 rounded-full bg-[var(--app-primary)]" />
                <span className="sr-only">{t('role.newRequest', { n: badge })}</span>
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

const panel = 'rounded-2xl border border-border bg-surface'
const btnPrimary = `inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[var(--app-primary)] px-5 text-sm font-semibold text-[var(--on-app-primary)] disabled:opacity-50 ${press}`
const btnGhost = `inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-5 text-sm font-semibold ${press}`

function PageHead({ title, subtitle, back, backLabel }: { title: string; subtitle?: string; back?: () => void; backLabel?: string }) {
  return (
    <div className="mb-5 flex items-start gap-2">
      {back && (
        <button type="button" onClick={back} aria-label={backLabel} className={`-ms-2 grid size-11 shrink-0 place-items-center rounded-full hover:bg-surface-2 ${press}`}>
          <ChevronRight className="size-5 ltr:rotate-180" aria-hidden="true" />
        </button>
      )}
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight @4xl:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-text-2">{subtitle}</p>}
      </div>
    </div>
  )
}

function Empty({ icon: Icon, title, hint, action, onAction }: { icon: typeof Plane; title: string; hint: string; action?: string; onAction?: () => void }) {
  return (
    <div className={`${panel} flex flex-col items-center gap-2 px-6 py-14 text-center`}>
      <span className="grid size-14 place-items-center rounded-full bg-[var(--app-primary)]/10 text-[var(--app-primary)]">
        <Icon className="size-6" aria-hidden="true" />
      </span>
      <p className="mt-2 font-semibold">{title}</p>
      <p className="max-w-xs text-sm text-text-2">{hint}</p>
      {action && (
        <button type="button" onClick={onAction} className={`${btnPrimary} mt-3`}>
          {action}
        </button>
      )}
    </div>
  )
}

const tones: Record<string, string> = {
  pending_payment: 'bg-sky-500/12 text-sky-700 dark:text-sky-300',
  pending: 'bg-sky-500/12 text-sky-700 dark:text-sky-300',
  paymentPending: 'bg-sky-500/12 text-sky-700 dark:text-sky-300',
  confirmed: 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-300',
  expired: 'bg-slate-500/12 text-slate-600 dark:text-slate-300',
  cancelled: 'bg-slate-500/12 text-slate-600 dark:text-slate-300',
  rejected: 'bg-slate-500/12 text-slate-600 dark:text-slate-300',
  refunded: 'bg-slate-500/12 text-slate-600 dark:text-slate-300',
}

function StatusPill({ t, s }: { t: T; s: string }) {
  return <span className={`inline-flex h-6 shrink-0 items-center rounded-full px-2.5 text-xs font-semibold whitespace-nowrap ${tones[s]}`}>{t(`status.${s}`)}</span>
}

function Stepper({ label, value, set, min, max, lessLabel, moreLabel }: { label: string; value: number; set: (n: number) => void; min: number; max: number; lessLabel: string; moreLabel: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm font-medium">{label}</span>
      <div className="flex h-11 items-center rounded-xl border border-border bg-surface">
        <button type="button" onClick={() => set(Math.max(min, value - 1))} disabled={value <= min} aria-label={lessLabel} className={`grid size-11 place-items-center disabled:opacity-40 ${press}`}>
          <Minus className="size-4" aria-hidden="true" />
        </button>
        <span className="w-6 text-center font-sans font-semibold tabular-nums" aria-live="polite">
          {value}
        </span>
        <button type="button" onClick={() => set(Math.min(max, value + 1))} disabled={value >= max} aria-label={moreLabel} className={`grid size-11 place-items-center disabled:opacity-40 ${press}`}>
          <Plus className="size-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

/* ================================================================== customer: explore */

const tripIcon = { tent: Tent, mountain: Mountain, landmark: Landmark }

function Explore({ t, lyd, trips, onRequest }: { t: T; lyd: (n: number) => string; trips: Trip[]; onRequest: (trip: Trip, travelers: number, notes: string) => void }) {
  const pick = useLocalized()
  const f = useFormat()
  const [open, setOpen] = useState<Trip | null>(null)
  const [travelers, setTravelers] = useState(2)
  const [notes, setNotes] = useState('')
  return (
    <>
      <PageHead title={t('explore.title')} subtitle={t('explore.subtitle')} />
      <ul className="grid gap-4 @2xl:grid-cols-2 @5xl:grid-cols-3">
        {trips.map((trip) => {
          const Icon = tripIcon[trip.icon]
          const sold = trip.available === 0
          return (
            <li key={trip.id} className={`${panel} flex flex-col overflow-hidden`}>
              <div className={`relative flex h-36 items-end bg-gradient-to-br p-4 text-white ${trip.tone}`}>
                <Icon className="absolute end-4 top-4 size-14 opacity-25" strokeWidth={1.4} aria-hidden="true" />
                <span className="rounded-full bg-black/25 px-2.5 py-1 text-xs font-medium backdrop-blur">{pick(trip.destination)}</span>
              </div>
              <div className="flex flex-1 flex-col gap-2 p-4">
                <h2 className="leading-snug font-semibold">{pick(trip.title)}</h2>
                <p className="flex items-center gap-1.5 text-xs text-text-2">
                  <CalendarDays className="size-3.5" aria-hidden="true" />
                  {t('explore.dates', { from: f.date(new Date(trip.start)), to: f.date(new Date(trip.end)) })}
                </p>
                <div className="mt-auto flex items-end justify-between gap-3 pt-3">
                  <div>
                    <p className="font-sans text-lg font-bold">{lyd(trip.priceLyd)}</p>
                    <p className="text-xs text-text-2">{t('explore.perPerson')}</p>
                  </div>
                  <span className={`text-xs font-medium ${sold ? 'text-text-2' : 'text-[var(--app-primary)]'}`}>{sold ? t('explore.soldOut') : t('explore.seatsLeft', { n: trip.available })}</span>
                </div>
                <button
                  type="button"
                  disabled={sold}
                  onClick={() => {
                    setTravelers(Math.min(2, trip.available))
                    setNotes('')
                    setOpen(trip)
                  }}
                  className={`${btnPrimary} mt-2 w-full`}
                >
                  {sold ? t('explore.soldOut') : t('explore.request')}
                </button>
              </div>
            </li>
          )
        })}
      </ul>
      <Sheet
        open={!!open}
        onClose={() => setOpen(null)}
        title={open ? pick(open.title) : ''}
        closeLabel={t('close')}
        footer={
          open && (
            <div className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-text-2">{t('explore.total')}</p>
                <p className="font-sans font-bold">{lyd(open.priceLyd * travelers)}</p>
              </div>
              <button type="button" onClick={() => (onRequest(open, travelers, notes), setOpen(null))} className={btnPrimary}>
                {t('explore.send')}
              </button>
            </div>
          )
        }
      >
        {open && (
          <div className="flex flex-col gap-5 pt-1">
            <p className="text-sm text-text-2">{t('explore.subtitle')}</p>
            <Stepper label={t('explore.travelers')} value={travelers} set={setTravelers} min={1} max={open.available} lessLabel="−" moreLabel="+" />
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium">{t('explore.notes')}</span>
              <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t('explore.notesPlaceholder')} className="resize-none rounded-xl border border-border bg-surface p-3 text-[16px] outline-none focus:border-[var(--app-primary)]" />
            </label>
          </div>
        )}
      </Sheet>
    </>
  )
}

/* ================================================================== customer: travel */

function Travel({ t, lyd, cart, setCart, now }: { t: T; lyd: (n: number) => string; cart: CartItem[]; setCart: React.Dispatch<React.SetStateAction<CartItem[]>>; now: number }) {
  const pick = useLocalized()
  const f = useFormat()
  const [kind, setKind] = useState<'flights' | 'hotels' | 'visas'>('flights')
  const [pax, setPax] = useState(2)
  const [nights, setNights] = useState(3)
  const [nat, setNat] = useState<Nationality>('LY')
  const inCart = (key: string) => cart.some((c) => c.key === key)
  const add = (item: CartItem) => setCart((c) => (c.some((x) => x.key === item.key) ? c.filter((x) => x.key !== item.key) : [...c, item]))

  return (
    <>
      <PageHead title={t('travel.title')} subtitle={t('travel.subtitle')} />
      <div className="flex flex-col gap-4 @3xl:flex-row @3xl:items-end">
        <div role="tablist" aria-label={t('travel.title')} className="flex rounded-xl bg-surface-2 p-1 @3xl:w-96">
          {(['flights', 'hotels', 'visas'] as const).map((k) => {
            const on = kind === k
            return (
              <button key={k} type="button" role="tab" aria-selected={on} onClick={() => setKind(k)} className={`relative h-10 flex-1 rounded-lg text-sm font-semibold ${press} ${on ? 'text-text' : 'text-text-2'}`}>
                {on && <motion.span layoutId="ty-kind" className="absolute inset-0 rounded-lg bg-surface shadow-sm" transition={{ type: 'spring', stiffness: 500, damping: 38 }} />}
                <span className="relative">{t(`travel.${k}`)}</span>
              </button>
            )
          })}
        </div>
        <div className={`${panel} flex-1 px-4 py-2 @3xl:ms-auto @3xl:max-w-xs`}>
          {kind === 'flights' && <Stepper label={t('travel.passengers')} value={pax} set={setPax} min={1} max={4} lessLabel="−" moreLabel="+" />}
          {kind === 'hotels' && <Stepper label={t('travel.nights')} value={nights} set={setNights} min={1} max={7} lessLabel="−" moreLabel="+" />}
          {kind === 'visas' && (
            <label className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium">{t('travel.nationality')}</span>
              <select value={nat} onChange={(e) => setNat(e.target.value as Nationality)} className="h-11 rounded-xl border border-border bg-surface px-3 text-[16px]">
                {(['LY', 'EG', 'TN'] as const).map((n) => (
                  <option key={n} value={n}>
                    {t(`travel.nat.${n}`)}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
      </div>

      <ul className="mt-5 grid gap-3 @3xl:grid-cols-2">
        {kind === 'flights' &&
          flights.map((fl) => {
            const key = `flight-${fl.id}-${pax}`
            const on = inCart(key)
            const dep = new Date(now + fl.daysAhead * DAY)
            return (
              <li key={fl.id} className={`${panel} flex flex-col gap-4 p-4`}>
                <div className="flex items-center justify-between gap-3 text-xs text-text-2">
                  <span>
                    {pick(fl.airline)} · <span className="font-sans">{fl.no}</span>
                  </span>
                  <span>
                    {f.date(dep, { weekday: 'short', day: 'numeric', month: 'short' })} · {t('travel.inDays', { n: fl.daysAhead })}
                  </span>
                </div>
                <div className="flex items-center gap-3" dir="ltr">
                  <div className="text-start">
                    <p className="font-sans text-xl font-bold">{fl.from}</p>
                    <p className="text-xs text-text-2">{pick(fl.fromCity)}</p>
                  </div>
                  <div className="flex flex-1 flex-col items-center gap-1 text-[11px] text-text-2">
                    <span className="font-sans">{fl.dep}</span>
                    <span className="relative h-px w-full bg-border">
                      <Plane className="absolute start-1/2 -top-2 size-4 -translate-x-1/2 text-[var(--app-primary)]" aria-hidden="true" />
                    </span>
                    <span className="font-sans">{t('travel.duration', { h: Math.floor(fl.minutes / 60), m: fl.minutes % 60 })}</span>
                  </div>
                  <div className="text-end">
                    <p className="font-sans text-xl font-bold">{fl.to}</p>
                    <p className="text-xs text-text-2">{pick(fl.toCity)}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-2">
                  <span className="flex items-center gap-1">
                    <Luggage className="size-3.5" aria-hidden="true" />
                    {t('travel.baggage', { cabin: fl.baggage[0], checked: fl.baggage[1] })}
                  </span>
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="size-3.5" aria-hidden="true" />
                    {fl.policy === 'none' ? t('travel.nonRefundable') : t('travel.refundable')}
                  </span>
                  <span>{t('travel.seatsLeft', { n: fl.seatsLeft })}</span>
                </div>
                <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-3">
                  <div>
                    <p className="font-sans text-lg font-bold">{lyd(fl.priceLyd * pax)}</p>
                    {fl.currency === 'USD' && <p className="font-sans text-xs text-text-2">${(fl.priceOriginal * pax).toFixed(2)}</p>}
                  </div>
                  <AddButton t={t} on={on} onClick={() => add({ key, type: 'flight', refId: fl.id, title: { en: `${fl.no} ${fl.from} → ${fl.to}`, ar: `${fl.no} ${fl.from} → ${fl.to}` }, subtitle: { en: `${pax} × ${pick(fl.airline)}`, ar: `${pax} × ${fl.airline.ar}` }, qty: pax, lineLyd: fl.priceLyd * pax, startsAt: dep.getTime(), policy: fl.policy })} />
                </div>
              </li>
            )
          })}
        {kind === 'hotels' &&
          hotels.map((h) => (
            <li key={h.id} className={`${panel} flex flex-col gap-3 p-4`}>
              <div className="flex items-start gap-3">
                <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-[var(--app-primary)]/10 text-[var(--app-primary)]">
                  <BedDouble className="size-6" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="font-semibold">{pick(h.name)}</p>
                  <p className="flex items-center gap-1 text-xs text-text-2">
                    <span className="flex" aria-label={`${h.stars}★`}>
                      {Array.from({ length: h.stars }, (_, i) => (
                        <Star key={i} className="size-3 fill-[var(--app-primary)] text-[var(--app-primary)]" aria-hidden="true" />
                      ))}
                    </span>
                    · {pick(h.area)}، {pick(h.city)} · {t('travel.inDays', { n: h.daysAhead })}
                  </p>
                </div>
              </div>
              {h.rooms.map((r) => {
                const key = `hotel-${h.id}-${r.id}-${nights}`
                const on = inCart(key)
                return (
                  <div key={r.id} className="flex items-center gap-3 rounded-xl bg-surface-2 p-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{pick(r.name)}</p>
                      <p className="text-xs text-text-2">
                        {t(`travel.board.${r.board}`)} · {t('travel.perNight')} <span className="font-sans">{lyd(r.nightLyd)}</span>
                      </p>
                    </div>
                    <div className="text-end">
                      <p className="font-sans text-sm font-bold">{lyd(r.nightLyd * nights)}</p>
                    </div>
                    <AddButton
                      t={t}
                      on={on}
                      small
                      onClick={() =>
                        add({ key, type: 'hotel', refId: h.id, title: h.name, subtitle: { en: `${r.name.en} · ${nights} nights`, ar: `${r.name.ar} · ${nights} ليالٍ` }, qty: 1, nights, lineLyd: r.nightLyd * nights, startsAt: now + h.daysAhead * DAY, policy: 'hotel' })
                      }
                    />
                  </div>
                )
              })}
            </li>
          ))}
        {kind === 'visas' &&
          visas.map((v) => {
            const extra = v.nationality[nat]
            const blocked = extra === null
            const per = v.govLyd + v.serviceLyd + (extra ?? 0)
            const key = `visa-${v.id}-${nat}`
            const on = inCart(key)
            return (
              <li key={v.id} className={`${panel} flex flex-col gap-3 p-4 ${blocked ? 'opacity-70' : ''}`}>
                <div className="flex items-start gap-3">
                  <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-[var(--app-primary)]/10 text-[var(--app-primary)]">
                    <FileCheck2 className="size-6" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold">{pick(v.name)}</p>
                    <p className="text-xs text-text-2">
                      {t('travel.processing', { min: v.processing[0], max: v.processing[1] })} · {t('travel.validity', { n: v.validity })} · {t('travel.stay', { n: v.stay })}
                    </p>
                  </div>
                </div>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                  <dt className="text-text-2">{t('travel.govFee')}</dt>
                  <dd className="text-end font-sans">{lyd(v.govLyd)}</dd>
                  <dt className="text-text-2">{t('travel.serviceFee')}</dt>
                  <dd className="text-end font-sans">{lyd(v.serviceLyd)}</dd>
                  {!!extra && (
                    <>
                      <dt className="text-[var(--app-primary)]">{t('travel.extraFee')}</dt>
                      <dd className="text-end font-sans text-[var(--app-primary)]">{lyd(extra)}</dd>
                    </>
                  )}
                </dl>
                <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-3">
                  {blocked ? (
                    <p className="text-sm font-medium text-text-2">{t('travel.notAvailable')}</p>
                  ) : (
                    <div>
                      <p className="font-sans text-lg font-bold">{lyd(per)}</p>
                      <p className="text-xs text-text-2">{t('travel.perTraveler')}</p>
                    </div>
                  )}
                  {!blocked && <AddButton t={t} on={on} onClick={() => add({ key, type: 'visa', refId: v.id, title: v.name, subtitle: { en: t('travel.nat.' + nat), ar: t('travel.nat.' + nat) }, qty: 1, lineLyd: per, startsAt: now + v.processing[1] * DAY, policy: 'visa' })} />}
                </div>
              </li>
            )
          })}
      </ul>
    </>
  )
}

function AddButton({ t, on, onClick, small }: { t: T; on: boolean; onClick: () => void; small?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={`inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl text-sm font-semibold ${press} ${small ? 'h-11 px-3' : 'h-11 px-4'} ${
        on ? 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-300' : 'bg-[var(--app-primary)] text-[var(--on-app-primary)]'
      }`}
    >
      {on ? <Check className="size-4" aria-hidden="true" /> : <Plus className="size-4" aria-hidden="true" />}
      <span className={small ? 'sr-only @md:not-sr-only' : ''}>{on ? t('travel.added') : t('travel.add')}</span>
    </button>
  )
}

/* ================================================================== customer: cart / review */

const itemIcon = { flight: Plane, hotel: BedDouble, visa: FileCheck2 }

function ItemRow({ item, lyd, onRemove, removeLabel }: { item: CartItem; lyd: (n: number) => string; onRemove?: () => void; removeLabel?: string }) {
  const pick = useLocalized()
  const Icon = itemIcon[item.type]
  return (
    <li className="flex items-center gap-3 py-3">
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-surface-2 text-text-2">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold" dir="auto">{pick(item.title)}</p>
        <p className="truncate text-xs text-text-2">{pick(item.subtitle)}</p>
      </div>
      <span className="font-sans text-sm font-semibold whitespace-nowrap">{lyd(item.lineLyd)}</span>
      {onRemove && (
        <button type="button" onClick={onRemove} aria-label={removeLabel} className={`grid size-11 place-items-center rounded-full text-text-2 hover:bg-surface-2 ${press}`}>
          <Trash2 className="size-4.5" aria-hidden="true" />
        </button>
      )}
    </li>
  )
}

function Totals({ t, lyd, items }: { t: T; lyd: (n: number) => string; items: CartItem[] }) {
  const s = fees(items)
  return (
    <dl className="flex flex-col gap-2 text-sm">
      <Line label={t('cart.subtotal')} value={lyd(s.subtotal)} />
      {s.flightCharge > 0 && <Line label={`${t('cart.flightCharge')} · 1.5%`} value={lyd(s.flightCharge)} />}
      {s.cityTax > 0 && <Line label={t('cart.cityTax')} value={lyd(s.cityTax)} />}
      <Line label={t('cart.bookingFee')} value={lyd(s.bookingFee)} />
      <div className="my-1 border-t border-border" />
      <Line label={t('cart.total')} value={lyd(s.total)} strong />
    </dl>
  )
}

function Line({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex justify-between gap-3 ${strong ? 'text-base font-bold' : ''}`}>
      <dt className={strong ? '' : 'text-text-2'}>{label}</dt>
      <dd className="font-sans whitespace-nowrap tabular-nums">{value}</dd>
    </div>
  )
}

function Cart({ t, lyd, cart, setCart, onCheckout, browse }: { t: T; lyd: (n: number) => string; cart: CartItem[]; setCart: React.Dispatch<React.SetStateAction<CartItem[]>>; onCheckout: () => void; browse: () => void }) {
  if (!cart.length)
    return (
      <>
        <PageHead title={t('cart.title')} />
        <Empty icon={ShoppingCart} title={t('cart.empty')} hint={t('cart.emptyHint')} action={t('cart.browse')} onAction={browse} />
      </>
    )
  return (
    <>
      <PageHead title={t('cart.title')} />
      <div className="grid gap-4 @3xl:grid-cols-[1fr_20rem] @3xl:items-start">
        <ul className={`${panel} divide-y divide-border px-4`}>
          {cart.map((c) => (
            <ItemRow key={c.key} item={c} lyd={lyd} removeLabel={t('cart.remove')} onRemove={() => setCart((list) => list.filter((x) => x.key !== c.key))} />
          ))}
        </ul>
        <div className={`${panel} flex flex-col gap-4 p-4 @3xl:sticky @3xl:top-0`}>
          <Totals t={t} lyd={lyd} items={cart} />
          <button type="button" onClick={onCheckout} className={`${btnPrimary} w-full`}>
            {t('cart.checkout')}
          </button>
        </div>
      </div>
    </>
  )
}

function Review({ t, lyd, cart, back, onReserve }: { t: T; lyd: (n: number) => string; cart: CartItem[]; back: () => void; onReserve: () => void }) {
  return (
    <>
      <PageHead title={t('cart.reviewTitle')} back={back} backLabel={t('back')} />
      <div className="grid gap-4 @3xl:grid-cols-[1fr_20rem] @3xl:items-start">
        <ul className={`${panel} divide-y divide-border px-4`}>
          {cart.map((c) => (
            <ItemRow key={c.key} item={c} lyd={lyd} />
          ))}
        </ul>
        <div className={`${panel} flex flex-col gap-4 p-4`}>
          <p className="flex gap-2.5 rounded-xl bg-[var(--app-primary)]/10 p-3 text-sm text-[var(--app-primary)]">
            <Hourglass className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {t('cart.holdInfo', { n: HOLD_MINUTES })}
          </p>
          <Totals t={t} lyd={lyd} items={cart} />
          <button type="button" onClick={onReserve} className={`${btnPrimary} w-full`}>
            {t('cart.reserve')}
          </button>
        </div>
      </div>
    </>
  )
}

/* ================================================================== payment */

function HoldTimer({ t, hold, now, onSkip }: { t: T; hold: Booking; now: number; onSkip?: () => void }) {
  const left = Math.max(0, Math.round((hold.holdExpiresAt - now) / 1000))
  const mm = `${String(Math.floor(left / 60)).padStart(2, '0')}:${String(left % 60).padStart(2, '0')}`
  const warn = left <= WARNING_SECONDS
  return (
    <div className={`rounded-2xl p-4 transition-colors ${warn ? 'bg-[#1e3a8a] text-white' : 'bg-[var(--app-primary)]/10'}`} role="timer" aria-live="off">
      <div className="flex items-center gap-3">
        <span className={`grid size-11 shrink-0 place-items-center rounded-full ${warn ? 'bg-white/15' : 'bg-[var(--app-primary)] text-[var(--on-app-primary)]'}`}>
          <Clock className={`size-5 ${warn ? 'motion-safe:animate-pulse' : ''}`} aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className={`text-xs ${warn ? 'text-white/80' : 'text-text-2'}`}>{t('pay.timeLeft')}</p>
          <p className="font-sans text-2xl font-bold tabular-nums">{mm}</p>
        </div>
        {onSkip && (
          <button type="button" onClick={onSkip} className={`h-10 rounded-lg px-3 text-xs font-semibold ${warn ? 'bg-white/15' : 'bg-surface'} ${press}`}>
            {t('pay.skip')}
          </button>
        )}
      </div>
      <p className={`mt-2 text-xs ${warn ? 'text-white/85' : 'text-text-2'}`}>{t('pay.heldHint')}</p>
      <span className="sr-only" aria-live="polite">
        {warn ? t('pay.expiresIn', { mm }) : ''}
      </span>
    </div>
  )
}

function PayView(props: {
  t: T
  lyd: (n: number) => string
  title: string | { en: string; ar: string }
  amount: number
  items?: CartItem[]
  hold?: Booking
  now: number
  allowBank?: boolean
  back: () => void
  onSkip?: () => void
  onExpiredSearch?: () => void
  onPaid: (method: 'card' | 'bank_transfer', ref: string) => void
}) {
  const { t, lyd, amount, items, hold, now, allowBank, back, onSkip, onExpiredSearch, onPaid } = props
  const pick = useLocalized()
  const reduce = useReducedMotion()
  const title = typeof props.title === 'string' ? props.title : pick(props.title)
  const [method, setMethod] = useState<'card' | 'bank_transfer'>('card')
  const [card, setCard] = useState({ number: '4242 4242 4242 4242', expiry: '12/28', cvv: '123', name: 'DEMO USER' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [state, setState] = useState<'idle' | 'processing' | 'failed'>('idle')
  const expired = hold?.status === 'expired'

  if (expired)
    return (
      <>
        <PageHead title={t('pay.expired')} back={back} backLabel={t('back')} />
        <Empty icon={Hourglass} title={t('pay.expired')} hint={t('pay.expiredHint')} action={t('pay.searchAgain')} onAction={onExpiredSearch} />
      </>
    )

  const submit = () => {
    if (method === 'bank_transfer') return onPaid('bank_transfer', `BT_${Date.now()}`)
    const digits = card.number.replace(/\s/g, '')
    const e: Record<string, string> = {}
    if (!/^\d{13,19}$/.test(digits)) e.number = t('pay.errors.number')
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(card.expiry)) e.expiry = t('pay.errors.expiry')
    if (!/^\d{3,4}$/.test(card.cvv)) e.cvv = t('pay.errors.cvv')
    if (!card.name.trim()) e.name = t('pay.errors.name')
    setErrors(e)
    if (Object.keys(e).length) return
    setState('processing')
    window.setTimeout(() => {
      if (digits === '4000000000000002') return setState('failed')
      setState('idle')
      onPaid('card', `CARD_${Date.now()}_${Math.floor(Math.random() * 9000 + 1000)}`)
    }, 900)
  }

  const input = 'h-12 w-full rounded-xl border bg-surface px-3 font-sans text-[16px] outline-none focus:border-[var(--app-primary)]'
  const field = (k: keyof typeof card, label: string, extra: React.InputHTMLAttributes<HTMLInputElement>) => (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium">{label}</span>
      <input
        value={card[k]}
        onChange={(e) => {
          setCard((c) => ({ ...c, [k]: e.target.value }))
          setErrors((er) => ({ ...er, [k]: '' }))
          setState('idle')
        }}
        aria-invalid={!!errors[k]}
        dir="ltr"
        className={`${input} ${errors[k] ? 'border-[var(--app-primary)]' : 'border-border'}`}
        {...extra}
      />
      {errors[k] && (
        <span className="text-xs font-medium text-[var(--app-primary)]" role="alert">
          {errors[k]}
        </span>
      )}
    </label>
  )

  return (
    <>
      <PageHead title={t('pay.title')} subtitle={t('pay.for', { what: title })} back={back} backLabel={t('back')} />
      <div className="grid gap-4 @3xl:grid-cols-[1fr_20rem] @3xl:items-start">
        <div className="flex flex-col gap-4">
          {hold && (
            <div className="@3xl:hidden">
              <HoldTimer t={t} hold={hold} now={now} onSkip={onSkip} />
            </div>
          )}
          <div className={`${panel} flex flex-col gap-4 p-4`}>
            <div role="radiogroup" aria-label={t('pay.method')} className="grid grid-cols-2 gap-2">
              {(['card', ...(allowBank ? ['bank_transfer'] : [])] as ('card' | 'bank_transfer')[]).map((m) => {
                const on = method === m
                return (
                  <button key={m} type="button" role="radio" aria-checked={on} onClick={() => setMethod(m)} className={`flex h-12 items-center justify-center gap-2 rounded-xl border text-sm font-semibold ${press} ${on ? 'border-[var(--app-primary)] bg-[var(--app-primary)]/10 text-[var(--app-primary)]' : 'border-border'}`}>
                    {m === 'card' ? <CreditCard className="size-4.5" aria-hidden="true" /> : <Landmark className="size-4.5" aria-hidden="true" />}
                    {m === 'card' ? t('pay.card') : t('pay.bank')}
                  </button>
                )
              })}
            </div>
            <p className="rounded-lg bg-surface-2 px-3 py-2 text-xs text-text-2">{t('pay.test')}</p>
            {method === 'card' ? (
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">{field('number', t('pay.cardNumber'), { inputMode: 'numeric', autoComplete: 'off' })}</div>
                {field('expiry', t('pay.expiry'), { inputMode: 'numeric', placeholder: 'MM/YY', autoComplete: 'off' })}
                {field('cvv', t('pay.cvv'), { inputMode: 'numeric', autoComplete: 'off' })}
                <div className="col-span-2">{field('name', t('pay.name'), { autoComplete: 'off' })}</div>
                <p className="col-span-2 text-xs text-text-2">{t('pay.failHint')}</p>
              </div>
            ) : (
              <p className="text-sm text-text-2">{t('pay.bankHint')}</p>
            )}
            <AnimatePresence>
              {state === 'failed' && (
                <motion.div initial={reduce ? false : { opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex gap-3 rounded-xl border border-[var(--app-primary)]/40 bg-[var(--app-primary)]/8 p-3" role="alert">
                  <X className="mt-0.5 size-4.5 shrink-0 text-[var(--app-primary)]" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-semibold">{t('pay.failed')}</p>
                    <p className="text-xs text-text-2">{t('pay.failedReason')}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <button type="button" onClick={submit} disabled={state === 'processing'} className={`${btnPrimary} w-full`}>
              {state === 'processing' ? (
                <>
                  <span className="size-4 animate-spin rounded-full border-2 border-current/30 border-t-current motion-reduce:animate-none" aria-hidden="true" />
                  {t('pay.processing')}
                </>
              ) : state === 'failed' ? (
                t('pay.tryAgain')
              ) : (
                <>
                  {t('pay.payNow')} · <span className="font-sans">{lyd(amount)}</span>
                </>
              )}
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          {hold && (
            <div className="hidden @3xl:block">
              <HoldTimer t={t} hold={hold} now={now} onSkip={onSkip} />
            </div>
          )}
          {items && (
            <div className={`${panel} p-4`}>
              <ul className="divide-y divide-border">
                {items.map((c) => (
                  <ItemRow key={c.key} item={c} lyd={lyd} />
                ))}
              </ul>
              <div className="mt-3 border-t border-border pt-3">
                <Totals t={t} lyd={lyd} items={items} />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

/* ================================================================== bookings */

function effective(b: Booking): BookingStatus | 'paymentPending' {
  return b.status === 'pending_payment' && b.payment?.status === 'pending' ? 'paymentPending' : b.status
}

function Bookings({ t, lyd, bookings, now, open, browse }: { t: T; lyd: (n: number) => string; bookings: Booking[]; now: number; open: (ref: string) => void; browse: () => void }) {
  const f = useFormat()
  const [tab, setTab] = useState<'all' | 'pending_payment' | 'confirmed' | 'cancelled'>('all')
  const list = bookings.filter((b) => tab === 'all' || (tab === 'cancelled' ? ['cancelled', 'refunded', 'expired'].includes(b.status) : b.status === tab))
  return (
    <>
      <PageHead title={t('bookings.title')} />
      {bookings.length === 0 ? (
        <Empty icon={Ticket} title={t('bookings.empty')} hint={t('bookings.emptyHint')} action={t('cart.browse')} onAction={browse} />
      ) : (
        <>
          <div className="no-scrollbar -mx-4 mb-4 flex gap-2 overflow-x-auto px-4" role="tablist">
            {(['all', 'pending_payment', 'confirmed', 'cancelled'] as const).map((k) => (
              <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`h-10 shrink-0 rounded-full border px-4 text-sm font-medium ${press} ${tab === k ? 'border-transparent bg-[var(--app-primary)] text-[var(--on-app-primary)]' : 'border-border bg-surface text-text-2'}`}>
                {k === 'all' ? t('bookings.all') : t(`status.${k}`)}
              </button>
            ))}
          </div>
          <ul className="flex flex-col gap-3">
            {list.map((b) => {
              const s = effective(b)
              const secs = Math.max(0, Math.round((b.holdExpiresAt - now) / 1000))
              return (
                <li key={b.ref}>
                  <button type="button" onClick={() => open(b.ref)} className={`${panel} flex w-full flex-col gap-2 p-4 text-start @2xl:flex-row @2xl:items-center @2xl:gap-6 ${press}`}>
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-surface-2 text-text-2">
                        <Ticket className="size-5" aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <p className="font-sans font-semibold">{b.ref}</p>
                        <p className="text-xs text-text-2">
                          {t('bookings.items', { n: b.items.length })} · {f.date(new Date(b.createdAt))}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-3 @2xl:justify-end">
                      {s === 'pending_payment' && <span className="font-sans text-xs font-semibold text-[var(--app-primary)] tabular-nums">{`${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`}</span>}
                      <StatusPill t={t} s={s} />
                      <span className="font-sans font-semibold whitespace-nowrap">{lyd(b.total)}</span>
                      <ChevronRight className="hidden size-5 text-text-2 @2xl:block rtl:-scale-x-100" aria-hidden="true" />
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        </>
      )}
    </>
  )
}

function BookingDetail({ t, lyd, b, now, back, onPay, onCancel }: { t: T; lyd: (n: number) => string; b: Booking; now: number; back: () => void; onPay: () => void; onCancel: (refund: number) => void }) {
  const pick = useLocalized()
  const [confirm, setConfirm] = useState(false)
  const s = effective(b)
  const preview = useMemo(
    () =>
      b.items.map((it) => {
        const hoursLeft = (it.startsAt - now) / HOUR
        const pct = refundPct(policies[it.policy], hoursLeft)
        return { it, pct, amount: Math.round(it.lineLyd * pct * 10) / 1000 }
      }),
    [b.items, now],
  )
  const refund = preview.reduce((sum, p) => sum + p.amount, 0)

  return (
    <>
      <PageHead title={b.ref} back={back} backLabel={t('back')} />
      <div className="grid gap-4 @3xl:grid-cols-[1fr_20rem] @3xl:items-start">
        <div className={`${panel} px-4`}>
          <ul className="divide-y divide-border">
            {b.items.map((c) => (
              <ItemRow key={c.key} item={c} lyd={lyd} />
            ))}
          </ul>
        </div>
        <div className={`${panel} flex flex-col gap-4 p-4`}>
          <div className="flex items-center justify-between">
            <StatusPill t={t} s={s} />
            {b.payment && <span className="max-w-[60%] truncate font-sans text-xs text-text-2">{b.payment.ref}</span>}
          </div>
          <Totals t={t} lyd={lyd} items={b.items} />
          {b.refund !== undefined && <Line label={t('bookings.youGetBack')} value={lyd(b.refund)} strong />}
          {s === 'pending_payment' && (
            <button type="button" onClick={onPay} className={`${btnPrimary} w-full`}>
              {t('bookings.pay')}
            </button>
          )}
          {b.status === 'confirmed' && (
            <button type="button" onClick={() => setConfirm(true)} className={`${btnGhost} w-full`}>
              {t('bookings.cancel')}
            </button>
          )}
        </div>
      </div>
      <Sheet
        open={confirm}
        onClose={() => setConfirm(false)}
        title={t('bookings.cancelTitle')}
        closeLabel={t('close')}
        footer={
          <div className="flex gap-2">
            <button type="button" onClick={() => setConfirm(false)} className={`${btnGhost} flex-1`}>
              {t('bookings.keep')}
            </button>
            <button type="button" onClick={() => (onCancel(Math.round(refund * 1000) / 1000), setConfirm(false))} className={`${btnPrimary} flex-1`}>
              {t('bookings.confirmCancel')}
            </button>
          </div>
        }
      >
        <ul className="flex flex-col gap-2 pt-1">
          {preview.map(({ it, pct, amount }) => (
            <li key={it.key} className="flex items-center gap-3 rounded-xl bg-surface-2 p-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold" dir="auto">{pick(it.title)}</p>
                <p className={`text-xs ${pct ? 'text-[var(--app-primary)]' : 'text-text-2'}`}>{pct ? t('bookings.pctBack', { pct }) : t('bookings.nonRefundable')}</p>
              </div>
              <span className="font-sans text-sm font-semibold">{lyd(amount)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex items-center justify-between rounded-xl bg-[var(--app-primary)]/10 p-4">
          <span className="font-semibold">{t('bookings.youGetBack')}</span>
          <span className="font-sans text-lg font-bold text-[var(--app-primary)]">{lyd(refund)}</span>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-text-2">
          {t('bookings.policyNote')} {t('bookings.feesNote')}
        </p>
      </Sheet>
    </>
  )
}

/* ================================================================== trips (customer) */

function Trips({ t, lyd, trips, requests, pay, explore }: { t: T; lyd: (n: number) => string; trips: Trip[]; requests: TripRequest[]; pay: (id: string) => void; explore: () => void }) {
  const pick = useLocalized()
  const f = useFormat()
  return (
    <>
      <PageHead title={t('trips.title')} />
      {requests.length === 0 ? (
        <Empty icon={Briefcase} title={t('trips.empty')} hint={t('trips.emptyHint')} action={t('nav.explore')} onAction={explore} />
      ) : (
        <ul className="grid gap-3 @3xl:grid-cols-2">
          {requests.map((r) => {
            const trip = trips.find((x) => x.id === r.tripId)!
            const Icon = tripIcon[trip.icon]
            return (
              <li key={r.id} className={`${panel} flex flex-col gap-3 p-4`}>
                <div className="flex items-start gap-3">
                  <span className={`grid size-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-white ${trip.tone}`}>
                    <Icon className="size-6" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="leading-snug font-semibold">{pick(trip.title)}</p>
                    <p className="text-xs text-text-2">
                      {t('trips.travelers', { n: r.travelers })} · <span className="font-sans">{lyd(r.total)}</span>
                    </p>
                  </div>
                  <StatusPill t={t} s={r.status} />
                </div>
                {r.status === 'pending' && <p className="rounded-xl bg-surface-2 p-3 text-xs leading-relaxed text-text-2">{t('trips.awaitingApproval')}</p>}
                {r.status === 'rejected' && <p className="text-xs text-text-2">{t('trips.rejected')}</p>}
                {r.status === 'pending_payment' && (
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs text-text-2">
                      {t('trips.paymentDue')}: <span className="font-medium text-text">{f.date(new Date(r.paymentDueAt!), { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                    </p>
                    <button type="button" onClick={() => pay(r.id)} className={btnPrimary}>
                      {t('bookings.pay')}
                    </button>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </>
  )
}

/* ================================================================== staff */

function StaffRequests({ t, lyd, trips, requests, onApprove, onDecline }: { t: T; lyd: (n: number) => string; trips: Trip[]; requests: TripRequest[]; onApprove: (id: string, hours: number) => void; onDecline: (id: string) => void }) {
  const pick = useLocalized()
  const f = useFormat()
  const [tab, setTab] = useState<'pending' | 'approved' | 'rejected'>('pending')
  const [dialog, setDialog] = useState<{ kind: 'approve' | 'decline'; id: string } | null>(null)
  const [hours, setHours] = useState(String(PAYMENT_WINDOW_HOURS))
  const list = requests.filter((r) => (tab === 'pending' ? r.status === 'pending' : tab === 'rejected' ? r.status === 'rejected' : ['pending_payment', 'confirmed'].includes(r.status)))
  const h = Math.min(720, Math.max(1, parseInt(hours, 10) || 0))

  return (
    <>
      <PageHead title={t('staff.requestsTitle')} />
      <div className="mb-4 flex gap-2" role="tablist">
        {(['pending', 'approved', 'rejected'] as const).map((k) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`h-10 rounded-full border px-4 text-sm font-medium ${press} ${tab === k ? 'border-transparent bg-[var(--app-primary)] text-[var(--on-app-primary)]' : 'border-border bg-surface text-text-2'}`}>
            {t(`staff.${k}Tab`)}
          </button>
        ))}
      </div>
      {list.length === 0 ? (
        <Empty icon={Inbox} title={t('staff.empty')} hint={tab === 'pending' ? t('trips.emptyHint') : ''} />
      ) : (
        <ul className="flex flex-col gap-3">
          {list.map((r) => {
            const trip = trips.find((x) => x.id === r.tripId)!
            return (
              <li key={r.id} className={`${panel} flex flex-col gap-3 p-4 @3xl:flex-row @3xl:items-center`}>
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[var(--app-primary)]/12 text-sm font-bold text-[var(--app-primary)]">DC</span>
                  <div className="min-w-0">
                    <p className="font-semibold">{t('staff.customer')}</p>
                    <p className="text-sm text-text-2">{pick(trip.title)}</p>
                    <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-2">
                      <span className="flex items-center gap-1">
                        <Users className="size-3.5" aria-hidden="true" />
                        {t('trips.travelers', { n: r.travelers })}
                      </span>
                      <span className="font-sans">{lyd(r.total)}</span>
                      <span>{f.time(new Date(r.createdAt))}</span>
                    </p>
                    {r.notes && <p className="mt-2 rounded-lg bg-surface-2 px-3 py-2 text-xs">{r.notes}</p>}
                    {r.status === 'pending_payment' && <p className="mt-2 text-xs text-[var(--app-primary)]">{t('staff.awaitingPayment')} {t('staff.switchHint')}</p>}
                  </div>
                </div>
                {r.status === 'pending' ? (
                  <div className="flex gap-2 @3xl:shrink-0">
                    <button type="button" onClick={() => setDialog({ kind: 'decline', id: r.id })} className={`${btnGhost} flex-1`}>
                      {t('staff.decline')}
                    </button>
                    <button type="button" onClick={() => (setHours(String(PAYMENT_WINDOW_HOURS)), setDialog({ kind: 'approve', id: r.id }))} className={`${btnPrimary} flex-1`}>
                      {t('staff.approve')}
                    </button>
                  </div>
                ) : (
                  <StatusPill t={t} s={r.status} />
                )}
              </li>
            )
          })}
        </ul>
      )}
      <Sheet
        open={!!dialog}
        onClose={() => setDialog(null)}
        title={dialog?.kind === 'approve' ? t('staff.approve') : t('staff.decline')}
        closeLabel={t('close')}
        footer={
          <div className="flex gap-2">
            <button type="button" onClick={() => setDialog(null)} className={`${btnGhost} flex-1`}>
              {t('close')}
            </button>
            <button
              type="button"
              onClick={() => {
                if (!dialog) return
                if (dialog.kind === 'approve') onApprove(dialog.id, h)
                else onDecline(dialog.id)
                setDialog(null)
              }}
              className={`${btnPrimary} flex-1`}
            >
              {dialog?.kind === 'approve' ? t('staff.approve') : t('staff.decline')}
            </button>
          </div>
        }
      >
        <p className="pt-1 text-sm text-text-2">{dialog?.kind === 'approve' ? t('staff.acceptQ') : t('staff.rejectQ')}</p>
        {dialog?.kind === 'approve' && (
          <label className="mt-4 flex flex-col gap-1.5">
            <span className="text-sm font-medium">{t('staff.window')}</span>
            <input value={hours} onChange={(e) => setHours(e.target.value.replace(/\D/g, ''))} inputMode="numeric" className="h-12 rounded-xl border border-border bg-surface px-3 font-sans text-[16px] outline-none focus:border-[var(--app-primary)]" />
          </label>
        )}
      </Sheet>
    </>
  )
}

function StaffDesk({ t, lyd, bookings, onConfirmTransfer }: { t: T; lyd: (n: number) => string; bookings: Booking[]; onConfirmTransfer: (ref: string) => void }) {
  const f = useFormat()
  return (
    <>
      <PageHead title={t('staff.deskTitle')} />
      {bookings.length === 0 ? (
        <Empty icon={CalendarDays} title={t('staff.empty')} hint={t('staff.noBookings')} />
      ) : (
        <>
          {/* Table on wide screens */}
          <div className={`${panel} hidden overflow-hidden @3xl:block`}>
            <table className="w-full text-sm">
              <thead className="bg-surface-2 text-xs text-text-2">
                <tr>
                  <th className="px-4 py-3 text-start font-medium">{t('staff.ref')}</th>
                  <th className="px-4 py-3 text-start font-medium">{t('staff.customer')}</th>
                  <th className="px-4 py-3 text-start font-medium">{t('staff.status')}</th>
                  <th className="px-4 py-3 text-end font-medium">{t('staff.total')}</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {bookings.map((b) => (
                  <tr key={b.ref}>
                    <td className="px-4 py-3 font-sans font-medium">{b.ref}</td>
                    <td className="px-4 py-3 text-text-2">{f.date(new Date(b.createdAt))}</td>
                    <td className="px-4 py-3">
                      <StatusPill t={t} s={effective(b)} />
                    </td>
                    <td className="px-4 py-3 text-end font-sans">{lyd(b.total)}</td>
                    <td className="px-4 py-3 text-end">
                      {effective(b) === 'paymentPending' && (
                        <button type="button" onClick={() => onConfirmTransfer(b.ref)} className={`${btnPrimary} h-9 px-3 text-xs`}>
                          {t('staff.confirmTransfer')}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Cards on narrow screens */}
          <ul className="flex flex-col gap-3 @3xl:hidden">
            {bookings.map((b) => (
              <li key={b.ref} className={`${panel} flex flex-col gap-3 p-4`}>
                <div className="flex items-center justify-between gap-3">
                  <span className="font-sans font-semibold">{b.ref}</span>
                  <StatusPill t={t} s={effective(b)} />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-2">{f.date(new Date(b.createdAt))}</span>
                  <span className="font-sans font-semibold">{lyd(b.total)}</span>
                </div>
                {effective(b) === 'paymentPending' && (
                  <button type="button" onClick={() => onConfirmTransfer(b.ref)} className={`${btnPrimary} w-full`}>
                    {t('staff.confirmTransfer')}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  )
}
