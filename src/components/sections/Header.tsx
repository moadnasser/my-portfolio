import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from 'framer-motion'
import { ArrowUpRight, Search } from 'lucide-react'
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router'
import { profile } from '../../data/profile'
import { useActiveSection } from '../../hooks/useActiveSection'
import { useLanguage, useLocalized } from '../../i18n/context'
import { CINE, DUR, EASE } from '../../lib/motion'
import { lockScroll, scrollToTarget } from '../../lib/scroll'
import { BrandIcon } from '../ui/BrandIcon'
import { OPEN_PALETTE } from '../ui/CommandPalette'
import { ThemeToggle } from '../ui/ThemeToggle'
import { navItems, type NavId } from './navItems'

const sectionIds = navItems.map((n) => n.id)
const control = 'inline-flex h-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-text-2 transition-colors duration-200 hover:bg-chip hover:text-text active:scale-95'

/** Scroll thresholds for folding the bar, in px. */
const FOLD_AFTER = 120
const DOWN_DELTA = 10
const BOTTOM_ZONE = 80

/**
 * A part of the bar that can fold away sideways. Width is animated through a grid track
 * (0fr ↔ 1fr), so the content keeps its natural size and nothing is measured. Folded content is
 * inert: it cannot be focused or clicked while hidden.
 */
function Fold({ open, children, className = '' }: { open: boolean; children: ReactNode; className?: string }) {
  return (
    <div inert={!open} className={`grid transition-[grid-template-columns,opacity] duration-500 ease-out-expo motion-reduce:transition-none ${open ? 'grid-cols-[1fr] opacity-100' : 'grid-cols-[0fr] opacity-0'} ${className}`}>
      {/* Padding leaves room for focus rings inside the clip; the negative margin gives it back. */}
      <div className="-my-2 min-w-0 overflow-hidden py-2">{children}</div>
    </div>
  )
}

/**
 * Primary links with one shared pill. The pill rests on the section in view, glides to whichever
 * link is hovered or focused, returns when the pointer leaves, and fades out when nothing is
 * active. Its position is measured from the links themselves, so it is right in Arabic, after
 * fonts load and after a resize. Labels roll on hover: a hidden duplicate slides up into place.
 */
