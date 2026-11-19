import Lenis from 'lenis'

/**
 * Inertial scrolling for mouse and trackpad. Touch devices keep their native scroll, and
 * reduced-motion visitors get none of it. Everything else in the app talks to the page
 * through the helpers below, so it works the same whether Lenis is running or not.
 */
let lenis: Lenis | null = null

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function startSmoothScroll() {
  if (reduced() || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return () => {}
  const instance = new Lenis({ autoRaf: true, anchors: true, lerp: 0.115, wheelMultiplier: 1 })
  lenis = instance
  return () => {
    instance.destroy()
    if (lenis === instance) lenis = null
  }
}

/** Scroll to an element or a pixel offset. `instant` skips the animation (route changes, reduced motion). */
export function scrollToTarget(target: HTMLElement | number, instant = false) {
  const immediate = instant || reduced()
  if (lenis) {
    lenis.scrollTo(target, { immediate, force: true, duration: 1.2 })
    return
  }
  const behavior = immediate ? 'instant' : 'smooth'
  if (typeof target === 'number') window.scrollTo({ top: target, behavior })
  else target.scrollIntoView({ block: 'start', behavior })
}

/** Freeze the page behind an overlay (menu, command palette). Returns the release function. */
export function lockScroll() {
  const root = document.documentElement
  const prev = root.style.overflow
  root.style.overflow = 'hidden'
  lenis?.stop()
  return () => {
    root.style.overflow = prev
    lenis?.start()
  }
}
