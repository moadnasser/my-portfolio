import { animate, stagger } from 'framer-motion'
import { Check } from 'lucide-react'
import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { profile } from '../../data/profile'
import { useLanguage } from '../../i18n/context'
import { MIN_SENDING_MS, SENT_HOLD_MS } from '../../lib/motion'
import { SubmitButton, type SubmitStatus } from './SubmitButton'

type Field = 'name' | 'email' | 'message'

/** Fields are soft rounded wells; the border turns blue on focus and the label sits above in the caption size. */
const field = 'themed mt-2 w-full rounded-[1.5rem] border border-border bg-bg px-5 py-3 text-[1.0625rem] text-text outline-none transition-[border-color,box-shadow] duration-300 placeholder:text-text-2/70 focus:border-accent focus:shadow-[0_0_0_3px_var(--ring)] aria-[invalid=true]:border-danger'

const wait = (ms: number) => new Promise((r) => window.setTimeout(r, ms))

/**
 * Posts to /api/contact.php on the same host (see public/api/contact.php). If the request
 * fails for any reason the visitor is shown the email address instead, so a message is never lost.
 *
 * States: idle → sending → sent | failed. "Sending" stays up for at least MIN_SENDING_MS so the
 * spinner never flashes; "sent" clears the fields and returns to idle after SENT_HOLD_MS or as
 * soon as the visitor types again. One live region announces each change, once.
 */
export function ContactForm() {
  const { t } = useLanguage()
  const id = useId()
  const [status, setStatus] = useState<SubmitStatus>('idle')
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({})
  const fields = useRef<HTMLDivElement>(null)
  const hold = useRef<number | undefined>(undefined)
  const sending = useRef(false)
  const alive = useRef(true)

  useEffect(() => {
    alive.current = true
    return () => {
      alive.current = false
      window.clearTimeout(hold.current)
    }
  }, [])

  const backToIdle = () => {
    window.clearTimeout(hold.current)
    setStatus((s) => (s === 'sent' || s === 'failed' ? 'idle' : s))
  }

  /** Fade the inputs out one after another, empty the form while they are invisible, bring them back. */
  const clearFields = async (form: HTMLFormElement) => {
    const inputs = Array.from(fields.current?.querySelectorAll<HTMLElement>('[data-field]') ?? [])
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (inputs.length && !reduce) await animate(inputs, { opacity: 0 }, { duration: 0.2, delay: stagger(0.05) })
    form.reset()
    if (inputs.length && !reduce) void animate(inputs, { opacity: 1 }, { duration: 0.3, delay: stagger(0.05) })
  }

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (sending.current) return
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

    sending.current = true
    window.clearTimeout(hold.current)
    setStatus('sending')
    const started = performance.now()
    let ok = false
    try {
      const res = await fetch('/api/contact.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      const body = (await res.json()) as { ok?: boolean }
      ok = res.ok && Boolean(body.ok)
    } catch {
      ok = false
    }
    const shown = performance.now() - started
    if (shown < MIN_SENDING_MS) await wait(MIN_SENDING_MS - shown)
    sending.current = false
    if (!alive.current) return
    if (ok) {
      setStatus('sent')
      void clearFields(form)
      hold.current = window.setTimeout(() => setStatus((s) => (s === 'sent' ? 'idle' : s)), SENT_HOLD_MS)
    } else {
      setStatus('failed')
    }
  }

  const describe = (f: Field) => (errors[f] ? { 'aria-invalid': true, 'aria-describedby': `${id}-${f}-error` } : {})
  const error = (f: Field) =>
    errors[f] && (
      <p id={`${id}-${f}-error`} className="t-caption mt-1.5 ps-2 text-danger">
        {errors[f]}
      </p>
    )

  return (
    <form onSubmit={submit} onInput={backToIdle} noValidate className="themed relative rounded-plate border border-hairline bg-surface p-6 text-start sm:p-10 lg:p-12" aria-labelledby={`${id}-title`}>
      <h3 id={`${id}-title`} className="t-title text-text">
        {t('form.title')}
      </h3>
      <div ref={fields} className="mt-8 grid gap-x-8 gap-y-7 sm:grid-cols-2">
        <div data-field>
          <label htmlFor={`${id}-name`} className="t-caption block ps-2 text-text-2">
            {t('form.name')}
          </label>
          <input id={`${id}-name`} name="name" autoComplete="name" maxLength={100} className={field} {...describe('name')} />
          {error('name')}
        </div>
        <div data-field>
          <label htmlFor={`${id}-email`} className="t-caption block ps-2 text-text-2">
            {t('form.email')}
          </label>
          <input id={`${id}-email`} name="email" type="email" inputMode="email" autoComplete="email" maxLength={200} dir="ltr" className={`${field} latin rtl:text-right`} {...describe('email')} />
          {error('email')}
        </div>
        <div data-field className="sm:col-span-2">
          <label htmlFor={`${id}-message`} className="t-caption block ps-2 text-text-2">
            {t('form.message')}
          </label>
          <textarea id={`${id}-message`} name="message" rows={4} maxLength={5000} className={`${field} resize-y`} {...describe('message')} />
          {error('message')}
        </div>
        {/* Honeypot: hidden from people and assistive tech, irresistible to bots. */}
        <input name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="pointer-events-none absolute start-0 top-0 size-px opacity-0 [clip-path:inset(50%)]" />
      </div>

      <div className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-3">
        <SubmitButton status={status} />
        <p role="status" aria-live="polite" className="t-caption min-w-0 text-text-2">
          {status === 'sending' && <span className="sr-only">{t('form.sending')}</span>}
          {status === 'sent' && (
            <span className="inline-flex items-center gap-1.5 text-[color:var(--success)]">
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
