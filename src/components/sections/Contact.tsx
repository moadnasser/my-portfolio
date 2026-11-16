import { Check, Copy, Mail, MessageCircle, Phone } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { profile } from '../../data/profile'
import { useCopyEmail } from '../../hooks/useCopyEmail'
import { useLanguage } from '../../i18n/context'
import { BrandIcon } from '../ui/BrandIcon'
import { ButtonLink } from '../ui/Button'
import { Reveal } from '../ui/Reveal'
import { Tile } from '../ui/Tile'
import { ContactForm } from './ContactForm'

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
    <Tile id="contact" tone="canvas" aria-labelledby="contact-title" className="scroll-mt-12">
      <div className="shell">
        <Reveal className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <p className="t-eyebrow">{t('contact.eyebrow')}</p>
          <h2 id="contact-title" className="t-hero mt-3 text-balance text-text">
            {t('contact.title')}
          </h2>
          <p className="t-lead mt-6 max-w-xl text-pretty text-text-2">{t('contact.subtitle')}</p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <ButtonLink href={`mailto:${profile.email}`}>
              <Mail className="size-4" aria-hidden="true" />
              {t('contact.email')}
            </ButtonLink>
            {profile.telegram && (
              <ButtonLink href={profile.telegram} external variant="secondary">
                <BrandIcon id="telegram" className="size-4" />
                {t('contact.telegram')}
              </ButtonLink>
            )}
          </div>
        </Reveal>

        <Reveal delay={0.1} className="mx-auto mt-16 grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.45fr]">
          {profile.phone && (
            <Card icon={<Phone className="size-5" aria-hidden="true" />} label={t('contact.phone')}>
              <a href={`tel:${profile.phone.tel}`} aria-label={t('contact.call', { number: profile.phone.display })} className="latin link-underline text-[17px] font-semibold text-text" dir="ltr">
                {profile.phone.display}
              </a>
            </Card>
          )}
          {(profile.whatsappUsername || whatsappUrl) && (
            <Card icon={<MessageCircle className="size-5" aria-hidden="true" />} label={t('contact.whatsappLabel')}>
              {whatsappUrl ? (
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="latin link-underline text-[17px] font-semibold text-text" dir="ltr">
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
            <a href={`mailto:${profile.email}`} className="latin link-underline min-w-0 break-all text-[17px] font-semibold text-text" dir="ltr">
              {profile.email}
            </a>
            <CopyButton status={email.status} label={t('contact.copyEmail')} onClick={email.copy} copied={t('contact.copied')} failed={t('contact.copyFailed')} />
          </Card>
        </Reveal>

        <Reveal delay={0.1}>
          <ContactForm />
        </Reveal>
      </div>
    </Tile>
  )
}

function Card({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="themed flex min-w-0 flex-col gap-3 rounded-card bg-bg p-6 text-start">
      <div className="flex items-center gap-3">
        <span className="shrink-0 text-accent">{icon}</span>
        <span className="t-caption font-semibold text-text-2">{label}</span>
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
      className="relative grid size-10 shrink-0 cursor-pointer place-items-center rounded-full text-text-2 transition-colors hover:bg-chip hover:text-text active:scale-95"
    >
      {status === 'copied' ? <Check className="size-4 text-accent" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
      <span className="sr-only" aria-live="polite">
        {status === 'copied' ? copied : status === 'failed' ? failed : ''}
      </span>
    </button>
  )
}
