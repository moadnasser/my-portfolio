import { useEffect, useState } from 'react'

/**
 * Id of the section currently crossing the middle of the viewport, or null above the first one.
 * Uses a zero-height observer band at mid-screen, so exactly one section matches at a time
 * and nothing runs on scroll.
 */
export function useActiveSection<T extends string>(ids: readonly T[], enabled: boolean): T | null {
  const [active, setActive] = useState<T | null>(null)

  useEffect(() => {
    if (!enabled) return
    const els = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => el !== null)
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id as T
          if (entry.isIntersecting) setActive(id)
          else setActive((current) => (current === id ? null : current))
        }
      },
      { rootMargin: '-50% 0px -50% 0px' },
    )
    els.forEach((el) => io.observe(el))
    return () => {
      io.disconnect()
      setActive(null)
    }
  }, [ids, enabled])

  return enabled ? active : null
}
