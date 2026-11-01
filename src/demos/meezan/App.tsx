import { motion, useReducedMotion } from 'framer-motion'
import {
  AlertCircle,
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  Banknote,
  Car,
  Check,
  CreditCard,
  Dumbbell,
  Flame,
  Fuel,
  Home,
  Landmark,
  LayoutGrid,
  Pill,
  Plus,
  Receipt,
  Scale,
  ShoppingBag,
  Target,
  UtensilsCrossed,
  Coffee,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import { useLanguage } from '../../i18n/context'
import { useTheme } from '../../theme/context'
import { useDemo } from '../kit/DemoContext'
import { dayKey, useFormat } from '../kit/format'
import { press, Segmented, TabBar, type TabItem } from '../kit/mobile'
import { Sheet } from '../kit/Sheet'
import { useDemoStrings } from '../kit/strings'
import ar from './ar.json'
import en from './en.json'
import { formatMinor, parseMoney } from './money'

type T = ReturnType<typeof useDemoStrings>
type Tab = 'home' | 'money' | 'fitness' | 'more'
type Direction = 'out' | 'in' | 'transfer'
type CatId = 'groceries' | 'cafes' | 'fuel' | 'shopping' | 'housing' | 'health' | 'car' | 'bills' | 'transfers' | 'income'
type Attendance = 'went' | 'rest'

interface Account {
  id: string
  nameKey: string
  kind: 'bank' | 'card' | 'cash'
  last4?: string
  balance: number
}
interface Tx {
  id: string
  accountId: string
  toAccountId?: string
  categoryId: CatId | null
  direction: Direction
  amount: number
  titleKey?: string
  title?: string
  dayKey: string
}
interface Todo {
  id: string
  titleKey: string
  due: number // days from today, negative = overdue
  done: boolean
}

const CATS: { id: CatId; icon: LucideIcon; kind: 'expense' | 'income' }[] = [
  { id: 'groceries', icon: UtensilsCrossed, kind: 'expense' },
  { id: 'cafes', icon: Coffee, kind: 'expense' },
  { id: 'fuel', icon: Fuel, kind: 'expense' },
  { id: 'shopping', icon: ShoppingBag, kind: 'expense' },
  { id: 'housing', icon: Home, kind: 'expense' },
  { id: 'health', icon: Pill, kind: 'expense' },
  { id: 'car', icon: Car, kind: 'expense' },
  { id: 'bills', icon: Receipt, kind: 'expense' },
  { id: 'transfers', icon: ArrowLeftRight, kind: 'expense' },
  { id: 'income', icon: ArrowDownLeft, kind: 'income' },
]
const ICONS = Object.fromEntries(CATS.map((c) => [c.id, c.icon])) as Record<CatId, LucideIcon>

/** The day the demo was opened. Captured once so renders stay pure. */
function useToday() {
  return useState(() => new Date())[0]
}

const BUDGETS: { categoryId: CatId; limit: number }[] = [
  { categoryId: 'groceries', limit: 90000 },
  { categoryId: 'cafes', limit: 25000 },
  { categoryId: 'fuel', limit: 15000 },
]
const WARN_AT = 80

const shift = (days: number) => {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d
}
/** Seed rows stay inside the current month so the monthly totals read sensibly on any date. */
const inMonth = (daysAgo: number) => {
  const d = shift(-daysAgo)
  return d.getMonth() === new Date().getMonth() ? dayKey(d) : dayKey(new Date(new Date().getFullYear(), new Date().getMonth(), 1))
}

function seed() {
  const accounts: Account[] = [
    { id: 'cash', nameKey: 'data.cash', kind: 'cash', balance: 32000 },
    { id: 'bank', nameKey: 'data.bank', kind: 'card', last4: '4417', balance: 285000 },
  ]
  const txs: Tx[] = [
    { id: 't1', accountId: 'cash', categoryId: 'cafes', direction: 'out', amount: 6000, titleKey: 'data.coffee', dayKey: inMonth(1) },
    { id: 't2', accountId: 'bank', categoryId: 'groceries', direction: 'out', amount: 42000, titleKey: 'data.supermarket', dayKey: inMonth(2) },
    { id: 't3', accountId: 'cash', categoryId: 'fuel', direction: 'out', amount: 5500, titleKey: 'data.fuel1', dayKey: inMonth(3) },
    { id: 't4', accountId: 'bank', categoryId: 'bills', direction: 'out', amount: 8500, titleKey: 'data.internet', dayKey: inMonth(4) },
    { id: 't5', accountId: 'cash', categoryId: 'cafes', direction: 'out', amount: 12000, titleKey: 'data.lunch', dayKey: inMonth(5) },
    { id: 't6', accountId: 'cash', categoryId: 'groceries', direction: 'out', amount: 21000, titleKey: 'data.market', dayKey: inMonth(6) },
    { id: 't7', accountId: 'cash', categoryId: 'fuel', direction: 'out', amount: 4000, titleKey: 'data.fuel2', dayKey: inMonth(8) },
    { id: 't8', accountId: 'bank', categoryId: 'income', direction: 'in', amount: 320000, titleKey: 'data.salary', dayKey: inMonth(9) },
  ]
  const attendance: Record<string, Attendance> = {}
  ;[1, 2, 3, 5, 6, 8, 10, 12].forEach((d) => (attendance[dayKey(shift(-d))] = 'went'))
  ;[4, 9].forEach((d) => (attendance[dayKey(shift(-d))] = 'rest'))
  const todos: Todo[] = [
    { id: 'a', titleKey: 'data.todo2', due: -1, done: false },
    { id: 'b', titleKey: 'data.todo1', due: 0, done: false },
    { id: 'c', titleKey: 'data.todo3', due: 3, done: false },
  ]
  return { accounts, txs, attendance, todos }
}

/** Consecutive "went" days ending today or yesterday. Rest neither adds nor breaks; a gap breaks it. */
function streakOf(att: Record<string, Attendance>) {
  let d = new Date()
  if (!att[dayKey(d)]) d = shift(-1)
  let n = 0
  for (let i = 0; i < 400; i++) {
    const s = att[dayKey(d)]
    if (s === 'went') n++
    else if (s !== 'rest') break
    d = new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1)
  }
  return n
}

