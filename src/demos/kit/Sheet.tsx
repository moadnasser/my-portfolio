import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { X } from 'lucide-react'
import { useEffect, useId, useRef, type ReactNode } from 'react'

interface SheetProps {
  open: boolean
  onClose: () => void
  title: string
  closeLabel: string
  children: ReactNode
  footer?: ReactNode
}

/**
 * Modal surface scoped to the demo app (absolute, not fixed), so it stays inside the
 * phone or browser frame. Bottom sheet in narrow containers, centred dialog in wide ones.
 * Requires an ancestor with `relative @container overflow-hidden`.
 */
export function Sheet({ open, onClose, title, closeLabel, children, footer }: SheetProps) {
  const reduce = useReducedMotion()
  const titleId = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  const returnRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return
    returnRef.current = document.activeElement as HTMLElement | null
    const raf = requestAnimationFrame(() => panelRef.current?.querySelector<HTMLElement>('[data-autofocus], button, input, select, textarea')?.focus())
    return () => {
      cancelAnimationFrame(raf)
      returnRef.current?.focus?.()
    }
  }, [open])

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation()
      onClose()
    }
    if (e.key !== 'Tab' || !panelRef.current) return
    const items = panelRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), input, select, textarea, a[href], [tabindex="0"]')
    if (!items.length) return
    const first = items[0]
    const last = items[items.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="absolute inset-0 z-40 flex items-end justify-center @2xl:items-center @2xl:p-8" onKeyDown={onKeyDown}>
          <motion.div
            className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.2 }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative flex max-h-[88%] w-full flex-col overflow-hidden rounded-t-[1.75rem] bg-surface text-text shadow-2xl @2xl:max-w-lg @2xl:rounded-[1.5rem]"
            initial={reduce ? { opacity: 0 } : { y: '100%' }}
            animate={reduce ? { opacity: 1 } : { y: 0 }}
            exit={reduce ? { opacity: 0 } : { y: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 36 }}
          >
            <div className="mx-auto mt-2.5 h-1.5 w-10 shrink-0 rounded-full bg-text-2/30 @2xl:hidden" aria-hidden="true" />
            <div className="flex shrink-0 items-center justify-between gap-3 px-5 pt-3 pb-2 @2xl:pt-5">
              <h3 id={titleId} className="text-lg font-semibold">
                {title}
              </h3>
              <button
                type="button"
                onClick={onClose}
                aria-label={closeLabel}
                className="-me-2 inline-flex size-11 cursor-pointer items-center justify-center rounded-full text-text-2 transition-colors hover:bg-surface-2 active:bg-surface-2"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-5">{children}</div>
            {footer && <div className="shrink-0 border-t border-border px-5 pt-3 pb-[max(1rem,var(--safe-bottom,env(safe-area-inset-bottom)))]">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
