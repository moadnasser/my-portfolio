import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from 'framer-motion'
import { ArrowUpRight, Moon, Search, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router'
import { profile } from '../../data/profile'
import { useActiveSection } from '../../hooks/useActiveSection'
import { useLanguage, useLocalized } from '../../i18n/context'
import { CINE, EASE } from '../../lib/motion'
import { lockScroll } from '../../lib/scroll'
import { useTheme } from '../../theme/context'
import { BrandIcon } from '../ui/BrandIcon'
import { OPEN_PALETTE } from '../ui/CommandPalette'
import { navItems } from './navItems'

const sectionIds = navItems.map((n) => n.id)
const control = 'inline-flex h-10 cursor-pointer items-center justify-center rounded-md text-text-2 transition-[color,background-color,transform] duration-200 hover:bg-chip hover:text-text active:scale-95'
const capsule = 'glass themed pointer-events-auto flex h-12 items-center rounded-xl'

/**
 * Three glass capsules floating over the page: who, where, and controls. They slide away while
 * the visitor scrolls down and return on the first scroll up, so imagery gets the whole screen.
 */
export function Header() {
  const { t, lang, toggleLang } = useLanguage()
  const localize = useLocalized()
  const { theme, toggleTheme } = useTheme()
  const { pathname } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [hidden, setHidden] = useState(false)
  const reduce = useReducedMotion()
  const onHome = pathname === '/'
  const section = useActiveSection(sectionIds, onHome)
  const active = onHome ? section : pathname.startsWith('/projects') ? 'work' : null

  const { scrollY } = useScroll()
  useMotionValueEvent(scrollY, 'change', (y) => {
    const before = scrollY.getPrevious() ?? 0
    const next = y > 240 && y > before
    // Ignore sub-pixel jitter so the bar does not flicker at rest.
    if (Math.abs(y - before) > 2) setHidden((h) => (h === next ? h : next))
  })

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

  const themeLabel = theme === 'dark' ? t('header.themeToLight') : t('header.themeToDark')

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50">
      <a
        href="#main"
        className="pointer-events-auto sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-20 focus:z-[70] focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:text-on-accent"
      >
        {t('nav.skipToContent')}
      </a>

      <motion.div
        initial={reduce ? false : { y: '-130%' }}
        animate={{ y: hidden && !menuOpen ? '-130%' : '0%' }}
        transition={{ duration: 0.6, ease: EASE }}
        // Focus inside the bar always brings it back.
        onFocusCapture={() => setHidden(false)}
        className="shell relative z-10 flex items-center justify-between gap-3 pt-4"
      >
        <Link to="/" className={`${capsule} min-w-0 gap-2.5 ps-1.5 pe-4 text-text`} aria-label={t('projects.backHome')}>
          {profile.photo && <img src={profile.photo} alt="" width={30} height={36} decoding="async" className="arch h-9 w-[1.875rem] shrink-0 object-cover object-top" />}
          <span className="truncate text-[15px] font-semibold tracking-[-0.01em] max-[400px]:hidden" dir="auto">
            {localize(profile.name)}
          </span>
        </Link>

        <nav aria-label="Primary" className={`${capsule} hidden px-2 lg:flex`}>
          <ul className="flex items-center">
            {navItems.map((item) => {
              const current = active === item.id
              return (
                <li key={item.id}>
                  <Link
                    to={item.to}
                    aria-current={current ? 'true' : undefined}
                    className={`relative block px-4 py-3 text-sm transition-colors duration-300 hover:text-text ${current ? 'text-text' : 'text-text-2'}`}
                  >
                    {t(item.key)}
                    {current && (
                      <motion.span
                        layoutId="nav-mark"
                        aria-hidden="true"
                        className="arch-mark absolute bottom-1 left-1/2 -ml-[3px] h-[7px] w-1.5 "
                        transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 36 }}
                      />
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className={`${capsule} gap-0.5 px-1`}>
          <button type="button" onClick={() => window.dispatchEvent(new Event(OPEN_PALETTE))} aria-label={t('palette.open')} title={t('palette.open')} aria-keyshortcuts="Meta+K Control+K" className={`${control} w-10`}>
            <Search className="size-4" aria-hidden="true" />
          </button>
          <button type="button" onClick={toggleLang} aria-label={t('header.language')} title={t('header.language')} className={`${control} px-2.5 text-sm`}>
            {/* Each language is named in its own script. */}
            <span className={lang === 'en' ? 'font-arabic' : 'latin'}>{lang === 'en' ? 'العربية' : 'English'}</span>
          </button>
          <button type="button" onClick={toggleTheme} aria-label={themeLabel} title={themeLabel} className={`${control} w-10`}>
            <span className="relative block size-4">
              <Sun className={`absolute inset-0 size-4 transition-[opacity,transform] duration-500 ${theme === 'dark' ? 'rotate-0 opacity-100' : '-rotate-90 opacity-0'}`} aria-hidden="true" />
              <Moon className={`absolute inset-0 size-4 transition-[opacity,transform] duration-500 ${theme === 'dark' ? 'rotate-90 opacity-0' : 'rotate-0 opacity-100'}`} aria-hidden="true" />
            </span>
          </button>
          <Link to="/#contact" className="btn btn-primary btn-sm ms-1 max-sm:!hidden">
            {t('hero.secondaryCta')}
          </Link>
          <button type="button" className={`${control} w-10 lg:hidden`} onClick={() => setMenuOpen((o) => !o)} aria-label={menuOpen ? t('nav.closeMenu') : t('nav.openMenu')} aria-expanded={menuOpen} aria-controls="mobile-menu">
            {/* Two bars that cross into a close mark. */}
            <span className="relative block h-3 w-[1.125rem]" aria-hidden="true">
              <span className={`absolute inset-x-0 top-0 h-px bg-current transition-transform duration-500 ease-out-expo ${menuOpen ? 'translate-y-[5.5px] rotate-45' : ''}`} />
              <span className={`absolute inset-x-0 bottom-0 h-px bg-current transition-transform duration-500 ease-out-expo ${menuOpen ? '-translate-y-[5.5px] -rotate-45' : ''}`} />
            </span>
          </button>
        </div>
      </motion.div>

      {/* Full-screen menu: a sheet that drops from the top edge. */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-menu"
            initial={reduce ? { opacity: 0 } : { clipPath: 'inset(0% 0% 100% 0%)' }}
            animate={reduce ? { opacity: 1 } : { clipPath: 'inset(0% 0% 0% 0%)' }}
            exit={reduce ? { opacity: 0 } : { clipPath: 'inset(0% 0% 100% 0%)' }}
            transition={{ duration: reduce ? 0.2 : 0.75, ease: CINE }}
            className="pointer-events-auto fixed inset-0 flex flex-col overflow-y-auto bg-bg px-5 pb-8 pt-28 lg:hidden"
          >
            <nav aria-label="Mobile" className="grow">
              <ul className="flex flex-col">
                {navItems.map((item, i) => (
                  <li key={item.id} className="overflow-hidden border-b border-hairline">
                    <motion.div initial={reduce ? false : { y: '110%' }} animate={{ y: '0%' }} transition={{ duration: 0.8, delay: 0.25 + i * 0.06, ease: EASE }}>
                      <Link to={item.to} onClick={() => setMenuOpen(false)} className={`t-hero flex items-center justify-between gap-4 py-3 !text-[clamp(2.25rem,11vw,4rem)] ${active === item.id ? 'text-accent' : 'text-text'}`}>
                        {t(item.key)}
                        <ArrowUpRight className="size-[0.5em] shrink-0 text-text-2 rtl:-scale-x-100" aria-hidden="true" />
                      </Link>
                    </motion.div>
                  </li>
                ))}
              </ul>
            </nav>
            <motion.div initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 0.5 }} className="mt-8 flex flex-col gap-5">
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
