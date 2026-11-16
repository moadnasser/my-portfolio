import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Menu, Moon, Search, Sun, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router'
import { profile } from '../../data/profile'
import { useActiveSection } from '../../hooks/useActiveSection'
import { useInkUnderHeader } from '../../hooks/useInkUnderHeader'
import { useLanguage, useLocalized } from '../../i18n/context'
import { EASE } from '../../lib/motion'
import { useTheme } from '../../theme/context'
import { BrandIcon } from '../ui/BrandIcon'
import { OPEN_PALETTE } from '../ui/CommandPalette'
import { navItems } from './navItems'

const sectionIds = navItems.map((n) => n.id)
const control = 'inline-flex h-9 cursor-pointer items-center justify-center rounded-full text-text-2 transition-[color,background-color,transform] duration-200 hover:bg-chip hover:text-text active:scale-95'

/** Slim frosted bar pinned to the top. The link for the section on screen is marked as you scroll. */
export function Header() {
  const { t, lang, toggleLang } = useLanguage()
  const localize = useLocalized()
  const { theme, toggleTheme } = useTheme()
  const { pathname } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const reduce = useReducedMotion()
  const onHome = pathname === '/'
  const section = useActiveSection(sectionIds, onHome)
  const ink = useInkUnderHeader(pathname)
  const active = onHome ? section : pathname.startsWith('/projects') ? 'work' : null

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false)
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [menuOpen])

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-14 focus:z-[70] focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:text-on-accent"
      >
        {t('nav.skipToContent')}
      </a>

      <div data-theme={ink && !menuOpen ? 'dark' : undefined} className="frost-bar themed">
        <div className="shell flex h-12 items-center justify-between gap-4">
          <Link to="/" className="flex min-w-0 items-center gap-2.5 text-text" aria-label={t('projects.backHome')}>
            {profile.photo && <img src={profile.photo} alt="" width={28} height={28} decoding="async" className="size-7 shrink-0 rounded-full bg-accent object-cover object-top" />}
            <span className="truncate text-[17px] font-semibold tracking-[-0.02em]" dir="auto">
              {localize(profile.name)}
            </span>
          </Link>

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-8">
              {navItems.map((item) => {
                const current = active === item.id
                return (
                  <li key={item.id}>
                    <Link
                      to={item.to}
                      aria-current={current ? 'true' : undefined}
                      className={`relative block py-3.5 text-sm transition-colors duration-300 hover:text-text ${current ? 'text-text' : 'text-text-2'}`}
                    >
                      {t(item.key)}
                      {current && (
                        <motion.span
                          layoutId="nav-mark"
                          aria-hidden="true"
                          className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-accent"
                          transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 36 }}
                        />
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-1">
            <button type="button" onClick={() => window.dispatchEvent(new Event(OPEN_PALETTE))} aria-label={t('palette.open')} title={t('palette.open')} aria-keyshortcuts="Meta+K Control+K" className={`${control} w-9`}>
              <Search className="size-4" aria-hidden="true" />
            </button>
            <button type="button" onClick={toggleLang} aria-label={t('header.language')} title={t('header.language')} className={`${control} px-3 text-sm`}>
              {/* Each language is named in its own script. */}
              <span className={lang === 'en' ? 'font-arabic' : 'latin'}>{lang === 'en' ? 'العربية' : 'English'}</span>
            </button>
            <button type="button" onClick={toggleTheme} aria-label={theme === 'dark' ? t('header.themeToLight') : t('header.themeToDark')} title={theme === 'dark' ? t('header.themeToLight') : t('header.themeToDark')} className={`${control} w-9`}>
              <span className="relative block size-4">
                <Sun className={`absolute inset-0 size-4 transition-[opacity,transform] duration-300 ${theme === 'dark' ? 'rotate-0 opacity-100' : '-rotate-90 opacity-0'}`} aria-hidden="true" />
                <Moon className={`absolute inset-0 size-4 transition-[opacity,transform] duration-300 ${theme === 'dark' ? 'rotate-90 opacity-0' : 'rotate-0 opacity-100'}`} aria-hidden="true" />
              </span>
            </button>
            <Link to="/#contact" className="btn-primary ms-2 hidden h-8 items-center rounded-full px-4 text-sm active:scale-95 sm:inline-flex">
              {t('hero.secondaryCta')}
            </Link>
            <button type="button" className={`${control} w-9 lg:hidden`} onClick={() => setMenuOpen((o) => !o)} aria-label={menuOpen ? t('nav.closeMenu') : t('nav.openMenu')} aria-expanded={menuOpen} aria-controls="mobile-menu">
              {menuOpen ? <X className="size-4" aria-hidden="true" /> : <Menu className="size-4" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>

      {/* Full-screen mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-menu"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="fixed inset-0 -z-10 flex flex-col bg-bg px-6 pb-10 pt-24 lg:hidden"
          >
            <nav aria-label="Mobile" className="grow">
              <ul className="flex flex-col">
                {navItems.map((item, i) => (
                  <motion.li key={item.id} initial={reduce ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.04 + i * 0.05, ease: EASE }}>
                    <Link to={item.to} onClick={() => setMenuOpen(false)} className={`t-display block py-2.5 ${active === item.id ? 'text-accent' : 'text-text'}`}>
                      {t(item.key)}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </nav>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-hairline pt-5 text-sm text-text-2">
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
        )}
      </AnimatePresence>
    </header>
  )
}
