import { Check, Copy, Mail, MessageCircle, Phone } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { profile } from '../../data/profile'
import { useCopyEmail } from '../../hooks/useCopyEmail'
import { useLanguage } from '../../i18n/context'
import { Ambient } from '../ui/Ambient'
import { BrandIcon } from '../ui/BrandIcon'
import { ButtonLink } from '../ui/Button'
import { Magnetic } from '../ui/Magnetic'
import { Reveal } from '../ui/Reveal'

export function Contact() {
  const { t } = useLanguage()
  const email = useCopyEmail()
  const [handleStatus, setHandleStatus] = useState<'idle' | 'copied' | 'failed'>('idle')
  const whatsappUrl = profile.whatsapp ? `https://wa.me/${profile.whatsapp.replace(/\D/g, '')}` : null

  const copyHandle = async () => {
    if (!profile.whatsappUsername) return
    try {
      await navigator.clipboard.writeText(profile.whatsappUsername)
      setHandleStatus('copied')
    } catch {
      setHandleStatus('failed')
    }
    window.setTimeout(() => setHandleStatus('idle'), 2000)
  }

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
            {profile.telegram && (
              <ButtonLink href={profile.telegram} external variant="secondary" size="lg" className="w-full sm:w-auto">
                <BrandIcon id="telegram" className="size-4" />
                {t('contact.telegram')}
              </ButtonLink>
            )}
          </div>
        </Reveal>

        <Reveal delay={0.1} className="mx-auto mt-14 grid max-w-5xl gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.45fr]">
          {profile.phone && (
            <Card icon={<Phone className="size-5" aria-hidden="true" />} label={t('contact.phone')}>
              <a href={`tel:${profile.phone.tel}`} aria-label={t('contact.call', { number: profile.phone.display })} className="latin link-underline text-base font-semibold text-text" dir="ltr">
                {profile.phone.display}
              </a>
            </Card>
          )}
          {(profile.whatsappUsername || whatsappUrl) && (
            <Card icon={<MessageCircle className="size-5" aria-hidden="true" />} label={t('contact.whatsappLabel')}>
              {whatsappUrl ? (
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="latin link-underline text-base font-semibold text-text" dir="ltr">
                  {profile.whatsappUsername ?? profile.whatsapp}
                </a>
              ) : (
                <span className="latin text-base font-semibold text-text" dir="ltr">
                  {profile.whatsappUsername}
                </span>
              )}
              <CopyButton status={handleStatus} label={t('contact.copyHandle')} onClick={copyHandle} copied={t('contact.copied')} failed={t('contact.copyFailed')} />
            </Card>
          )}
          <Card icon={<Mail className="size-5" aria-hidden="true" />} label={t('contact.emailLabel')}>
            <a href={`mailto:${profile.email}`} className="latin link-underline min-w-0 break-all text-[15px] font-semibold text-text" dir="ltr">
              {profile.email}
            </a>
            <CopyButton status={email.status} label={t('contact.copyEmail')} onClick={email.copy} copied={t('contact.copied')} failed={t('contact.copyFailed')} />
          </Card>
        </Reveal>
      </div>
    </section>
  )
}

function Card({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="glass themed flex min-w-0 flex-col gap-3 rounded-card p-5 text-start transition-colors duration-300 hover:border-accent/40">
      <div className="flex items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent/12 text-accent">{icon}</span>
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-text-2">{label}</span>
      </div>
      <div className="flex min-w-0 items-center justify-between gap-2">{children}</div>
    </div>
  )
}

function CopyButton({ status, label, onClick, copied, failed }: { status: string; label: string; onClick: () => void; copied: string; failed: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="relative grid size-10 shrink-0 cursor-pointer place-items-center rounded-full text-text-2 transition-colors hover:bg-surface-2 hover:text-text active:scale-95"
    >
      {status === 'copied' ? <Check className="size-4 text-accent" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
      <span className="sr-only" aria-live="polite">
        {status === 'copied' ? copied : status === 'failed' ? failed : ''}
      </span>
    </button>
  )
}