export default function MeezanApp() {
  const t = useDemoStrings(en, ar)
  const { theme } = useTheme()
  const { complete } = useDemo()
  const [tab, setTab] = useState<Tab>('home')
  const [state, setState] = useState(seed)
  const [sheet, setSheet] = useState(false)
  const lyd = (minor: number) => formatMinor(minor, t('brand') === 'ميزان' ? 'د.ل' : 'LYD')

  const monthPrefix = dayKey().slice(0, 7)
  const monthTx = state.txs.filter((x) => x.dayKey.startsWith(monthPrefix))
  const budgets = BUDGETS.map((b) => {
    const spent = monthTx.filter((x) => x.direction === 'out' && x.categoryId === b.categoryId).reduce((s, x) => s + x.amount, 0)
    const percent = Math.round((spent / b.limit) * 100)
    const over = spent > b.limit
    return { ...b, spent, percent, over, warning: !over && percent >= WARN_AT, remaining: b.limit - spent }
  })

  const save = (tx: Omit<Tx, 'id' | 'dayKey'>) => {
    setState((s) => {
      // Balance effects applied together, like the Firestore transaction in the real app.
      const accounts = s.accounts.map((a) => {
        let bal = a.balance
        if (a.id === tx.accountId) bal += tx.direction === 'in' ? tx.amount : -tx.amount
        if (tx.direction === 'transfer' && a.id === tx.toAccountId) bal += tx.amount
        return { ...a, balance: bal }
      })
      return { ...s, accounts, txs: [{ ...tx, id: `x${Date.now()}`, dayKey: dayKey() }, ...s.txs] }
    })
    setSheet(false)
    if (tx.direction === 'out') {
      complete('expense')
      const b = BUDGETS.find((x) => x.categoryId === tx.categoryId)
      if (b) {
        const before = budgets.find((x) => x.categoryId === b.categoryId)!.spent
        if (((before + tx.amount) / b.limit) * 100 >= WARN_AT) complete('budget')
      }
    }
  }

  const tabs: TabItem<Tab>[] = [
    { id: 'home', label: t('nav.home'), icon: Home },
    { id: 'money', label: t('nav.money'), icon: Wallet },
    { id: 'fitness', label: t('nav.fitness'), icon: Dumbbell },
    { id: 'more', label: t('nav.more'), icon: LayoutGrid },
  ]

  const vars = (
    theme === 'dark'
      ? { '--app-primary': '#6FC2AB', '--app-fill': '#22685A', '--on-fill': '#EFFAF6', '--income': '#4FA97F' }
      : { '--app-primary': '#12463C', '--app-fill': '#12463C', '--on-fill': '#F6FAF8', '--income': '#2E7D5B' }
  ) as React.CSSProperties

  return (
    <div className="@container relative flex min-h-0 flex-1 overflow-hidden bg-bg text-text" style={vars}>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col @3xl:flex-row">
        {/* Side rail on wide screens, like the md+ SideNav in the real app */}
        <nav aria-label={t('nav.label')} className="hidden w-24 shrink-0 flex-col items-center gap-2 border-e border-border bg-surface py-5 @3xl:flex">
          <span className="mb-4 grid size-11 place-items-center rounded-xl bg-[var(--app-fill)] text-[var(--on-fill)]">
            <Scale className="size-5.5" aria-hidden="true" />
          </span>
          {tabs.map((it) => {
            const on = it.id === tab
            const Icon = it.icon
            return (
              <button
                key={it.id}
                type="button"
                onClick={() => setTab(it.id)}
                aria-current={on ? 'page' : undefined}
                className={`flex w-18 flex-col items-center gap-1 rounded-2xl py-2.5 text-xs font-medium transition-colors ${on ? 'bg-[var(--app-fill)]/12 text-[var(--app-primary)]' : 'text-text-2 hover:bg-surface-2'}`}
              >
                <Icon className="size-5.5" aria-hidden="true" />
                {it.label}
              </button>
            )
          })}
        </nav>

        <main className="relative min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="mx-auto w-full max-w-3xl px-4 pt-5 pb-28 @3xl:px-8 @3xl:pt-8 @3xl:pb-10 @5xl:max-w-5xl">
            {tab === 'home' && <HomeView t={t} lyd={lyd} state={state} monthTx={monthTx} budgets={budgets} onNew={() => setSheet(true)} toggleTodo={(id) => toggleTodo(id)} />}
            {tab === 'money' && <MoneyView t={t} lyd={lyd} state={state} budgets={budgets} onNew={() => setSheet(true)} />}
            {tab === 'fitness' && (
              <FitnessView
                t={t}
                attendance={state.attendance}
                onTap={(key) => {
                  setState((s) => {
                    const cur = s.attendance[key]
                    const next = cur === undefined ? 'went' : cur === 'went' ? 'rest' : undefined
                    const att = { ...s.attendance }
                    if (next) att[key] = next
                    else delete att[key]
                    if (next === 'went' && streakOf(att) > streakOf(s.attendance)) complete('gym')
                    return { ...s, attendance: att }
                  })
                }}
              />
            )}
            {tab === 'more' && <MoreView t={t} todos={state.todos} toggleTodo={(id) => toggleTodo(id)} />}
          </div>
        </main>

        {(tab === 'home' || tab === 'money') && (
          <button
            type="button"
            onClick={() => setSheet(true)}
            className={`absolute end-4 bottom-[calc(5rem+var(--safe-bottom,env(safe-area-inset-bottom)))] z-20 inline-flex h-14 items-center gap-2 rounded-2xl bg-[var(--app-fill)] px-5 font-semibold text-[var(--on-fill)] shadow-[0_14px_30px_-10px_rgba(18,70,60,0.6)] @3xl:hidden ${press}`}
          >
            <Plus className="size-5" aria-hidden="true" />
            {t('money.new')}
          </button>
        )}

        <div className="@3xl:hidden">
          <TabBar items={tabs} active={tab} onChange={setTab} label={t('nav.label')} />
        </div>
      </div>

      <TxSheet t={t} open={sheet} onClose={() => setSheet(false)} accounts={state.accounts} lyd={lyd} onSave={save} />
    </div>
  )

  function toggleTodo(id: string) {
    setState((s) => ({ ...s, todos: s.todos.map((x) => (x.id === id ? { ...x, done: !x.done } : x)) }))
    if (!state.todos.find((x) => x.id === id)?.done) complete('todo')
  }
}

