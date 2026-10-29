import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring } from 'framer-motion'
import type { PointerEvent, ReactNode } from 'react'
import { useCanHover } from '../../hooks/useCanHover'

interface TiltCardProps {
  children: ReactNode
  className?: string
  /** Maximum tilt in degrees. */
  max?: number
}

/** Perspective tilt that follows the pointer, with a soft light glare. Static on touch devices and under reduced motion. */
export function TiltCard({ children, className = '', max = 7 }: TiltCardProps) {
  const reduce = useReducedMotion()
  const canHover = useCanHover()
  const enabled = canHover && !reduce

  const rx = useMotionValue(0)
  const ry = useMotionValue(0)
  const gx = useMotionValue(50)
  const gy = useMotionValue(50)
  const op = useMotionValue(0)
  const srx = useSpring(rx, { stiffness: 180, damping: 20 })
  const sry = useSpring(ry, { stiffness: 180, damping: 20 })
  const sop = useSpring(op, { stiffness: 120, damping: 20 })
  const glare = useMotionTemplate`radial-gradient(420px circle at ${gx}% ${gy}%, rgba(255,255,255,0.14), transparent 60%)`

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!enabled) return
    const r = e.currentTarget.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width
    const py = (e.clientY - r.top) / r.height
    ry.set((px - 0.5) * max * 2)
    rx.set((0.5 - py) * max * 2)
    gx.set(px * 100)
    gy.set(py * 100)
    op.set(1)
  }
  const onLeave = () => {
    rx.set(0)
    ry.set(0)
    op.set(0)
  }

  return (
    <motion.div
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={enabled ? { rotateX: srx, rotateY: sry, transformPerspective: 1000 } : undefined}
      className={`relative will-change-transform ${className}`}
    >
      {children}
      {enabled && (
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit] mix-blend-screen"
          style={{ backgroundImage: glare, opacity: sop }}
        />
      )}
    </motion.div>
  )
}
