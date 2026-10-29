import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { FileDown, Menu, Moon, Sun, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { profile } from '../../data/profile'
import type { SocialLink } from '../../data/types'
import { useLanguage } from '../../i18n/context'
import { useTheme } from '../../theme/context'
import { BrandIcon } from '../ui/BrandIcon'
import { ButtonLink, IconButton } from '../ui/Button'
import { EASE } from '../../lib/motion'

const navItems = [
  { id: 'work', key: 'nav.work', to: '/projects' },
  { id: 'services', key: 'nav.services', to: '/#services' },
  { id: 'about', key: 'nav.about', to: '/#about' },
  { id: 'contact', key: 'nav.contact', to: '/#contact' },
] as const

function SocialIcon({ id }: { id: SocialLink['id'] }) {
  return <BrandIcon id={id} className="size-4" />
}

/** Floating glass bar. Fixed to the top, condenses once the page scrolls. */
export function Header() {
  const { t, lang, toggleLang } = useLanguage()
  const { theme, toggleTheme } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [hovered, setHovered] = useState<string | null>(null)
  const reduce = useReducedMotion()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

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
        className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-[70] focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-on-accent"
      >
        {t('nav.skipToContent')}
      </a>

      <div className={`shell transition-[padding] duration-300 ${scrolled ? 'pt-3' : 'pt-5 sm:pt-7'}`}>
        <div
          className={`themed flex items-center justify-between gap-3 rounded-full px-3 py-2 transition-[background-color,border-color,box-shadow] duration-300 sm:px-4 ${
            scrolled || menuOpen ? 'glass shadow-[0_18px_50px_-30px_rgb(var(--shadow-color)/0.5)]' : 'border border-transparent'
          }`}
        >
          {/* Start: monogram + CV */}
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <Link to="/" className="latin font-display inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-on-accent" aria-label={t('projects.backHome')}>
              M
            </Link>
            {profile.cvFile && (
              <ButtonLink href={profile.cvFile} download variant="secondary" size="sm" className="h-9 px-3.5 text-xs sm:text-sm" aria-label={t('header.downloadCvLabel')}>
                <FileDown className="size-3.5" aria-hidden="true" />
                {t('header.downloadCv')}
              </ButtonLink>
            )}
          </div>

          {/* Centre: nav (desktop) */}
          {/* A glowing pill glides between items as the pointer moves across the nav. */}
          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-1" onMouseLeave={() => setHovered(null)}>
              {navItems.map((item) => {
                const active = hovered === item.id
                return (
                  <li key={item.id}>
                    <Link
                      to={item.to}
                      onMouseEnter={() => setHovered(item.id)}
                      onFocus={() => setHovered(item.id)}
                      onBlur={() => setHovered(null)}
                      className={`relative block rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200 ${active ? 'text-accent' : 'text-text-2'}`}
                    >
                      {active && (
                        <motion.span
                          layoutId="nav-pill"
                          aria-hidden="true"
                          className="absolute inset-0 rounded-full border border-accent/30 bg-accent/12 shadow-[0_0_24px_-6px_var(--ring)]"
                          transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 32 }}
                        />
                      )}
                      <span className="relative">{t(item.key)}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* End: socials + toggles */}
          <div className="flex items-center gap-2">
            <ul className="hidden items-center gap-4 sm:flex">
              {profile.socials.map((s) => (
                <li key={s.id}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="link-underline latin inline-flex items-center gap-1.5 text-sm font-medium text-text-2 hover:text-text">
                    <SocialIcon id={s.id} />
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
            <span className="mx-1 hidden h-5 w-px bg-border sm:block" aria-hidden="true" />

            <button
              type="button"
              onClick={toggleLang}
              aria-label={t('header.language')}
              title={t('header.language')}
              className="glass themed latin inline-flex h-11 cursor-pointer items-center rounded-full p-1 text-xs font-bold transition-[border-color] duration-200 hover:border-accent/60"
            >
              <span className={`rounded-full px-2.5 py-1.5 transition-colors ${lang === 'en' ? 'bg-accent text-on-accent' : 'text-text-2'}`}>EN</span>
              <span className={`rounded-full px-2.5 py-1.5 transition-colors ${lang === 'ar' ? 'bg-accent text-on-accent' : 'text-text-2'}`}>AR</span>
            </button>

            <IconButton onClick={toggleTheme} label={theme === 'dark' ? t('header.themeToLight') : t('header.themeToDark')}>
              <span className="relative block size-4">
                <Sun className={`absolute inset-0 size-4 transition-[opacity,transform] duration-300 ${theme === 'dark' ? 'rotate-0 opacity-100' : '-rotate-90 opacity-0'}`} aria-hidden="true" />
                <Moon className={`absolute inset-0 size-4 transition-[opacity,transform] duration-300 ${theme === 'dark' ? 'rotate-90 opacity-0' : 'rotate-0 opacity-100'}`} aria-hidden="true" />
              </span>
            </IconButton>

            <IconButton className="lg:hidden" onClick={() => setMenuOpen((o) => !o)} label={menuOpen ? t('nav.closeMenu') : t('nav.openMenu')} aria-expanded={menuOpen} aria-controls="mobile-menu">
              {menuOpen ? <X className="size-4" aria-hidden="true" /> : <Menu className="size-4" aria-hidden="true" />}
            </IconButton>
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
            className="fixed inset-0 -z-10 flex flex-col bg-bg/95 px-6 pb-10 pt-28 backdrop-blur-xl lg:hidden"
          >
            <nav aria-label="Mobile" className="grow">
              <ul className="flex flex-col gap-2">
                {navItems.map((item, i) => (
                  <motion.li
                    key={item.id}
                    initial={reduce ? false : { opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: 0.05 + i * 0.06, ease: EASE }}
                  >
                    <Link to={item.to} onClick={() => setMenuOpen(false)} className="font-display block py-3 text-4xl font-bold tracking-tight text-text transition-colors duration-200 hover:text-accent sm:text-5xl">
                      {t(item.key)}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </nav>
            <div className="flex flex-wrap items-center gap-3 border-t border-border pt-5">
              <a href={`mailto:${profile.email}`} className="latin text-sm font-medium text-text-2">
                {profile.email}
              </a>
              <span className="grow" />
              {profile.socials.map((s) => (
                <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer" className="glass latin inline-flex h-10 items-center gap-1.5 rounded-full px-3.5 text-sm font-medium text-text-2 hover:text-text">
                  <SocialIcon id={s.id} />
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
