import { Check, Copy, Mail, MessageCircle } from 'lucide-react'
import { profile } from '../../data/profile'
import { useLanguage } from '../../i18n/context'
import { Ambient } from '../ui/Ambient'
import { Button, ButtonLink } from '../ui/Button'
import { Magnetic } from '../ui/Magnetic'
import { Reveal } from '../ui/Reveal'
import { useCopyEmail } from '../../hooks/useCopyEmail'

export function Contact() {
  const { t } = useLanguage()
  const { status, copy } = useCopyEmail()
  const whatsappUrl = profile.whatsapp ? `https://wa.me/${profile.whatsapp.replace(/\D/g, '')}` : null

  return (
    <section id="contact" className="relative isolate scroll-mt-24 overflow-hidden py-28 sm:py-36 lg:py-44" aria-labelledby="contact-title">
      <Ambient />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-bg to-transparent" aria-hidden="true" />
      <div className="shell relative">
        <Reveal className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-text-2">
            <span className="latin font-display text-accent">04</span>
            <span className="h-px w-8 bg-border" aria-hidden="true" />
            <span>{t('contact.eyebrow')}</span>
          </div>
          <h2 id="contact-title" className="font-display mt-6 text-balance text-4xl font-bold leading-[1] tracking-[-0.035em] text-text sm:text-6xl lg:text-7xl">
            {t('contact.title')}
          </h2>
          <p className="mt-6 max-w-lg text-pretty text-base leading-relaxed text-text-2 sm:text-lg">{t('contact.subtitle')}</p>

          <div className="mt-10 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
            <Magnetic className="w-full sm:w-auto">
              <ButtonLink href={`mailto:${profile.email}`} size="lg" className="w-full sm:w-auto">
                <Mail className="size-4" aria-hidden="true" />
                {t('contact.email')}
              </ButtonLink>
            </Magnetic>
            {whatsappUrl && (
              <ButtonLink href={whatsappUrl} external variant="secondary" size="lg" className="w-full sm:w-auto">
                <MessageCircle className="size-4" aria-hidden="true" />
                {t('contact.whatsapp')}
              </ButtonLink>
            )}
            <Button onClick={copy} variant="ghost" size="lg" aria-live="polite" className="w-full sm:w-auto">
              {status === 'copied' ? <Check className="size-4 text-accent" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
              {status === 'copied' ? t('header.copied') : status === 'failed' ? t('header.copyFailed') : t('contact.copyEmail')}
            </Button>
          </div>
          <a href={`mailto:${profile.email}`} className="latin link-underline mt-8 text-sm font-medium text-text-2 hover:text-text">
            {profile.email}
          </a>
        </Reveal>
      </div>
    </section>
  )
}
