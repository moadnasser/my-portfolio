import { ArrowUpRight, Check, Copy, Mail, Phone } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { profile } from '../../data/profile'
import { useLanguage } from '../../i18n/context'
import { BrandIcon } from '../ui/BrandIcon'
import { Magnetic } from '../ui/Magnetic'
import { Reveal } from '../ui/Reveal'
import { RiseText } from '../ui/RiseText'
import { ContactForm } from './ContactForm'

/** Copies a value and remembers which channel was copied for a moment, so that row can confirm it. */
function useCopy() {
  const [state, setState] = useState<{ id: string; ok: boolean } | null>(null)
  const timer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(timer.current), [])
  const copy = async (id: string, text: string) => {
    let ok = true
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      ok = false
    }
    setState({ id, ok })
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setState(null), 1800)
  }
  return { state, copy }
}

interface Channel {
  id: string
  icon: ReactNode
  /** What the row says, e.g. "Email me". The address itself is not printed. */
  text: string
  /** Where the row leads. Null when the channel has no public link (a WhatsApp username). */
  href: string | null
  external?: boolean
  /** The real value: copied by the button and exposed as the link's tooltip. */
  value: string
  copyLabel: string
}

/**
 * The close: the invitation, the two fastest ways to answer it, then every direct channel as a
 * row with its icon, a plain-language link and a copy button, beside the message form.
 */
export function Contact() {
  const { t } = useLanguage()
  const { state, copy } = useCopy()
  const whatsappUrl = profile.whatsapp ? `https://wa.me/${profile.whatsapp.replace(/\D/g, '')}` : null

  const channels: Channel[] = [{ id: 'email', icon: <Mail className="size-5" strokeWidth={1.7} aria-hidden="true" />, text: t('contact.email'), href: `mailto:${profile.email}`, value: profile.email, copyLabel: t('contact.copyEmail') }]
  if (profile.telegram) {
    channels.push({ id: 'telegram', icon: <BrandIcon id="telegram" className="size-5" />, text: t('contact.telegram'), href: profile.telegram, external: true, value: profile.telegram, copyLabel: t('contact.copyTelegram') })
  }
  if (profile.whatsappUsername || profile.whatsapp) {
    channels.push({ id: 'whatsapp', icon: <BrandIcon id="whatsapp" className="size-5" />, text: t('contact.whatsappMe'), href: whatsappUrl, external: true, value: profile.whatsappUsername ?? profile.whatsapp ?? '', copyLabel: t('contact.copyHandle') })
  }
  if (profile.phone) {
    channels.push({ id: 'phone', icon: <Phone className="size-5" strokeWidth={1.7} aria-hidden="true" />, text: t('contact.callMe'), href: `tel:${profile.phone.tel}`, value: profile.phone.tel, copyLabel: t('contact.copyPhone') })
  }

  return (
    <section id="contact" className="sec themed sec-pad scroll-mt-4" aria-labelledby="contact-title">
      <div className="shell">
        <p className="t-eyebrow">{t('contact.eyebrow')}</p>
        <h2 id="contact-title" className="t-hero mt-6 max-w-[18ch] text-balance text-text">
          <RiseText text={t('contact.title')} />
        </h2>

        <Reveal delay={0.15} className="mt-8 flex flex-wrap items-end justify-between gap-x-12 gap-y-8">
          <p className="t-lead max-w-[42ch] text-pretty text-text-2">{t('contact.subtitle')}</p>
          <div className="flex flex-wrap items-center gap-3">
            <Magnetic>
              <a href={`mailto:${profile.email}`} className="btn btn-primary btn-lg">
                {t('contact.email')}
                <ArrowUpRight className="size-5 rtl:-scale-x-100" aria-hidden="true" />
              </a>
            </Magnetic>
            {profile.telegram && (
              <a href={profile.telegram} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-lg">
                <BrandIcon id="telegram" className="size-4" />
                {t('contact.telegram')}
              </a>
            )}
          </div>
        </Reveal>

        <div className="mt-16 grid grid-cols-1 gap-x-16 gap-y-14 lg:mt-24 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <h3 className="t-caption font-semibold text-text-2">{t('contact.direct')}</h3>
            <ul className="mt-5 flex flex-col gap-3">
              {channels.map((c) => {
                const copied = state?.id === c.id
                const body = (
                  <>
                    <span className="grid size-11 shrink-0 place-items-center rounded-full bg-accent/12 text-accent transition-colors duration-300 group-hover:bg-accent group-hover:text-on-accent">{c.icon}</span>
                    <span className="t-title min-w-0 grow truncate !text-[1.125rem] text-text sm:!text-[1.25rem]">{c.text}</span>
                    {c.href && <ArrowUpRight className="size-5 shrink-0 text-text-2 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5" aria-hidden="true" />}
                  </>
                )
                const main = 'group flex min-w-0 grow items-center gap-4 rounded-full p-2.5'
                return (
                  <li key={c.id} className="themed flex items-center gap-1 rounded-plate border border-hairline bg-surface p-1.5 transition-colors duration-300 hover:border-accent/50">
                    {c.href ? (
                      <a href={c.href} title={c.value} {...(c.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} className={main}>
                        {body}
                      </a>
                    ) : (
                      <div className={main}>{body}</div>
                    )}
                    <button
                      type="button"
                      onClick={() => void copy(c.id, c.value)}
                      aria-label={c.copyLabel}
                      title={c.copyLabel}
                      className="me-1.5 inline-flex h-11 shrink-0 cursor-pointer items-center gap-2 rounded-full border border-hairline px-3 text-text-2 transition-colors duration-200 hover:border-text hover:text-text active:scale-95"
                    >
                      {copied && state.ok ? <Check className="size-4 text-accent" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
                      <span className="sr-only" aria-live="polite">
                        {copied ? (state.ok ? t('contact.copied') : t('contact.copyFailed')) : ''}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </Reveal>

          <Reveal delay={0.1} className="lg:col-span-7">
            <ContactForm />
          </Reveal>
        </div>
      </div>
    </section>
  )
}
