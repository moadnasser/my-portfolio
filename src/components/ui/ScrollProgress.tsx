import { motion, useScroll, useSpring } from 'framer-motion'

/** Thin signal-coloured reading progress bar pinned to the top edge. Grows from the reading-start side. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4 })
  return (
    <motion.div
      aria-hidden="true"
      className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-accent rtl:origin-right"
      style={{ scaleX }}
    />
  )
}
