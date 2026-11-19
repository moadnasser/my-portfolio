import { ArrowUp, Check } from 'lucide-react'
import { useId, useState, type FormEvent } from 'react'
import { profile } from '../../data/profile'
import { useLanguage } from '../../i18n/context'

type Status = 'idle' | 'sending' | 'sent' | 'failed'
type Field = 'name' | 'email' | 'message'

/** Fields are a single ruled line that turns blue on focus; the label sits above in the caption size. */
const field = 'themed w-full rounded-none border-0 border-b border-border bg-transparent px-0 py-3 text-[1.125rem] text-text outline-none transition-[border-color,box-shadow] duration-300 placeholder:text-text-2/70 focus:border-accent focus:shadow-[0_1px_0_0_var(--accent)] aria-[invalid=true]:border-danger'

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
      <p id={`${id}-${f}-error`} className="t-caption mt-1.5 text-danger">
        {errors[f]}
      </p>
    )

  return (
    <form onSubmit={submit} noValidate className="themed relative rounded-plate border border-hairline bg-surface p-6 text-start sm:p-10 lg:p-12" aria-labelledby={`${id}-title`}>
      <h3 id={`${id}-title`} className="t-title text-text">
        {t('form.title')}
      </h3>
      <div className="mt-8 grid gap-x-8 gap-y-7 sm:grid-cols-2">
        <div>
          <label htmlFor={`${id}-name`} className="t-caption block text-text-2">
            {t('form.name')}
          </label>
          <input id={`${id}-name`} name="name" autoComplete="name" maxLength={100} className={field} {...describe('name')} />
          {error('name')}
        </div>
        <div>
          <label htmlFor={`${id}-email`} className="t-caption block text-text-2">
            {t('form.email')}
          </label>
          <input id={`${id}-email`} name="email" type="email" inputMode="email" autoComplete="email" maxLength={200} dir="ltr" className={`${field} latin rtl:text-right`} {...describe('email')} />
          {error('email')}
        </div>
        <div className="sm:col-span-2">
          <label htmlFor={`${id}-message`} className="t-caption block text-text-2">
            {t('form.message')}
          </label>
          <textarea id={`${id}-message`} name="message" rows={4} maxLength={5000} className={`${field} resize-y`} {...describe('message')} />
          {error('message')}
        </div>
        {/* Honeypot: hidden from people and assistive tech, irresistible to bots. */}
        <input name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="pointer-events-none absolute start-0 top-0 size-px opacity-0 [clip-path:inset(50%)]" />
      </div>

      <div className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-3">
        <button type="submit" disabled={status === 'sending'} className="btn btn-primary">
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
