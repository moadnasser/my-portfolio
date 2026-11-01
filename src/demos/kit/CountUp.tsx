import { animate, useReducedMotion } from 'framer-motion'
import { useLayoutEffect, useRef } from 'react'

/** Number that eases to its new value (600ms, like the UAB wallet card). Static under reduced motion. */
export function CountUp({ value, format, duration = 0.6 }: { value: number; format: (n: number) => string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const from = useRef(0)
  const reduce = useReducedMotion()
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    if (reduce) {
      el.textContent = format(value)
      from.current = value
      return
    }
    const controls = animate(from.current, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => (el.textContent = format(v)),
    })
    from.current = value
    return () => controls.stop()
  }, [value, format, duration, reduce])
  return <span ref={ref}>{format(value)}</span>
}