/* ------------------------------------------------------------------ shared */

const card = 'rounded-[1.25rem] border border-border bg-surface'

function H({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 className="font-semibold">{children}</h2>
      {action}
    </div>
  )
}

function Bar({ value, tone }: { value: number; tone: 'ok' | 'warning' | 'over' }) {
  const reduce = useReducedMotion()
  const color = tone === 'over' ? 'bg-slate-800 dark:bg-slate-200' : tone === 'warning' ? 'bg-sky-600 dark:bg-sky-400' : 'bg-[var(--app-fill)]'
  return (
    <div className="h-2 overflow-hidden rounded-full bg-surface-2" aria-hidden="true">
      <motion.div className={`h-full rounded-full ${color}`} initial={false} animate={{ width: `${Math.min(100, value)}%` }} transition={{ duration: reduce ? 0 : 0.6, ease: [0.16, 1, 0.3, 1] }} />
    </div>
  )
}

type Budget = { categoryId: CatId; limit: number; spent: number; percent: number; over: boolean; warning: boolean; remaining: number }

function BudgetRow({ t, lyd, b }: { t: T; lyd: (n: number) => string; b: Budget }) {
  const Icon = ICONS[b.categoryId]
  const tone = b.over ? 'over' : b.warning ? 'warning' : 'ok'
  return (
    <li className="flex flex-col gap-2.5 py-3.5">
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-xl bg-surface-2 text-text-2">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{t(`cats.${b.categoryId}`)}</p>
          <p className="text-xs text-text-2">{t('budget.percent', { n: b.percent })}</p>
        </div>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
            tone === 'over' ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900' : tone === 'warning' ? 'bg-sky-500/15 text-sky-700 dark:text-sky-300' : 'bg-[var(--app-fill)]/12 text-[var(--app-primary)]'
          }`}
        >
          {tone !== 'ok' && <AlertCircle className="size-3.5" aria-hidden="true" />}
          {t(`budget.${tone}`)}
        </span>
      </div>
      <Bar value={b.percent} tone={tone} />
      <p className="flex justify-between text-xs text-text-2">
        <span>{b.over ? t('budget.overBy', { amount: lyd(-b.remaining) }) : t('budget.left', { amount: lyd(b.remaining) })}</span>
        <span className="font-sans">
          {lyd(b.spent)} / {lyd(b.limit)}
        </span>
      </p>
    </li>
  )
}

function TxRow({ t, lyd, tx, accounts }: { t: T; lyd: (n: number) => string; tx: Tx; accounts: Account[] }) {
  const Icon = tx.direction === 'transfer' || !tx.categoryId ? ArrowLeftRight : ICONS[tx.categoryId]
  const sign = tx.direction === 'in' ? '+' : tx.direction === 'out' ? '−' : ''
  const acc = accounts.find((a) => a.id === tx.accountId)
  const f = useFormat()
  const now = useToday()
  const today = dayKey(now)
  const yesterday = dayKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1))
  const when = tx.dayKey === today ? t('tx.today') : tx.dayKey === yesterday ? t('tx.yesterday') : f.date(new Date(`${tx.dayKey}T12:00:00`))
  return (
    <li className="flex items-center gap-3 py-3">
      <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${tx.direction === 'in' ? 'bg-[var(--income)]/12 text-[var(--income)]' : 'bg-surface-2 text-text-2'}`}>
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{tx.title || (tx.titleKey ? t(tx.titleKey) : t(`tx.${tx.direction}`))}</p>
        <p className="truncate text-xs text-text-2">
          {tx.categoryId ? t(`cats.${tx.categoryId}`) : t('tx.transfer')} · {acc ? t(acc.nameKey) : ''} · {when}
        </p>
      </div>
      <span className={`font-sans text-sm font-semibold whitespace-nowrap tabular-nums ${tx.direction === 'in' ? 'text-[var(--income)]' : ''}`} dir="ltr">
        {sign}
        {lyd(tx.amount)}
      </span>
    </li>
  )
}

