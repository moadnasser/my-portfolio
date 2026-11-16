import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from 'framer-motion'
import { useRef } from 'react'

/**
 * A paragraph that lights up word by word as it travels up the screen, so reading pace and
 * scroll pace line up. Words stay ordinary inline text: wrapping, bidi and Arabic joining
 * inside each word are untouched. Plain, fully lit text under reduced motion.
 */
export function ScrollWords({ text, className = '' }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.88', 'end 0.5'] })
  const words = text.split(' ')

  if (reduce) return <p className={className}>{text}</p>
  return (
    <p ref={ref} className={className}>
      {words.map((word, i) => (
        <Word key={i} progress={scrollYProgress} from={i / words.length} to={(i + 1.5) / words.length}>
          {i < words.length - 1 ? `${word} ` : word}
        </Word>
      ))}
    </p>
  )
}

function Word({ children, progress, from, to }: { children: string; progress: MotionValue<number>; from: number; to: number }) {
  const opacity = useTransform(progress, [from, Math.min(1, to)], [0.22, 1])
  return <motion.span style={{ opacity }}>{children}</motion.span>
}
