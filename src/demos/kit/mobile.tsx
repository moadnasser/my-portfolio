import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowLeft, Bell } from 'lucide-react'
import { useEffect, type ComponentType, type ReactNode } from 'react'
import { useLanguage } from '../../i18n/context'

/** Pressed feedback that never changes layout bounds. */
export const press = 'transition-[background-color,opacity,transform] duration-150 active:scale-[0.97] active:opacity-80 cursor-pointer select-none'

/** Root of a phone app: fills its frame or the phone screen, and scopes sheets and banners. */
export function AppRoot({ children, className = '', style }: { children: ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`relative flex min-h-0 flex-1 flex-col overflow-hidden bg-bg text-text @container ${className}`} style={style}>
      {children}
    </div>
  )
}

interface ScreenProps {
  title?: string
  onBack?: () => void
  backLabel?: string
  trailing?: ReactNode
  children: ReactNode
  /** Sticky footer, e.g. a primary CTA bar. Safe-area padded. */
  footer?: ReactNode
  bodyClassName?: string
}

/** A pushed screen with an app bar, its own scroller and an optional bottom action bar. */
export function Screen({ title, onBack, backLabel, trailing, children, footer, bodyClassName = '' }: ScreenProps) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      {(title || onBack) && (
        <div className="flex h-14 shrink-0 items-center gap-1 px-2">
          {onBack && (
            <button type="button" onClick={onBack} aria-label={backLabel} className={`inline-flex size-11 items-center justify-center rounded-full hover:bg-surface-2 ${press}`}>
              <ArrowLeft className="size-5 rtl:-scale-x-100" aria-hidden="true" />
            </button>
          )}
          <h2 className={`min-w-0 flex-1 truncate text-[17px] font-semibold ${onBack ? '' : 'ps-3'}`}>{title}</h2>
          {trailing}
        </div>
      )}
      <div className={`min-h-0 flex-1 overflow-y-auto overscroll-contain ${bodyClassName}`}>{children}</div>
      {footer && <div className="shrink-0 border-t border-border bg-surface/95 px-4 pt-3 pb-[max(0.75rem,var(--safe-bottom,env(safe-area-inset-bottom)))] backdrop-blur">{footer}</div>}
    </div>
  )
}

/**
 * Animated stack: the top entry slides in from the reading-direction end.
 * Pass a key per entry; the base (tab content) stays mounted underneath.
 */
export function PushStack({ base, top, topKey }: { base: ReactNode; top: ReactNode | null; topKey: string | null }) {
  const reduce = useReducedMotion()
  const { dir } = useLanguage()
  const from = dir === 'rtl' ? '-100%' : '100%'
  return (
    <div className="relative min-h-0 flex-1">
      <div className="absolute inset-0 flex flex-col" aria-hidden={top ? true : undefined} inert={top ? true : undefined}>
        {base}
      </div>
      <AnimatePresence initial={false}>
        {top && (
          <motion.div
            key={topKey}
            className="absolute inset-0 z-20 flex flex-col bg-bg shadow-[0_0_40px_rgba(0,0,0,0.18)]"
            initial={reduce ? { opacity: 0 } : { x: from }}
            animate={reduce ? { opacity: 1 } : { x: 0 }}
            exit={reduce ? { opacity: 0 } : { x: from }}
            transition={{ type: 'spring', stiffness: 420, damping: 42 }}
          >
            {top}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export interface TabItem<T extends string> {
  id: T
  label: string
  icon: ComponentType<{ className?: string; strokeWidth?: number }>
  badge?: number
}

/** Labelled bottom navigation (≤5 items), 44px+ targets, safe-area aware. */
export function TabBar<T extends string>({ items, active, onChange, label }: { items: TabItem<T>[]; active: T; onChange: (id: T) => void; label: string }) {
  return (
    <nav aria-label={label} className="shrink-0 border-t border-border bg-surface/95 pb-[var(--safe-bottom,env(safe-area-inset-bottom))] backdrop-blur">
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
                className={`relative flex h-16 w-full flex-col items-center justify-center gap-1 text-[11px] font-medium ${press} ${on ? 'text-[var(--app-primary)]' : 'text-text-2'}`}
              >
                <span className="relative">
                  <Icon className="size-6" strokeWidth={on ? 2.2 : 1.8} />
                  {!!it.badge && (
                    <span className="absolute -end-2 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-[var(--app-primary)] px-1 text-[10px] font-bold text-white font-sans">
                      {it.badge}
                    </span>
                  )}
                </span>
                {it.label}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

/** Simulated push notification that drops in from the top of the app, then hides itself. */
export function PushBanner({ note, onDone, appName, onOpen }: { note: { id: number; title: string; body: string } | null; onDone: () => void; appName: string; onOpen?: () => void }) {
  const reduce = useReducedMotion()
  useEffect(() => {
    if (!note) return
    const id = window.setTimeout(onDone, 4200)
    return () => window.clearTimeout(id)
  }, [note, onDone])
  return (
    <div className="pointer-events-none absolute inset-x-2 top-2 z-50" aria-live="polite">
      <AnimatePresence>
        {note && (
          <motion.button
            type="button"
            key={note.id}
            onClick={() => {
              onOpen?.()
              onDone()
            }}
            className="pointer-events-auto flex w-full items-start gap-3 rounded-[1.25rem] border border-white/10 bg-surface/90 p-3 text-start shadow-[0_18px_40px_-12px_rgba(0,0,0,0.35)] backdrop-blur-xl"
            initial={reduce ? { opacity: 0 } : { y: -90, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { y: -90, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 360, damping: 30 }}
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[var(--app-primary)] text-white">
              <Bell className="size-4.5" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center justify-between gap-2 text-[11px] text-text-2">
                <span className="latin font-semibold tracking-wide uppercase">{appName}</span>
              </span>
              <span className="block text-sm font-semibold">{note.title}</span>
              <span className="block text-[13px] leading-snug text-text-2">{note.body}</span>
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}

/** Segmented control for 2-4 options. */
export function Segmented<T extends string>({ options, value, onChange, label }: { options: { id: T; label: string }[]; value: T; onChange: (v: T) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex rounded-2xl bg-surface-2 p-1">
      {options.map((o) => {
        const on = o.id === value
        return (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o.id)}
            className={`relative h-11 flex-1 rounded-xl text-sm font-semibold transition-colors ${press} ${on ? 'text-text' : 'text-text-2'}`}
          >
            {on && <motion.span layoutId={`seg-${label}`} className="absolute inset-0 rounded-xl bg-surface shadow-sm" transition={{ type: 'spring', stiffness: 500, damping: 38 }} />}
            <span className="relative">{o.label}</span>
          </button>
        )
      })}
    </div>
  )
}