/* ------------------------------------------------------------------ home */

interface S {
  accounts: Account[]
  txs: Tx[]
  attendance: Record<string, Attendance>
  todos: Todo[]
}

function HomeView({ t, lyd, state, monthTx, budgets, onNew, toggleTodo }: { t: T; lyd: (n: number) => string; state: S; monthTx: Tx[]; budgets: Budget[]; onNew: () => void; toggleTodo: (id: string) => void }) {
  const f = useFormat()
  const now = useToday()
  const h = now.getHours()
  const greet = h < 12 ? t('greet.morning') : h < 17 ? t('greet.day') : t('greet.evening')
  const total = state.accounts.reduce((s, a) => s + a.balance, 0)
  const income = monthTx.filter((x) => x.direction === 'in').reduce((s, x) => s + x.amount, 0)
  const expense = monthTx.filter((x) => x.direction === 'out').reduce((s, x) => s + x.amount, 0)
  const attention = budgets.filter((b) => b.over || b.warning)
  const today = state.todos.filter((x) => !x.done && x.due <= 0).sort((a, b) => a.due - b.due).slice(0, 4)

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-2xl font-bold">
            {t('greeting', { greet, name: t('name') })}
          </p>
          <p className="text-sm text-text-2">{f.date(now, { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
        <button type="button" onClick={onNew} className={`hidden h-11 items-center gap-2 rounded-xl bg-[var(--app-fill)] px-4 text-sm font-semibold text-[var(--on-fill)] @3xl:inline-flex ${press}`}>
          <Plus className="size-4.5" aria-hidden="true" />
          {t('money.new')}
        </button>
      </div>

      <div className="grid gap-3 @3xl:grid-cols-3">
        <div className="relative overflow-hidden rounded-[1.25rem] bg-[var(--app-fill)] p-5 text-[var(--on-fill)] @3xl:col-span-1">
          <Scale className="absolute -end-4 -bottom-4 size-28 opacity-10" aria-hidden="true" />
          <p className="text-sm opacity-80">{t('home.total')}</p>
          <p className="mt-2 font-sans text-[1.75rem] leading-none font-bold tabular-nums">{lyd(total)}</p>
        </div>
        <div className="grid grid-cols-2 gap-3 @3xl:col-span-2">
          <div className={`${card} p-4`}>
            <p className="flex items-center gap-1.5 text-xs text-text-2">
              <ArrowDownLeft className="size-4 text-[var(--income)]" aria-hidden="true" />
              {t('home.income')}
            </p>
            <p className="mt-2 font-sans text-lg font-bold text-[var(--income)] tabular-nums">{lyd(income)}</p>
          </div>
          <div className={`${card} p-4`}>
            <p className="flex items-center gap-1.5 text-xs text-text-2">
              <ArrowUpRight className="size-4" aria-hidden="true" />
              {t('home.expense')}
            </p>
            <p className="mt-2 font-sans text-lg font-bold tabular-nums">{lyd(expense)}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 @3xl:grid-cols-2 @3xl:items-start">
        <section className={`${card} px-4 pt-4`}>
          <H>{t('home.attention')}</H>
          {attention.length ? (
            <ul className="divide-y divide-border">
              {attention.map((b) => (
                <BudgetRow key={b.categoryId} t={t} lyd={lyd} b={b} />
              ))}
            </ul>
          ) : (
            <p className="pb-4 text-sm text-text-2">{t('home.allGood')}</p>
          )}
        </section>

        <section className={`${card} px-4 pt-4 pb-2`}>
          <H>{t('home.today')}</H>
          {today.length ? (
            <ul>
              {today.map((x) => (
                <TodoRow key={x.id} t={t} todo={x} onToggle={() => toggleTodo(x.id)} />
              ))}
            </ul>
          ) : (
            <p className="pb-3 text-sm text-text-2">{t('home.noTasks')}</p>
          )}
        </section>
      </div>

      <section className={`${card} px-4 pt-4`}>
        <H>{t('home.recent')}</H>
        <ul className="divide-y divide-border">
          {state.txs.slice(0, 5).map((x) => (
            <TxRow key={x.id} t={t} lyd={lyd} tx={x} accounts={state.accounts} />
          ))}
        </ul>
      </section>
    </div>
  )
}

/* ------------------------------------------------------------------ money */

function MoneyView({ t, lyd, state, budgets, onNew }: { t: T; lyd: (n: number) => string; state: S; budgets: Budget[]; onNew: () => void }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('money.title')}</h1>
        <button type="button" onClick={onNew} className={`hidden h-11 items-center gap-2 rounded-xl bg-[var(--app-fill)] px-4 text-sm font-semibold text-[var(--on-fill)] @3xl:inline-flex ${press}`}>
          <Plus className="size-4.5" aria-hidden="true" />
          {t('money.new')}
        </button>
      </div>
      <section>
        <H>{t('money.accounts')}</H>
        <div className="grid gap-3 @lg:grid-cols-2">
          {state.accounts.map((a) => {
            const Icon = a.kind === 'cash' ? Banknote : a.kind === 'card' ? CreditCard : Landmark
            return (
              <div key={a.id} className={`${card} flex items-center gap-3 p-4`}>
                <span className="grid size-11 place-items-center rounded-xl bg-[var(--app-fill)]/12 text-[var(--app-primary)]">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{t(a.nameKey)}</p>
                  <p className="text-xs text-text-2">
                    {t(`money.kind.${a.kind}`)}
                    {a.last4 && <span className="font-sans"> · •••• {a.last4}</span>}
                  </p>
                </div>
                <motion.p key={a.balance} initial={{ opacity: 0.4, y: -4 }} animate={{ opacity: 1, y: 0 }} className="font-sans font-bold tabular-nums">
                  {lyd(a.balance)}
                </motion.p>
              </div>
            )
          })}
        </div>
      </section>
      <div className="grid gap-5 @4xl:grid-cols-2 @4xl:items-start">
        <section className={`${card} px-4 pt-4`}>
          <H>
            {t('money.budgets')} · <span className="font-normal text-text-2">{t('money.period.monthly')}</span>
          </H>
          <ul className="divide-y divide-border">
            {budgets.map((b) => (
              <BudgetRow key={b.categoryId} t={t} lyd={lyd} b={b} />
            ))}
          </ul>
        </section>
        <section className={`${card} px-4 pt-4`}>
          <H>{t('money.transactions')}</H>
          <ul className="divide-y divide-border">
            {state.txs.map((x) => (
              <TxRow key={x.id} t={t} lyd={lyd} tx={x} accounts={state.accounts} />
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}

function TxSheet({ t, open, onClose, accounts, lyd, onSave }: { t: T; open: boolean; onClose: () => void; accounts: Account[]; lyd: (n: number) => string; onSave: (tx: Omit<Tx, 'id' | 'dayKey'>) => void }) {
  const [direction, setDirection] = useState<Direction>('out')
  const [amount, setAmount] = useState('')
  const [accountId, setAccountId] = useState('cash')
  const [toId, setToId] = useState('bank')
  const [cat, setCat] = useState<CatId | null>('cafes')
  const [title, setTitle] = useState('')
  const [errors, setErrors] = useState<{ amount?: boolean; same?: boolean }>({})
  const cats = CATS.filter((c) => (direction === 'in' ? c.kind === 'income' : c.kind === 'expense'))
  const parsed = parseMoney(amount)

  const submit = () => {
    const e = { amount: parsed === null, same: direction === 'transfer' && accountId === toId }
    setErrors(e)
    if (e.amount || e.same) return
    onSave({ accountId, toAccountId: direction === 'transfer' ? toId : undefined, categoryId: direction === 'transfer' ? null : cat, direction, amount: parsed!, title: title.trim() || undefined })
    setAmount('')
    setTitle('')
  }

  const chip = (on: boolean) => `inline-flex min-h-11 items-center gap-2 rounded-xl border px-3 text-sm font-medium ${press} ${on ? 'border-[var(--app-fill)] bg-[var(--app-fill)]/10 text-[var(--app-primary)]' : 'border-border'}`

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={t('tx.title')}
      closeLabel={t('close')}
      footer={
        <button type="button" onClick={submit} className={`h-13 w-full rounded-2xl bg-[var(--app-fill)] font-semibold text-[var(--on-fill)] ${press}`}>
          {t('tx.save')}
          {parsed !== null && <span className="font-sans"> · {lyd(parsed)}</span>}
        </button>
      }
    >
      <div className="flex flex-col gap-5 pt-1">
        <Segmented
          label={t('tx.type')}
          value={direction}
          onChange={(d) => {
            setDirection(d)
            setCat(d === 'in' ? 'income' : d === 'out' ? 'cafes' : null)
          }}
          options={[
            { id: 'out', label: t('tx.out') },
            { id: 'in', label: t('tx.in') },
            { id: 'transfer', label: t('tx.transfer') },
          ]}
        />
        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold">{t('tx.amount')}</span>
          <input
            data-autofocus
            inputMode="decimal"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value)
              setErrors({})
            }}
            placeholder="0.00"
            aria-invalid={errors.amount}
            className={`h-14 rounded-2xl border bg-surface px-4 text-center font-sans text-2xl font-bold outline-none focus:border-[var(--app-fill)] ${errors.amount ? 'border-[var(--app-fill)]' : 'border-border'}`}
          />
          <span className={`text-xs ${errors.amount ? 'font-medium text-[var(--app-primary)]' : 'text-text-2'}`} role={errors.amount ? 'alert' : undefined}>
            {errors.amount ? t('tx.amountError') : t('tx.amountHint')}
          </span>
        </label>
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-sm font-semibold">{t('tx.account')}</legend>
          <div className="flex flex-wrap gap-2">
            {accounts.map((a) => (
              <button key={a.id} type="button" aria-pressed={accountId === a.id} onClick={() => setAccountId(a.id)} className={chip(accountId === a.id)}>
                {t(a.nameKey)}
              </button>
            ))}
          </div>
        </fieldset>
        {direction === 'transfer' ? (
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 text-sm font-semibold">{t('tx.to')}</legend>
            <div className="flex flex-wrap gap-2">
              {accounts.map((a) => (
                <button key={a.id} type="button" aria-pressed={toId === a.id} onClick={() => (setToId(a.id), setErrors({}))} className={chip(toId === a.id)}>
                  {t(a.nameKey)}
                </button>
              ))}
            </div>
            {errors.same && (
              <p className="text-xs font-medium text-[var(--app-primary)]" role="alert">
                {t('tx.sameAccount')}
              </p>
            )}
          </fieldset>
        ) : (
          <fieldset>
            <legend className="mb-2 text-sm font-semibold">{t('tx.category')}</legend>
            <div className="flex flex-wrap gap-2">
              {cats.map((c) => {
                const Icon = c.icon
                return (
                  <button key={c.id} type="button" aria-pressed={cat === c.id} onClick={() => setCat(c.id)} className={chip(cat === c.id)}>
                    <Icon className="size-4" aria-hidden="true" />
                    {t(`cats.${c.id}`)}
                  </button>
                )
              })}
            </div>
          </fieldset>
        )}
        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold">{t('tx.desc')}</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('tx.descPlaceholder')} className="h-12 rounded-2xl border border-border bg-surface px-4 text-[16px] outline-none focus:border-[var(--app-fill)]" />
        </label>
      </div>
    </Sheet>
  )
}

