import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useCanHover } from '../../hooks/useCanHover'

/**
 * A labelled disc that takes over next to the pointer while it is over something that asks for
 * it with `data-cursor="Label"` (project rows say "View", the screenshot strip says "Drag").
 * The system cursor stays visible. Mouse and trackpad only; nothing renders on touch devices.
 */
export function Cursor() {
  const fine = useCanHover()
  const reduce = useReducedMotion()
  const x = useMotionValue(-200)
  const y = useMotionValue(-200)
  const sx = useSpring(x, { stiffness: 380, damping: 32, mass: 0.5 })
  const sy = useSpring(y, { stiffness: 380, damping: 32, mass: 0.5 })
  const [label, setLabel] = useState<string | null>(null)

  useEffect(() => {
    if (!fine || reduce) return
    const move = (e: PointerEvent) => {
      x.set(e.clientX)
      y.set(e.clientY)
      const host = e.target instanceof Element ? e.target.closest<HTMLElement>('[data-cursor]') : null
      // Controls inside a host (a button on a project row) keep the plain pointer.
      const inner = e.target instanceof Element ? e.target.closest('[data-cursor-off]') : null
      const next = host && !inner ? host.dataset.cursor || null : null
      setLabel((l) => (l === next ? l : next))
    }
    const leave = () => setLabel(null)
    window.addEventListener('pointermove', move, { passive: true })
    document.documentElement.addEventListener('pointerleave', leave)
    window.addEventListener('blur', leave)
    return () => {
      window.removeEventListener('pointermove', move)
      document.documentElement.removeEventListener('pointerleave', leave)
      window.removeEventListener('blur', leave)
    }
  }, [fine, reduce, x, y])

  if (!fine || reduce) return null
  return (
    <motion.div aria-hidden="true" className="cursor" style={{ x: sx, y: sy }} initial={false} animate={{ scale: label ? 1 : 0, opacity: label ? 1 : 0 }} transition={{ type: 'spring', stiffness: 420, damping: 30 }}>
      <span className="px-2">{label}</span>
    </motion.div>
  )
}
