import { ArrowUp, Check } from 'lucide-react'
import { useId, useState, type FormEvent } from 'react'
import { profile } from '../../data/profile'
import { useLanguage } from '../../i18n/context'

type Status = 'idle' | 'sending' | 'sent' | 'failed'
type Field = 'name' | 'email' | 'message'

const field = 'themed w-full rounded-[0.875rem] border border-hairline bg-surface px-4 py-3 text-[17px] text-text outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-text-2/70 focus:border-accent focus:shadow-[0_0_0_3px_var(--ring)] aria-[invalid=true]:border-[#c4281c]'

/**
 * Posts to /api/contact.php on the same host (see public/api/contact.php). If the request
 * fails for any reason the visitor is shown the email address instead, so a message is never lost.
 */
export function ContactForm() {
  const { t } = useLanguage()
  const id = useId()
  const [status, setStatus] = useState<Status>('idle')
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({})

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form)) as Record<Field | 'company', string>
    const next: Partial<Record<Field, string>> = {}
    if (!data.name.trim()) next.name = t('form.required')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) next.email = t('form.invalidEmail')
    if (data.message.trim().length < 10) next.message = t('form.tooShort')
    setErrors(next)
    const first = (['name', 'email', 'message'] as const).find((f) => next[f])
    if (first) {
      form.querySelector<HTMLElement>(`[name="${first}"]`)?.focus()
      return
    }

    setStatus('sending')
    try {
      const res = await fetch('/api/contact.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      const body = (await res.json()) as { ok?: boolean }
      if (!res.ok || !body.ok) throw new Error('rejected')
      form.reset()
      setStatus('sent')
    } catch {
      setStatus('failed')
    }
  }

  const describe = (f: Field) => (errors[f] ? { 'aria-invalid': true, 'aria-describedby': `${id}-${f}-error` } : {})
  const error = (f: Field) =>
    errors[f] && (
      <p id={`${id}-${f}-error`} className="t-caption mt-1.5 text-[#c4281c] dark:text-[#ff8a80]">
        {errors[f]}
      </p>
    )

  return (
    <form onSubmit={submit} noValidate className="bento bento-soft themed mx-auto mt-16 max-w-3xl p-6 text-start sm:p-10" aria-labelledby={`${id}-title`}>
      <h3 id={`${id}-title`} className="t-title text-text">
        {t('form.title')}
      </h3>
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor={`${id}-name`} className="t-caption mb-1.5 block font-semibold text-text-2">
            {t('form.name')}
          </label>
          <input id={`${id}-name`} name="name" autoComplete="name" maxLength={100} className={field} {...describe('name')} />
          {error('name')}
        </div>
        <div>
          <label htmlFor={`${id}-email`} className="t-caption mb-1.5 block font-semibold text-text-2">
            {t('form.email')}
          </label>
          <input id={`${id}-email`} name="email" type="email" inputMode="email" autoComplete="email" maxLength={200} dir="ltr" className={`${field} latin rtl:text-right`} {...describe('email')} />
          {error('email')}
        </div>
        <div className="sm:col-span-2">
          <label htmlFor={`${id}-message`} className="t-caption mb-1.5 block font-semibold text-text-2">
            {t('form.message')}
          </label>
          <textarea id={`${id}-message`} name="message" rows={5} maxLength={5000} className={`${field} resize-y`} {...describe('message')} />
          {error('message')}
        </div>
        {/* Honeypot: hidden from people and assistive tech, irresistible to bots. */}
        <input name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] size-px opacity-0" />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
        <button type="submit" disabled={status === 'sending'} className="btn-primary inline-flex h-11 cursor-pointer items-center gap-2 rounded-full px-[22px] text-[17px] active:scale-95 disabled:opacity-60">
          {status === 'sending' ? t('form.sending') : t('form.send')}
          <ArrowUp className="size-4" aria-hidden="true" />
        </button>
        <p role="status" aria-live="polite" className="t-caption min-w-0 text-text-2">
          {status === 'sent' && (
            <span className="inline-flex items-center gap-1.5 text-accent">
              <Check className="size-4" aria-hidden="true" />
              {t('form.sent')}
            </span>
          )}
          {status === 'failed' && (
            <>
              {t('form.failed')}{' '}
              <a href={`mailto:${profile.email}`} className="latin text-accent underline">
                {profile.email}
              </a>
            </>
          )}
        </p>
      </div>
    </form>
  )
}