/* ------------------------------------------------------------------ fitness */

function FitnessView({ t, attendance, onTap }: { t: T; attendance: Record<string, Attendance>; onTap: (key: string) => void }) {
  const f = useFormat()
  const { lang } = useLanguage()
  const now = useToday()
  const first = new Date(now.getFullYear(), now.getMonth(), 1)
  const days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const lead = (first.getDay() - 6 + 7) % 7 // week starts on Saturday
  const todayKey = dayKey(now)
  const streak = streakOf(attendance)
  const monthPrefix = todayKey.slice(0, 7)
  const monthCount = Object.entries(attendance).filter(([k, v]) => v === 'went' && k.startsWith(monthPrefix)).length
  const cells = useMemo(() => [...Array.from({ length: lead }, () => null), ...Array.from({ length: days }, (_, i) => new Date(now.getFullYear(), now.getMonth(), i + 1))], [lead, days]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-bold">{t('fitness.title')}</h1>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-[1.25rem] bg-[var(--app-fill)] p-4 text-[var(--on-fill)]">
          <p className="flex items-center gap-1.5 text-xs opacity-80">
            <Flame className="size-4" aria-hidden="true" />
            {t('fitness.streak')}
          </p>
          <motion.p key={streak} initial={{ scale: 1.25 }} animate={{ scale: 1 }} className="mt-2 font-sans text-3xl font-bold" aria-live="polite">
            {streak}
          </motion.p>
          <p className="text-xs opacity-80">{t('fitness.streakUnit')}</p>
        </div>
        <div className={`${card} p-4`}>
          <p className="flex items-center gap-1.5 text-xs text-text-2">
            <Dumbbell className="size-4" aria-hidden="true" />
            {t('fitness.month')}
          </p>
          <p className="mt-2 font-sans text-3xl font-bold">{monthCount}</p>
          <p className="text-xs text-text-2">{t('fitness.monthUnit')}</p>
        </div>
      </div>
      <section className={`${card} p-4`}>
        <H>
          {t('fitness.attendance')} · <span className="font-normal text-text-2">{f.date(now, { month: 'long', year: 'numeric' })}</span>
        </H>
        <p className="mb-4 text-sm text-text-2">{t('fitness.hint')}</p>
        <div className="grid grid-cols-7 gap-1.5 text-center @lg:gap-2.5" role="grid" aria-label={t('fitness.attendance')}>
          {Array.from({ length: 7 }, (_, i) => (
            <span key={i} className="pb-1 text-[11px] font-medium text-text-2" role="columnheader">
              {t(`fitness.days.${i}`)}
            </span>
          ))}
          {cells.map((d, i) => {
            if (!d) return <span key={`e${i}`} />
            const key = dayKey(d)
            const s = attendance[key]
            const future = key > todayKey
            const isToday = key === todayKey
            const label = `${f.date(d, { weekday: 'long', day: 'numeric', month: 'long' })}: ${future ? t('fitness.future') : s ? t(`fitness.${s}`) : t('fitness.none')}`
            return (
              <button
                key={key}
                type="button"
                disabled={future}
                onClick={() => onTap(key)}
                aria-label={label}
                className={`relative grid aspect-square min-h-10 place-items-center rounded-xl font-sans text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-35 ${press} ${
                  s === 'went' ? 'bg-[var(--app-fill)] text-[var(--on-fill)]' : s === 'rest' ? 'border border-dashed border-[var(--app-primary)]/50 text-[var(--app-primary)]' : 'bg-surface-2'
                } ${isToday ? 'ring-2 ring-[var(--app-primary)] ring-offset-2 ring-offset-surface' : ''}`}
              >
                {d.getDate()}
                {s === 'went' && <Check className="absolute end-1 top-1 size-3 opacity-80" strokeWidth={3} aria-hidden="true" />}
              </button>
            )
          })}
        </div>
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-text-2" aria-label={t('fitness.legend')}>
          <span className="flex items-center gap-1.5">
            <span className="size-3 rounded bg-[var(--app-fill)]" /> {t('fitness.went')}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-3 rounded border border-dashed border-[var(--app-primary)]" /> {t('fitness.rest')}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-3 rounded bg-surface-2" /> {t('fitness.none')}
          </span>
        </div>
      </section>
      <span className="sr-only">{lang}</span>
    </div>
  )
}