function PrimaryNav({ active }: { active: NavId | null }) {
  const { t, lang } = useLanguage()
  const reduce = useReducedMotion()
  const list = useRef<HTMLUListElement>(null)
  const links = useRef(new Map<NavId, HTMLAnchorElement>())
  const [preview, setPreview] = useState<NavId | null>(null)
  // The pill keeps its last position while hidden, so it fades out in place instead of sliding off.
  const [box, setBox] = useState({ x: 0, width: 0 })
  const [visible, setVisible] = useState(false)
  const target = preview ?? active

  const measure = useCallback(() => {
    const ul = list.current
    const el = target ? links.current.get(target) : undefined
    if (!ul || !el) {
      setVisible(false)
      return
    }
    const a = el.getBoundingClientRect()
    const b = ul.getBoundingClientRect()
    const next = { x: a.left - b.left, width: a.width }
    setBox((prev) => (prev.x === next.x && prev.width === next.width ? prev : next))
    setVisible(true)
  }, [target])

  useLayoutEffect(measure, [measure, lang])
  useEffect(() => {
    const ul = list.current
    if (!ul) return
    const ro = new ResizeObserver(measure)
    ro.observe(ul)
    void document.fonts?.ready.then(measure)
    return () => ro.disconnect()
  }, [measure])

  return (
    <ul ref={list} className="relative flex items-center px-1" onPointerLeave={() => setPreview(null)} onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setPreview(null)}>
      <motion.li
        aria-hidden="true"
        initial={false}
        animate={{ x: box.x, width: box.width, opacity: visible ? 1 : 0 }}
        transition={reduce ? { duration: 0 } : { duration: preview ? DUR.preview : DUR.settle, ease: EASE, opacity: { duration: 0.25 } }}
        className="pointer-events-none absolute inset-y-0.5 left-0 rounded-full bg-chip"
      >
        <span className="arch-mark absolute bottom-[3px] left-1/2 -ml-[3px] h-[5px] w-1.5" />
      </motion.li>
      {navItems.map((item) => {
        const current = active === item.id
        const text = t(item.key)
        return (
          <li key={item.id}>
            <Link
              ref={(el) => {
                if (el) links.current.set(item.id, el)
                else links.current.delete(item.id)
              }}
              to={item.to}
              aria-current={current ? 'true' : undefined}
              onPointerEnter={() => setPreview(item.id)}
              onFocus={() => setPreview(item.id)}
              className={`group relative block whitespace-nowrap px-3.5 py-2.5 text-sm transition-colors duration-300 hover:text-text ${current ? 'text-text' : 'text-text-2'}`}
            >
              <span className="relative -my-1 block overflow-hidden py-1">
                <span className="block transition-transform duration-[450ms] ease-out-expo group-hover:-translate-y-[150%] motion-reduce:transform-none">{text}</span>
                <span aria-hidden="true" className="absolute inset-x-0 top-1 block translate-y-[150%] transition-transform duration-[450ms] ease-out-expo group-hover:translate-y-0 motion-reduce:hidden">
                  {text}
                </span>
              </span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

/**
 * One floating bar that adapts to what the visitor is doing.
 *
 * At rest it is the full bar: who, the sections, and the controls. Once the visitor is clearly
 * scrolling down it folds into a small island that shows only the portrait, the name of the
 * section on screen and search, so the content gets the room. It opens again on any upward
 * scroll, when the pointer rests on it, when keyboard focus enters it, and near the end of the
 * page. A ring around the portrait fills as the page is read. The portrait and name always
 * lead back to the top.
 */
export function Header() {
  const { t, lang, toggleLang } = useLanguage()
  const localize = useLocalized()
  const { pathname } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolledAway, setScrolledAway] = useState(false)
  const [engaged, setEngaged] = useState(false)
  const reduce = useReducedMotion()
  const barRef = useRef<HTMLDivElement>(null)
  const onHome = pathname === '/'
  const section = useActiveSection(sectionIds, onHome)
  const active = onHome ? section : pathname.startsWith('/projects') ? 'work' : null
  const folded = scrolledAway && !engaged && !menuOpen
  const activeLabel = active ? t(navItems.find((n) => n.id === active)!.key) : null

  const { scrollY, scrollYProgress } = useScroll()
  const travelled = useRef(0)
  useMotionValueEvent(scrollY, 'change', (y) => {
    const delta = y - (scrollY.getPrevious() ?? 0)
    if (delta < 0) {
      travelled.current = 0
      setScrolledAway(false)
      return
    }
    travelled.current += delta
    const nearBottom = y + window.innerHeight >= document.documentElement.scrollHeight - BOTTOM_ZONE
    if (nearBottom) setScrolledAway(false)
    else if (travelled.current > DOWN_DELTA && y > FOLD_AFTER) setScrolledAway(true)
  })
  // Reading progress goes straight to a CSS variable: no render per scroll frame.
  useMotionValueEvent(scrollYProgress, 'change', (p) => barRef.current?.style.setProperty('--progress', `${Math.round(p * 1000) / 10}%`))

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false)
    window.addEventListener('keydown', onKey)
    const release = lockScroll()
    return () => {
      window.removeEventListener('keydown', onKey)
      release()
    }
  }, [menuOpen])

  /** On the home page the brand scrolls back to the top; elsewhere it is the link home, which lands at the top too. */
  const toTop = (e: MouseEvent<HTMLAnchorElement>) => {
    setMenuOpen(false)
    if (!onHome || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
    e.preventDefault()
    scrollToTarget(0)
  }

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50">
      <a
        href="#main"
        className="pointer-events-auto sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-20 focus:z-[70] focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:text-on-accent"
      >
        {t('nav.skipToContent')}
      </a>

      <div className="relative z-10 flex justify-center px-3 pt-3">
        <div
          ref={barRef}
          data-folded={folded || undefined}
          onPointerEnter={(e) => e.pointerType === 'mouse' && setEngaged(true)}
          onPointerLeave={() => setEngaged(false)}
          onFocusCapture={(e) => e.target.matches(':focus-visible') && setEngaged(true)}
          onBlurCapture={(e) => !e.currentTarget.contains(e.relatedTarget) && setEngaged(false)}
          className="enter glass themed pointer-events-auto flex h-14 max-w-full items-center gap-1 rounded-full p-2 shadow-[0_10px_40px_-18px_rgb(var(--shadow-color)/0.5)]"
        >
          <Link to="/" onClick={toTop} aria-label={t('footer.backToTop')} className="group flex min-w-0 items-center rounded-full pe-2 text-text">
            {/* The ring is the reading progress: it fills clockwise as the page scrolls. */}
            <span className="grid size-10 shrink-0 place-items-center rounded-full [background:conic-gradient(var(--accent)_var(--progress,0%),var(--chip)_0)]">
              {profile.photo ? (
                <img src={profile.photo} alt="" width={34} height={34} decoding="async" className="size-[34px] rounded-full bg-accent object-cover object-top ring-2 ring-[color:var(--bg)] transition-transform duration-500 ease-out-expo group-hover:scale-105" />
              ) : (
                <span className="size-[34px] rounded-full bg-accent" />
              )}
            </span>
            <Fold open={!folded || !activeLabel} className="max-[420px]:hidden">
              <span className="block truncate whitespace-nowrap ps-2.5 text-[15px] font-semibold tracking-[-0.01em]" dir="auto">
                {localize(profile.name)}
              </span>
            </Fold>
            <Fold open={folded && Boolean(activeLabel)}>
              <span className="flex items-center gap-2 whitespace-nowrap ps-2.5 text-sm text-text" aria-hidden="true">
                <span className="arch-mark h-[7px] w-1.5" />
                {activeLabel}
              </span>
            </Fold>
          </Link>

          <Fold open={!folded} className="max-lg:hidden">
            <nav aria-label="Primary">
              <PrimaryNav active={active} />
            </nav>
          </Fold>

          <button type="button" onClick={() => window.dispatchEvent(new Event(OPEN_PALETTE))} aria-label={t('palette.open')} title={t('palette.open')} aria-keyshortcuts="Meta+K Control+K" className={`${control} w-10`}>
            <Search className="size-4" aria-hidden="true" />
          </button>

          <Fold open={!folded} className="max-sm:hidden">
            <div className="flex items-center gap-1">
              <button type="button" onClick={toggleLang} aria-label={t('header.language')} title={t('header.language')} data-cursor="magnetic" className={`${control} px-2.5 text-sm`}>
                {/* Each language is named in its own script. */}
                <span className={lang === 'en' ? 'font-arabic' : 'latin'}>{lang === 'en' ? 'العربية' : 'English'}</span>
              </button>
              <ThemeToggle className={`${control} w-10`} />
              <Link to="/#contact" className="btn btn-primary btn-sm ms-1">
                {t('hero.secondaryCta')}
              </Link>
            </div>
          </Fold>

          <button type="button" className={`${control} w-10 lg:hidden`} onClick={() => setMenuOpen((o) => !o)} aria-label={menuOpen ? t('nav.closeMenu') : t('nav.openMenu')} aria-expanded={menuOpen} aria-controls="mobile-menu">
            {/* Two bars that cross into a close mark, in step with the sheet below. */}
            <span className="relative block h-3 w-[1.125rem]" aria-hidden="true">
              <span className={`absolute inset-x-0 top-0 h-px bg-current transition-transform duration-[750ms] ease-cine ${menuOpen ? 'translate-y-[5.5px] rotate-45' : ''}`} />
              <span className={`absolute inset-x-0 bottom-0 h-px bg-current transition-transform duration-[750ms] ease-cine ${menuOpen ? '-translate-y-[5.5px] -rotate-45' : ''}`} />
            </span>
          </button>
        </div>
      </div>

      {/* Full-screen menu: a sheet that drops from the top edge. */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-menu"
            initial={reduce ? { opacity: 0 } : { clipPath: 'inset(0% 0% 100% 0%)' }}
            animate={reduce ? { opacity: 1 } : { clipPath: 'inset(0% 0% 0% 0%)' }}
            exit={reduce ? { opacity: 0 } : { clipPath: 'inset(0% 0% 100% 0%)' }}
            transition={{ duration: reduce ? 0.2 : 0.75, ease: CINE }}
            className="pointer-events-auto fixed inset-0 flex flex-col overflow-y-auto bg-bg px-5 pb-8 pt-24 lg:hidden"
          >
            <nav aria-label="Mobile" className="grow">
              <ul className="flex flex-col">
                {navItems.map((item, i) => (
                  <li key={item.id} className="overflow-hidden border-b border-hairline">
                    <motion.div initial={reduce ? false : { y: '110%' }} animate={{ y: '0%' }} transition={{ duration: 0.8, delay: 0.25 + i * 0.06, ease: EASE }}>
                      <Link to={item.to} onClick={() => setMenuOpen(false)} className={`t-hero flex items-center justify-between gap-4 py-3 ${active === item.id ? 'text-accent' : 'text-text'}`}>
                        {t(item.key)}
                        <ArrowUpRight className="size-[0.5em] shrink-0 text-text-2 rtl:-scale-x-100" aria-hidden="true" />
                      </Link>
                    </motion.div>
                  </li>
                ))}
              </ul>
            </nav>
            <motion.div initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 0.5 }} className="mt-8 flex flex-col gap-5">
              {/* On phones the language and theme switches live here instead of in the bar. */}
              <div className="flex items-center gap-2 sm:hidden">
                <button type="button" onClick={toggleLang} aria-label={t('header.language')} className={`${control} grow border border-hairline px-4 text-sm`}>
                  <span className={lang === 'en' ? 'font-arabic' : 'latin'}>{lang === 'en' ? 'العربية' : 'English'}</span>
                </button>
                <ThemeToggle className={`${control} w-12 border border-hairline`} />
              </div>
              <Link to="/#contact" onClick={() => setMenuOpen(false)} className="btn btn-primary w-full sm:!hidden">
                {t('hero.secondaryCta')}
              </Link>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-text-2">
                <a href={`mailto:${profile.email}`} className="latin">
                  {profile.email}
                </a>
                <span className="grow" />
                {profile.socials.map((s) => (
                  <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer" className="latin inline-flex items-center gap-1.5 text-accent">
                    <BrandIcon id={s.id} className="size-4" />
                    {s.label}
                  </a>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
