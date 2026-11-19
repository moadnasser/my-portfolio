import { motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion'
import type { ReactNode } from 'react'

import { CINE, EASE } from '../../lib/motion'

interface RevealProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode
  delay?: number
  /** Distance in px the element travels upward while fading in. */
  y?: number
}

/** Fade-and-rise reveal when the element scrolls into view. No-op under reduced motion. */
export function Reveal({ children, delay = 0, y = 18, ...rest }: RevealProps) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 0.7, delay, ease: EASE }}
      {...rest}
    >
      {children}
    </motion.div>
  )
}

/**
 * Image reveal: a mask opens from the bottom edge while the picture inside settles from a slight
 * zoom, so imagery arrives like a shutter instead of fading in.
 */
export function Unmask({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  const reduce = useReducedMotion()
  if (reduce) return <div className={className}>{children}</div>
  return (
    <motion.div
      className={className}
      initial={{ clipPath: 'inset(100% 0% 0% 0%)' }}
      whileInView={{ clipPath: 'inset(0% 0% 0% 0%)' }}
      viewport={{ once: true, margin: '0px 0px -8% 0px' }}
      transition={{ duration: 1.1, delay, ease: CINE }}
    >
      <motion.div className="size-full" initial={{ scale: 1.18 }} whileInView={{ scale: 1 }} viewport={{ once: true, margin: '0px 0px -8% 0px' }} transition={{ duration: 1.5, delay, ease: EASE }}>
        {children}
      </motion.div>
    </motion.div>
  )
}
