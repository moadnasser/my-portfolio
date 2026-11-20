import { useReducedMotion } from 'framer-motion'
import { ArrowUp } from 'lucide-react'
import { Link } from 'react-router'
import { profile } from '../../data/profile'
import { useLanguage, useLocalized } from '../../i18n/context'
import { scrollToTarget } from '../../lib/scroll'
import { BrandIcon } from '../ui/BrandIcon'
import { navItems } from './navItems'

const year = new Date().getFullYear()

/**
 * Ink in both themes: the sign-off, navigation, socials and the way back up on one ruled line,
 * with the copyright beneath.
 */
export function Footer() {
  const { t } = useLanguage()
  const localize = useLocalized()
  const reduce = useReducedMotion()
  const name = localize(profile.name)

  return (
    <footer data-theme="dark" data-tone="ink" className="sec overflow-hidden text-text-2">
      <div className="shell pt-16 lg:pt-24">
        <div className="grid grid-cols-2 gap-x-10 gap-y-10 border-t border-hairline pt-8 lg:grid-cols-12">
          <p className="col-span-2 max-w-[30ch] text-text lg:col-span-5">
            <span className="t-title block">{t('footer.signoff')}</span>
            <span className="t-caption mt-3 block text-text-2">{t('footer.based')}</span>
          </p>

          <nav aria-label={t('footer.nav')} className="lg:col-span-2">
            <ul className="flex flex-col gap-2.5">
              {navItems.map((item) => (
                <li key={item.id}>
                  <Link to={item.to} className="link-underline text-text">
                    {t(item.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <ul className="flex min-w-0 flex-col gap-2.5 lg:col-span-3">
            {profile.socials.map((s) => (
              <li key={s.id}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="latin link-underline inline-flex items-center gap-2 text-text">
                  <BrandIcon id={s.id} className="size-4" />
                  {s.label}
                </a>
              </li>
            ))}
            <li>
              <a href={`mailto:${profile.email}`} className="latin link-underline text-text max-lg:break-all">
                {profile.email}
              </a>
            </li>
          </ul>

          <div className="col-span-2 flex lg:col-span-2 lg:justify-end">
            <button type="button" onClick={() => scrollToTarget(0, Boolean(reduce))} data-cursor="magnetic" className="group inline-flex h-fit cursor-pointer items-center gap-3 rounded-full text-text">
              {t('footer.backToTop')}
              <span className="arch-mark grid h-12 w-10 place-items-center  text-on-accent transition-transform duration-500 ease-out-expo group-hover:-translate-y-1.5">
                <ArrowUp className="size-4" aria-hidden="true" />
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="mt-14 border-t border-hairline lg:mt-20">
        <p className="shell t-fine py-5" dir="auto">
          © <span className="latin">{year}</span> {name}. {t('footer.rights')}
        </p>
      </div>
    </footer>
  )
}
