import { useReducedMotion } from 'framer-motion'
import { ArrowUp } from 'lucide-react'
import { profile } from '../../data/profile'
import { useLanguage, useLocalized } from '../../i18n/context'
import { BrandIcon } from '../ui/BrandIcon'
import { IconButton } from '../ui/Button'

const year = new Date().getFullYear()

export function Footer() {
  const { t } = useLanguage()
  const localize = useLocalized()
  const reduce = useReducedMotion()

  const backToTop = () => window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })

  return (
    <footer className="relative overflow-hidden border-t border-border">
      <div className="shell flex flex-col items-center justify-between gap-5 py-8 sm:flex-row">
        <p className="text-center text-sm text-text-2 sm:text-start">
          <span dir="auto">
            © <span className="latin">{year}</span> {localize(profile.name)}. {t('footer.rights')}
          </span>
          <span className="mt-1 block text-xs text-text-2/80">{t('footer.signoff')}</span>
        </p>
        <div className="flex items-center gap-3">
          <ul className="flex items-center gap-2">
            {profile.socials.map((s) => (
              <li key={s.id}>
                <a href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.label} title={s.label} className="glass themed inline-flex size-11 items-center justify-center rounded-full text-text-2 transition-colors duration-200 hover:border-accent/60 hover:text-text">
                  <BrandIcon id={s.id} className="size-4" />
                </a>
              </li>
            ))}
          </ul>
          <IconButton onClick={backToTop} label={t('footer.backToTop')}>
            <ArrowUp className="size-4" aria-hidden="true" />
          </IconButton>
        </div>
      </div>
      {/* Watermark */}
      <div className="shell pointer-events-none select-none pb-6 pt-4 sm:pb-8" aria-hidden="true">
        <span className="font-display text-outline block whitespace-nowrap text-[clamp(2.25rem,8.6vw,8.5rem)] font-bold leading-[1.35] tracking-[-0.04em] opacity-50" dir="auto">
          {localize(profile.name)}
        </span>
      </div>
    </footer>
  )
}
