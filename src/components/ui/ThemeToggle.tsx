import { useReducedMotion } from 'framer-motion'
import { useRef } from 'react'
import { flushSync } from 'react-dom'
import { useLanguage } from '../../i18n/context'
import { DUR } from '../../lib/motion'
import { useTheme } from '../../theme/context'

type Transition = { ready: Promise<void>; finished: Promise<void> }
type Starter = { startViewTransition?: (update: () => void) => Transition }

const RAYS = [0, 45, 90, 135, 180, 225, 270, 315]

/**
 * One icon that is a sun in the dark theme and a moon in the light one (it shows where the
 * switch leads). Going to the moon, the rays pull in one after another, a second disc slides
 * across the core to carve the crescent, and the whole mark turns; going back plays the inverse.
 * The moves are plain CSS transforms keyed off `data-moon` (see `.sunmoon` in the stylesheet), so
 * the icon is already in the right state on first paint.
 */
function SunMoon({ moon }: { moon: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="sunmoon size-[18px]" data-moon={moon || undefined} fill="none" aria-hidden="true">
      <mask id="theme-crescent">
        <rect width="24" height="24" fill="#fff" />
        <circle className="sunmoon-bite" cx="17" cy="7.5" r="6.6" fill="#000" />
      </mask>
      <circle className="sunmoon-core" cx="12" cy="12" r="8" fill="currentColor" mask="url(#theme-crescent)" />
      {RAYS.map((angle, i) => (
        <g key={angle} transform={`rotate(${angle} 12 12)`}>
          <line className="sunmoon-ray" x1="12" y1="2.2" x2="12" y2="4.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" style={{ transitionDelay: `${(moon ? i : RAYS.length - 1 - i) * 25}ms` }} />
        </g>
      ))}
    </svg>
  )
}

/**
 * Theme switch. The new theme spreads across the page as a circle that opens from the centre of
 * this button, so a keyboard press looks exactly like a click. Presses during a running reveal
 * are ignored. Without the View Transitions API the page cross-fades its colours instead, and
 * under reduced motion the swap is instant.
 */
export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, setTheme } = useTheme()
  const { t } = useLanguage()
  const reduce = useReducedMotion()
  const ref = useRef<HTMLButtonElement>(null)
  const busy = useRef(false)
  const label = theme === 'dark' ? t('header.themeToLight') : t('header.themeToDark')

  const toggle = () => {
    if (busy.current) return
    const next = theme === 'dark' ? 'light' : 'dark'
    const start = (document as Starter).startViewTransition
    const button = ref.current
    if (reduce || !start || !button) {
      setTheme(next)
      return
    }
    const r = button.getBoundingClientRect()
    const x = r.left + r.width / 2
    const y = r.top + r.height / 2
    const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))
    const root = document.documentElement
    busy.current = true
    root.classList.add('theme-vt')
    const done = () => {
      root.classList.remove('theme-vt')
      busy.current = false
    }
    try {
      const transition = start.call(document, () => {
        // Written here as well as by the provider's effect, so the new snapshot is certain to carry it.
        root.setAttribute('data-theme', next)
        flushSync(() => setTheme(next))
      })
      transition.ready
        .then(() =>
          root.animate(
            { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
            { duration: DUR.themeMs, easing: 'cubic-bezier(0.76, 0, 0.24, 1)', pseudoElement: '::view-transition-new(root)' },
          ),
        )
        .catch(() => {})
      transition.finished.then(done, done)
    } catch {
      done()
      setTheme(next)
    }
  }

  return (
    <button ref={ref} type="button" onClick={toggle} aria-label={label} title={label} data-cursor="magnetic" className={className}>
      <SunMoon moon={theme === 'light'} />
    </button>
  )
}