/* ------------------------------------------------------------------ more */

function TodoRow({ t, todo, onToggle }: { t: T; todo: Todo; onToggle: () => void }) {
  const due = todo.due < 0 ? t('more.overdue') : todo.due === 0 ? t('more.due.today') : todo.due === 1 ? t('more.due.tomorrow') : t('more.due.week')
  return (
    <li className="flex items-center gap-3 py-1.5">
      <button
        type="button"
        role="checkbox"
        aria-checked={todo.done}
        aria-label={todo.done ? t('more.reopen') : t('more.complete')}
        onClick={onToggle}
        className={`grid size-11 shrink-0 place-items-center rounded-full ${press}`}
      >
        <span className={`grid size-6 place-items-center rounded-full border-2 transition-colors ${todo.done ? 'border-[var(--app-fill)] bg-[var(--app-fill)] text-[var(--on-fill)]' : 'border-text-2/40'}`}>
          {todo.done && <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />}
        </span>
      </button>
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-medium transition-colors ${todo.done ? 'text-text-2 line-through' : ''}`}>{t(todo.titleKey)}</p>
        <p className={`text-xs ${todo.due < 0 && !todo.done ? 'font-semibold text-[var(--app-primary)]' : 'text-text-2'}`}>{due}</p>
      </div>
    </li>
  )
}

function MoreView({ t, todos, toggleTodo }: { t: T; todos: Todo[]; toggleTodo: (id: string) => void }) {
  const goals = [
    { key: 'data.goal1', progress: Math.round((3150 / 5000) * 100), icon: Target },
    // Metric goal: distance travelled from start (86 kg) towards target (78 kg), clamped 0–100.
    { key: 'data.goal2', progress: Math.round(Math.min(100, Math.max(0, ((86 - 82.4) / (86 - 78)) * 100))), icon: Scale },
  ]
  return (
    <div className="grid gap-5 @3xl:grid-cols-2 @3xl:items-start">
      <section className={`${card} px-4 pt-4 pb-2`}>
        <H>{t('more.todos')}</H>
        <ul>
          {[...todos].sort((a, b) => Number(a.done) - Number(b.done) || a.due - b.due).map((x) => (
            <TodoRow key={x.id} t={t} todo={x} onToggle={() => toggleTodo(x.id)} />
          ))}
        </ul>
      </section>
      <section className={`${card} p-4`}>
        <H>{t('more.goals')}</H>
        <ul className="flex flex-col gap-4">
          {goals.map((g) => {
            const Icon = g.icon
            return (
              <li key={g.key} className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-xl bg-[var(--app-fill)]/12 text-[var(--app-primary)]">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <p className="flex-1 text-sm font-semibold">{t(g.key)}</p>
                  <span className="text-xs text-text-2">{t('more.goalProgress', { p: g.progress })}</span>
                </div>
                <Bar value={g.progress} tone="ok" />
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}
