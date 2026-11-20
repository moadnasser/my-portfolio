import { AnimatePresence, motion, useAnimationControls, useReducedMotion } from 'framer-motion'
import { ArrowUp } from 'lucide-react'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useLanguage } from '../../i18n/context'
import { DUR, EASE } from '../../lib/motion'

export type SubmitStatus = 'idle' | 'sending' | 'sent' | 'failed'

/** The mark in the round bubble: arrow at rest, a breathing arc while sending, a drawn tick when sent, "!" on failure. */
function Mark({ status, still }: { status: SubmitStatus; still: boolean }) {
  const busy = status === 'sending' || status === 'sent'
  return (
    <span className="relative grid size-7 shrink-0 place-items-center rounded-full bg-black/15" aria-hidden="true">
      <AnimatePresence initial={false} mode="wait">
        {busy ? (
          <motion.svg key="progress" viewBox="0 0 20 20" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
            {/* One circle for both states: an arc that turns while sending, then closes into a ring. */}
            <motion.g
              style={{ transformOrigin: '10px 10px' }}
              animate={status === 'sending' && !still ? { rotate: 360 } : { rotate: 0 }}
              transition={status === 'sending' && !still ? { duration: 0.9, ease: 'linear', repeat: Infinity } : { duration: 0 }}
            >
              <motion.circle
                cx="10"
                cy="10"
                r="7"
                pathLength={1}
                initial={{ strokeDasharray: '0.25 1' }}
                animate={
                  status === 'sent'
                    ? { strokeDasharray: '1 1', opacity: 1 }
                    : still
                      ? { strokeDasharray: '0.7 1', opacity: [1, 0.4, 1] }
                      : { strokeDasharray: ['0.2 1', '0.7 1', '0.2 1'], opacity: 1 }
                }
                transition={status === 'sent' ? { duration: still ? 0 : 0.3, ease: 'easeOut' } : { duration: 1.6, ease: 'easeInOut', repeat: Infinity }}
              />
            </motion.g>
            {status === 'sent' && (
              <motion.path d="M6.6 10.3l2.3 2.3 4.5-4.9" initial={{ pathLength: still ? 1 : 0 }} animate={{ pathLength: 1 }} transition={{ duration: still ? 0 : 0.45, delay: still ? 0 : 0.3, ease: [0.33, 1, 0.68, 1] }} />
            )}
          </motion.svg>
        ) : status === 'failed' ? (
          <motion.span key="failed" className="latin text-[15px] font-bold leading-none" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            !
          </motion.span>
        ) : (
          <motion.span key="idle" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <ArrowUp className="size-4" />
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  )
}

/**
 * Submit button for the contact form. It owns the visuals of the four states and nothing else:
 * the label rolls to the new wording while the button's width follows it, the mark in the bubble
 * goes arrow → spinner → drawn tick (or "!"), the ground turns to the success colour when the
 * message is sent, and a failure shakes it once. While sending it is marked busy and the form
 * ignores further submits; it is never `disabled`, so keyboard focus stays where it is.
 */
export function SubmitButton({ status }: { status: SubmitStatus }) {
  const { t, lang } = useLanguage()
  const reduce = Boolean(useReducedMotion())
  const controls = useAnimationControls()
  const sizer = useRef<HTMLSpanElement>(null)
  const [width, setWidth] = useState<number | null>(null)
  const label = status === 'sending' ? t('form.sending') : status === 'sent' ? t('form.sentShort') : t('form.send')

  // Measure the incoming label once, then tween to it: one layout read per state change.
  useLayoutEffect(() => {
    if (sizer.current) setWidth(Math.ceil(sizer.current.getBoundingClientRect().width))
  }, [label, lang])
  useEffect(() => {
    void document.fonts?.ready.then(() => sizer.current && setWidth(Math.ceil(sizer.current.getBoundingClientRect().width)))
  }, [])

  useEffect(() => {
    if (reduce) return
    if (status === 'sent') void controls.start({ scale: [1, 1.04, 1], transition: { duration: 0.35, ease: 'easeOut' } })
    if (status === 'failed') void controls.start({ x: [-6, 6, -4, 4, 0], transition: { duration: 0.4, ease: 'easeInOut' } })
  }, [status, reduce, controls])

  return (
    <motion.button type="submit" animate={controls} data-status={status} aria-busy={status === 'sending'} aria-disabled={status === 'sending'} className="btn btn-primary !pe-3">
      <span ref={sizer} aria-hidden="true" className="pointer-events-none invisible absolute whitespace-nowrap">
        {label}
      </span>
      <motion.span className="relative block h-[1.5em] overflow-hidden" initial={false} animate={{ width: width ?? 'auto' }} transition={{ duration: reduce ? 0 : DUR.swap, ease: EASE }}>
        <AnimatePresence initial={false}>
          <motion.span
            key={label}
            className="absolute inset-0 flex items-center whitespace-nowrap"
            initial={reduce ? { opacity: 0 } : { y: '110%' }}
            animate={reduce ? { opacity: 1 } : { y: '0%' }}
            exit={reduce ? { opacity: 0 } : { y: '-110%' }}
            transition={{ duration: reduce ? 0.15 : DUR.swap, ease: EASE }}
          >
            {label}
          </motion.span>
        </AnimatePresence>
      </motion.span>
      <Mark status={status} still={reduce} />
    </motion.button>
  )
}
