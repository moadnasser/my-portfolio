import { useReducedMotion } from 'framer-motion'
import { ArrowUp } from 'lucide-react'
import { Link } from 'react-router'
import { profile } from '../../data/profile'
import { useLanguage, useLocalized } from '../../i18n/context'
import { BrandIcon } from '../ui/BrandIcon'
import { navItems } from './navItems'

const year = new Date().getFullYear()

/** Dense, quiet footer on parchment: the one place the page stops giving things room. */
export function Footer() {
  const { t } = useLanguage()
  const localize = useLocalized()
  const reduce = useReducedMotion()

  const backToTop = () => window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })

  return (
    <footer data-tone="parchment" className="tile themed t-fine text-text-2">
      <div className="shell py-8">
        <nav aria-label={t('footer.nav')} className="flex flex-wrap items-center gap-x-7 gap-y-2 border-b border-hairline pb-5">
          {navItems.map((item) => (
            <Link key={item.id} to={item.to} className="hover:text-text hover:underline">
              {t(item.key)}
            </Link>
          ))}
          <span className="grow" />
          {profile.socials.map((s) => (
            <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer" className="latin inline-flex items-center gap-1.5 hover:text-text hover:underline">
              <BrandIcon id={s.id} className="size-3.5" />
              {s.label}
            </a>
          ))}
          <button type="button" onClick={backToTop} className="inline-flex cursor-pointer items-center gap-1 hover:text-text hover:underline">
            {t('footer.backToTop')}
            <ArrowUp className="size-3.5" aria-hidden="true" />
          </button>
        </nav>
        <p className="pt-5" dir="auto">
          © <span className="latin">{year}</span> {localize(profile.name)}. {t('footer.rights')} <span className="opacity-80">{t('footer.signoff')}</span>
        </p>
      </div>
    </footer>
  )
}
