import { useEffect, useState } from 'react'

/**
 * True while an ink (always-dark) tile sits under the top navigation bar, so the bar can
 * switch to its dark tokens and never float as a pale strip over a dark stage.
 * `key` re-scans the page for ink tiles, e.g. after a route change.
 */
export function useInkUnderHeader(key: string) {
  const [ink, setInk] = useState(false)

  useEffect(() => {
    const over = new Set<Element>()
    // A thin band at the very top of the viewport: whatever crosses it is under the bar.
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) over.add(e.target)
          else over.delete(e.target)
        }
        setInk(over.size > 0)
      },
      { rootMargin: '-1px 0px -98% 0px' },
    )
    const scan = () => document.querySelectorAll('[data-tone="ink"]').forEach((el) => io.observe(el))
    scan()
    // Lazy sections mount after the route does.
    const late = window.setTimeout(scan, 600)
    return () => {
      window.clearTimeout(late)
      io.disconnect()
      setInk(false)
    }
  }, [key])

  return ink
}
