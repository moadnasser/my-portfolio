import { motion, useReducedMotion } from 'framer-motion'
import { EASE } from '../../lib/motion'

interface RiseTextProps {
  text: string
  className?: string
  delay?: number
  /** Animate on mount instead of waiting for the text to scroll into view. */
  immediate?: boolean
  stagger?: number
}

const word = {
  hidden: { y: '112%' },
  show: { y: '0%' },
}

/**
 * Headline reveal: each word rises out of its own clipping box, one after another. Words stay
 * ordinary inline text separated by real spaces, so wrapping, bidi and Arabic joining inside
 * each word are untouched and screen readers hear the sentence as written.
 */
export function RiseText({ text, className = '', delay = 0, immediate = false, stagger = 0.045 }: RiseTextProps) {
  const reduce = useReducedMotion()
  if (reduce) return <span className={className}>{text}</span>
  const words = text.split(' ')
  const run = immediate ? { animate: 'show' } : { whileInView: 'show', viewport: { once: true, margin: '0px 0px -12% 0px' } }
  return (
    <motion.span className={className} initial="hidden" {...run} transition={{ staggerChildren: stagger, delayChildren: delay }}>
      {words.map((w, i) => (
        <span key={i}>
          {/* Padding keeps descenders and Arabic marks inside the mask; the negative margin gives the space back. */}
          <span className="-my-[0.18em] inline-block overflow-hidden py-[0.18em] align-bottom rtl:-my-[0.3em] rtl:py-[0.3em]">
            <motion.span className="inline-block will-change-transform" variants={word} transition={{ duration: 0.85, ease: EASE }}>
              {w}
            </motion.span>
          </span>
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </motion.span>
  )
}
