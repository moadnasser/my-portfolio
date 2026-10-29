import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion'
import type { PointerEvent, ReactNode } from 'react'
import { useCanHover } from '../../hooks/useCanHover'

interface MagneticProps {
  children: ReactNode
  /** Pull strength; 0.3 keeps the element inside its own hit box. */
  strength?: number
  className?: string
}

/** Pulls its child toward the pointer. Reserved for one or two focal CTAs per screen. */
export function Magnetic({ children, strength = 0.3, className = '' }: MagneticProps) {
  const reduce = useReducedMotion()
  const canHover = useCanHover()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.6 })
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.6 })
  const enabled = canHover && !reduce

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!enabled) return
    const r = e.currentTarget.getBoundingClientRect()
    x.set((e.clientX - r.left - r.width / 2) * strength)
    y.set((e.clientY - r.top - r.height / 2) * strength)
  }
  const onLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={enabled ? { x: sx, y: sy } : undefined}
      className={`inline-flex will-change-transform ${className}`}
    >
      {children}
    </motion.div>
  )
}
