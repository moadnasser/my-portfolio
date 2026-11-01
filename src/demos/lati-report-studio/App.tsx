import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  EyeOff,
  FileSpreadsheet,
  FileText,
  Folder,
  FolderOpen,
  Image as ImageIcon,
  Award,
  ClipboardList,
  Presentation,
  UploadCloud,
} from 'lucide-react'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useLanguage, useLocalized } from '../../i18n/context'
import { useTheme } from '../../theme/context'
import { useDemo } from '../kit/DemoContext'
import { useFormat } from '../kit/format'
import { press } from '../kit/mobile'
import { useDemoStrings } from '../kit/strings'
import ar from './ar.json'
import { companies, defaults, sampleFolder, scores, survey, trainees, type FolderFile } from './data'
import en from './en.json'

type T = ReturnType<typeof useDemoStrings>
type StepId = 'general' | 'imports' | 'content' | 'review' | 'export'
type PageId = 'cover' | 'info' | 'overview' | 'attendance' | 'grades' | 'survey' | 'closing'
const STEPS: StepId[] = ['general', 'imports', 'content', 'review', 'export']
const PAGES: PageId[] = ['cover', 'info', 'overview', 'attendance', 'grades', 'survey', 'closing']
const kindIcon = { grades: FileSpreadsheet, attendance: ClipboardList, survey: FileSpreadsheet, content: FileText, photos: ImageIcon, certificates: Award }

interface Course {
  title: string
  trainer: string
  city: 'tripoli' | 'benghazi'
  start: string
  objectives: string
  axes: string
}

/** Next five working days from a start date, skipping Friday and Saturday like the real report. */
function sessionDates(start: string) {
  const out: Date[] = []
  const d = new Date(`${start}T12:00:00`)
  while (out.length < 5) {
    if (d.getDay() !== 5 && d.getDay() !== 6) out.push(new Date(d))
    d.setDate(d.getDate() + 1)
  }
  return out
}

export default function LatiApp() {
  const t = useDemoStrings(en, ar)
  const pick = useLocalized()
  const { lang } = useLanguage()
  const { theme } = useTheme()
  const { complete } = useDemo()
  const [step, setStep] = useState<StepId>('general')
  const [loaded, setLoaded] = useState(false)
  const [course, setCourse] = useState<Course>(() => {
    const d = new Date()
    d.setDate(d.getDate() + ((7 - d.getDay()) % 7 || 7)) // next Sunday
    return { title: '', trainer: '', city: 'tripoli', start: d.toISOString().slice(0, 10), objectives: '', axes: '' }
  })
  // Localised defaults stay live until the visitor types their own value.
  const c: Course = {
    ...course,
    title: course.title || pick(defaults.title),
    trainer: course.trainer || pick(defaults.trainer),
    objectives: course.objectives || pick(defaults.objectives),
    axes: course.axes || pick(defaults.axes),
  }
  const idx = STEPS.indexOf(step)
  const canNext = step !== 'imports' || loaded

  const go = (s: StepId) => setStep(s)
  const vars = { '--app-primary': theme === 'dark' ? '#5FA8D6' : '#0D5A8F', '--on-app-primary': theme === 'dark' ? '#06202f' : '#ffffff' } as React.CSSProperties

  const body: Record<StepId, ReactNode> = {
    general: (
      <General
        t={t}
        c={c}
        set={(patch) => {
          setCourse((x) => ({ ...x, ...patch }))
          if ('title' in patch) complete('edit')
        }}
      />
    ),
    imports: (
      <Imports
        t={t}
        loaded={loaded}
        onLoaded={() => {
          setLoaded(true)
          complete('folder')
        }}
        onContinue={() => go('content')}
      />
    ),
    content: <Content t={t} c={c} set={(patch) => setCourse((x) => ({ ...x, ...patch }))} />,
    review: <Review t={t} c={c} onCompany={() => complete('review')} />,
    export: <Export t={t} c={c} onDone={() => complete('export')} />,
  }

  return (
    <div className="@container relative flex min-h-0 min-w-0 flex-1 overflow-hidden bg-bg text-text" style={vars} lang={lang}>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col @4xl:flex-row">
        {/* Dark rail with the vertical stepper on wide screens */}
        <aside className="hidden w-72 shrink-0 flex-col bg-[#171D2C] p-5 text-white @4xl:flex">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-white/10">
              <Presentation className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="font-semibold">{t('brand')}</p>
              <p className="font-sans text-xs text-white/55">LATI</p>
            </div>
          </div>
          <ol className="mt-8 flex flex-col gap-1">
            {STEPS.map((s, i) => {
              const done = i < idx
              const on = s === step
              const locked = i > 1 && !loaded
              return (
                <li key={s}>
                  <button
                    type="button"
                    disabled={locked}
                    onClick={() => go(s)}
                    aria-current={on ? 'step' : undefined}
                    className={`flex w-full gap-3 rounded-xl p-3 text-start transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${on ? 'bg-white/10' : 'hover:bg-white/5'}`}
                  >
                    <span className={`grid size-7 shrink-0 place-items-center rounded-full font-sans text-xs font-bold ${done ? 'bg-[#5FA8D6] text-[#06202f]' : on ? 'bg-white text-[#171D2C]' : 'border border-white/25 text-white/70'}`}>
                      {done ? <Check className="size-3.5" strokeWidth={3} aria-hidden="true" /> : i + 1}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">{t(`steps.${s}.t`)}</span>
                      <span className="mt-0.5 block text-xs leading-snug text-white/55">{t(`steps.${s}.d`)}</span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ol>
          <p className="mt-auto text-xs leading-relaxed text-white/45">{t('org')}</p>
        </aside>

        {/* Compact progress on narrow screens */}
        <header className="shrink-0 border-b border-border bg-surface px-4 pt-3 pb-3 @4xl:hidden">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold">{t(`steps.${step}.t`)}</p>
            <p className="text-xs text-text-2">{t('stepOf', { n: idx + 1, total: STEPS.length })}</p>
          </div>
          <div className="mt-2.5 flex gap-1" aria-hidden="true">
            {STEPS.map((s, i) => (
              <span key={s} className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${i <= idx ? 'bg-[var(--app-primary)]' : 'bg-surface-2'}`} />
            ))}
          </div>
        </header>

        <main className="relative flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} className="mx-auto w-full max-w-5xl px-4 py-5 @2xl:px-8 @4xl:py-8">
                <div className="mb-5 hidden @4xl:block">
                  <h1 className="text-2xl font-bold">{t(`steps.${step}.t`)}</h1>
                  <p className="mt-1 text-sm text-text-2">{t(`steps.${step}.d`)}</p>
                </div>
                <p className="mb-5 text-sm text-text-2 @4xl:hidden">{t(`steps.${step}.d`)}</p>
                {body[step]}
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="flex shrink-0 items-center justify-between gap-3 border-t border-border bg-surface px-4 pt-3 pb-[max(0.75rem,var(--safe-bottom,env(safe-area-inset-bottom)))] @2xl:px-8">
            <button type="button" onClick={() => go(STEPS[idx - 1])} disabled={idx === 0} className={`inline-flex h-11 items-center gap-1.5 rounded-xl px-4 text-sm font-semibold text-text-2 hover:bg-surface-2 disabled:invisible ${press}`}>
              <ChevronLeft className="size-4 rtl:-scale-x-100" aria-hidden="true" />
              {t('back')}
            </button>
            {!canNext && <p className="truncate text-xs text-text-2">{t('imports.needFolder')}</p>}
            <button
              type="button"
              onClick={() => go(STEPS[idx + 1])}
              disabled={idx === STEPS.length - 1 || !canNext}
              className={`inline-flex h-11 items-center gap-1.5 rounded-xl bg-[var(--app-primary)] px-5 text-sm font-semibold text-[var(--on-app-primary)] disabled:opacity-40 ${idx === STEPS.length - 1 ? 'invisible' : ''} ${press}`}
            >
              {t('next')}
              <ChevronRight className="size-4 rtl:-scale-x-100" aria-hidden="true" />
            </button>
          </div>
        </main>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ steps */

const panel = 'rounded-2xl border border-border bg-surface'
const input = 'h-12 w-full rounded-xl border border-border bg-surface px-3 text-[16px] outline-none focus:border-[var(--app-primary)]'

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </label>
  )
}

function General({ t, c, set }: { t: T; c: Course; set: (p: Partial<Course>) => void }) {
  const f = useFormat()
  const dates = sessionDates(c.start)
  return (
    <div className="grid gap-5 @4xl:grid-cols-[1fr_18rem] @4xl:items-start">
      <div className={`${panel} grid gap-4 p-4 @2xl:grid-cols-2 @2xl:p-5`}>
        <div className="@2xl:col-span-2">
          <Field label={t('general.title')}>
            <input className={input} value={c.title} onChange={(e) => set({ title: e.target.value })} />
          </Field>
        </div>
        <Field label={t('general.trainer')}>
          <input className={input} value={c.trainer} onChange={(e) => set({ trainer: e.target.value })} />
        </Field>
        <Field label={t('general.city')}>
          <select className={input} value={c.city} onChange={(e) => set({ city: e.target.value as Course['city'] })}>
            <option value="tripoli">{t('general.cities.tripoli')}</option>
            <option value="benghazi">{t('general.cities.benghazi')}</option>
          </select>
        </Field>
        <Field label={t('general.start')}>
          <input type="date" className={input} value={c.start} onChange={(e) => e.target.value && set({ start: e.target.value })} />
        </Field>
        <Field label={t('general.time')}>
          <input className={`${input} font-sans`} value="09:00 – 14:00" readOnly dir="ltr" />
        </Field>
      </div>
      <div className={`${panel} p-4`}>
        <p className="text-sm font-semibold">{t('general.days')}</p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {dates.map((d) => (
            <li key={d.toISOString()} className="rounded-lg bg-surface-2 px-2.5 py-1.5 text-xs font-medium">
              {f.date(d, { weekday: 'short', day: 'numeric', month: 'short' })}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-text-2">
          {t('general.hours', { n: dates.length * 5 })} · {t('general.trainees', { n: trainees.length })}
        </p>
      </div>
    </div>
  )
}

function Imports({ t, loaded, onLoaded, onContinue }: { t: T; loaded: boolean; onLoaded: () => void; onContinue: () => void }) {
  const reduce = useReducedMotion()
  const [reading, setReading] = useState<number>(loaded ? sampleFolder.length : -1)
  const [over, setOver] = useState(false)

  useEffect(() => {
    if (reading < 0 || reading >= sampleFolder.length) return
    const id = window.setTimeout(() => {
      const next = reading + 1
      setReading(next)
      if (next === sampleFolder.length) onLoaded()
    }, reduce ? 60 : 380)
    return () => window.clearTimeout(id)
  }, [reading, reduce, onLoaded])

  const start = () => reading < 0 && setReading(0)

  return (
    <div className="flex flex-col gap-4">
      {reading < 0 ? (
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setOver(true)
          }}
          onDragLeave={() => setOver(false)}
          onDrop={(e) => {
            e.preventDefault()
            setOver(false)
            start()
          }}
          className={`flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-colors ${over ? 'border-[var(--app-primary)] bg-[var(--app-primary)]/8' : 'border-border bg-surface'}`}
        >
          <span className="grid size-16 place-items-center rounded-2xl bg-[var(--app-primary)]/10 text-[var(--app-primary)]">
            <UploadCloud className="size-8" aria-hidden="true" />
          </span>
          <p className="text-lg font-semibold">{t('imports.drop')}</p>
          <p className="text-sm text-text-2">{t('imports.or')}</p>
          <button type="button" onClick={start} className={`inline-flex h-12 items-center gap-2 rounded-xl bg-[var(--app-primary)] px-5 text-sm font-semibold text-[var(--on-app-primary)] ${press}`}>
            <FolderOpen className="size-4.5" aria-hidden="true" />
            {t('imports.sample')}
          </button>
          <p className="max-w-sm text-xs text-text-2">{t('imports.dropNote')}</p>
        </div>
      ) : (
        <div className={`${panel} p-4`}>
          <p className="flex items-center gap-2 text-sm font-semibold">
            <Folder className="size-4.5 text-[var(--app-primary)]" aria-hidden="true" />
            <span className="font-sans">Course-2026-08/</span>
          </p>
          <ul className="mt-3 flex flex-col gap-2" aria-live="polite">
            {sampleFolder.map((file, i) => (
              <FileRow key={file.path} t={t} file={file} state={i < reading ? 'ready' : i === reading ? 'reading' : 'waiting'} />
            ))}
          </ul>
          {reading >= sampleFolder.length && (
            <motion.div initial={reduce ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-4 flex flex-col gap-3 rounded-xl bg-[var(--app-primary)]/10 p-3 @lg:flex-row @lg:items-center">
              <p className="flex-1 text-sm font-medium text-[var(--app-primary)]">{t('imports.applied')}</p>
              <button type="button" onClick={onContinue} className={`h-11 rounded-xl bg-[var(--app-primary)] px-4 text-sm font-semibold text-[var(--on-app-primary)] ${press}`}>
                {t('next')}
              </button>
            </motion.div>
          )}
        </div>
      )}
    </div>
  )
}

function FileRow({ t, file, state }: { t: T; file: FolderFile; state: 'ready' | 'reading' | 'waiting' }) {
  const Icon = kindIcon[file.kind]
  return (
    <li className={`flex items-center gap-3 rounded-xl bg-surface-2 p-3 transition-opacity ${state === 'waiting' ? 'opacity-45' : ''}`}>
      <Icon className="size-5 shrink-0 text-text-2" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="truncate font-sans text-sm font-medium" dir="auto">
          {file.path}
        </p>
        <p className="text-xs text-text-2">{t(`imports.kinds.${file.kind}`)}</p>
      </div>
      {state === 'reading' && (
        <span className="flex items-center gap-2 text-xs text-text-2">
          <span className="size-3.5 animate-spin rounded-full border-2 border-[var(--app-primary)]/30 border-t-[var(--app-primary)] motion-reduce:animate-none" aria-hidden="true" />
          {t('imports.reading')}
        </span>
      )}
      {state === 'ready' && (
        <span className="flex items-center gap-1 rounded-full bg-emerald-500/12 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
          <Check className="size-3.5" aria-hidden="true" />
          {t('imports.ready')}
        </span>
      )}
    </li>
  )
}

function Content({ t, c, set }: { t: T; c: Course; set: (p: Partial<Course>) => void }) {
  return (
    <div className="grid gap-4 @3xl:grid-cols-2">
      {(['objectives', 'axes'] as const).map((k) => (
        <label key={k} className={`${panel} flex flex-col gap-2 p-4`}>
          <span className="text-sm font-semibold">{t(`content.${k}`)}</span>
          <textarea rows={7} value={c[k]} onChange={(e) => set({ [k]: e.target.value })} className="resize-none rounded-xl border border-border bg-surface p-3 text-[16px] leading-relaxed outline-none focus:border-[var(--app-primary)]" />
          <span className="text-xs text-text-2">{t('content.hint')}</span>
        </label>
      ))}
    </div>
  )
}

function Review({ t, c, onCompany }: { t: T; c: Course; onCompany: () => void }) {
  const pick = useLocalized()
  const [company, setCompany] = useState<'a' | 'b'>('a')
  const [hidden, setHidden] = useState<PageId[]>([])
  return (
    <div className="flex flex-col gap-4">
      <div role="radiogroup" aria-label={t('review.company')} className="flex flex-wrap gap-2">
        {(['a', 'b'] as const).map((k) => (
          <button
            key={k}
            type="button"
            role="radio"
            aria-checked={company === k}
            onClick={() => {
              setCompany(k)
              if (k !== 'a') onCompany()
            }}
            className={`h-11 rounded-full border px-4 text-sm font-semibold ${press} ${company === k ? 'border-transparent bg-[var(--app-primary)] text-[var(--on-app-primary)]' : 'border-border bg-surface'}`}
          >
            {pick(companies[k])}
          </button>
        ))}
      </div>
      <ul className="grid gap-4 @3xl:grid-cols-2 @5xl:grid-cols-3">
        {PAGES.map((p) => {
          const off = hidden.includes(p)
          return (
            <li key={p} className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold">{t(`review.names.${p}`)}</span>
                <button
                  type="button"
                  onClick={() => setHidden((h) => (off ? h.filter((x) => x !== p) : [...h, p]))}
                  aria-pressed={off}
                  aria-label={off ? t('review.show') : t('review.hide')}
                  className={`grid size-11 place-items-center rounded-full text-text-2 hover:bg-surface-2 ${press}`}
                >
                  {off ? <EyeOff className="size-4.5" aria-hidden="true" /> : <Eye className="size-4.5" aria-hidden="true" />}
                </button>
              </div>
              <div className={`relative transition-opacity ${off ? 'opacity-35' : ''}`}>
                <ReportPage t={t} page={p} c={c} company={company} />
                {off && <span className="absolute inset-x-4 top-1/2 -translate-y-1/2 rounded-lg bg-surface px-3 py-2 text-center text-xs font-semibold shadow">{t('review.hidden')}</span>}
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/* ------------------------------------------------------------------ report pages */

const INK = '#1C2B4D'

function ReportPage({ t, page, c, company }: { t: T; page: PageId; c: Course; company: 'a' | 'b' }) {
  const pick = useLocalized()
  const f = useFormat()
  const list = trainees.filter((x) => x.company === company)
  const dates = sessionDates(c.start)
  const lines = (s: string) => s.split('\n').map((x) => x.trim()).filter(Boolean)

  let inner: ReactNode = null
  if (page === 'cover')
    inner = (
      <div className="flex h-full flex-col items-center justify-center gap-[3cqw] text-center">
        <span className="grid size-[16cqw] place-items-center rounded-[3cqw] text-white" style={{ background: INK }}>
          <Presentation className="size-[8cqw]" aria-hidden="true" />
        </span>
        <p className="text-[3cqw] font-medium opacity-70">{t('org')}</p>
        <p className="text-[7cqw] leading-tight font-bold" style={{ color: INK }}>
          {t('report.final')}
        </p>
        <p className="text-[4.4cqw] font-semibold">{c.title}</p>
        <p className="mt-[2cqw] rounded-full px-[3cqw] py-[1cqw] text-[3cqw] text-white" style={{ background: INK }}>
          {t('report.for', { company: pick(companies[company]) })}
        </p>
      </div>
    )
  if (page === 'info')
    inner = (
      <>
        <PageTitle>{t('review.names.info')}</PageTitle>
        <div className="grid grid-cols-2 gap-[2cqw]">
          {[
            [t('report.trainer'), c.trainer],
            [t('report.place'), t(`general.cities.${c.city}`)],
            [t('report.days'), t('report.daysValue', { n: dates.length })],
            [t('report.time'), '09:00 – 14:00'],
            [t('report.hours'), t('general.hours', { n: dates.length * 5 })],
            [t('report.date'), `${f.date(dates[0])} – ${f.date(dates[dates.length - 1])}`],
            [t('report.trainees'), t('general.trainees', { n: list.length })],
          ].map(([k, v]) => (
            <div key={k} className="rounded-[1.5cqw] border p-[2cqw]" style={{ borderColor: `${INK}33` }}>
              <p className="text-[2.4cqw] opacity-60">{k}</p>
              <p className="text-[3cqw] font-semibold">{v}</p>
            </div>
          ))}
        </div>
      </>
    )
  if (page === 'overview')
    inner = (
      <>
        <PageTitle>{t('report.objectives')}</PageTitle>
        <ul className="flex flex-col gap-[1.2cqw] text-[2.8cqw]">
          {lines(c.objectives).map((l) => (
            <li key={l} className="flex gap-[1.5cqw]">
              <span style={{ color: INK }}>◆</span>
              {l}
            </li>
          ))}
        </ul>
        <PageTitle>{t('report.axes')}</PageTitle>
        <ul className="grid grid-cols-2 gap-[1.2cqw] text-[2.6cqw]">
          {lines(c.axes).map((l) => (
            <li key={l} className="rounded-[1cqw] px-[1.5cqw] py-[1cqw]" style={{ background: `${INK}0f` }}>
              {l}
            </li>
          ))}
        </ul>
      </>
    )
  if (page === 'attendance')
    inner = (
      <>
        <PageTitle>{t('review.names.attendance')}</PageTitle>
        <Table
          head={[t('report.no'), t('report.name'), ...dates.map((_, i) => t('report.day', { n: i + 1 }))]}
          rows={list.map((x, i) => [String(i + 1), pick(x.name), ...x.sessions.map((s, si) => (s === 'A' || s === 'E' ? <span key={si} className="font-semibold" style={{ color: INK }}>{t('report.absent')}</span> : s === 'L' ? '09:20' : '09:00'))])}
        />
      </>
    )
  if (page === 'grades')
    inner = (
      <>
        <PageTitle>{t('review.names.grades')}</PageTitle>
        <Table
          head={[t('report.no'), t('report.name'), t('report.pre'), t('report.att'), t('report.part'), t('report.post'), t('report.total')]}
          rows={list.map((x, i) => {
            const s = scores(x)
            return [String(i + 1), pick(x.name), String(x.pre), String(s.attendance), String(x.participation), String(x.post), <strong key="total">{s.total}</strong>]
          })}
        />
        <p className="mt-[2cqw] text-[2.3cqw] opacity-70">{t('report.rule')}</p>
      </>
    )
  if (page === 'survey')
    inner = (
      <>
        <PageTitle>{t('review.names.survey')}</PageTitle>
        <ul className="flex flex-col gap-[2.4cqw]">
          {survey.map((s) => (
            <li key={s.key}>
              <div className="flex justify-between text-[2.8cqw]">
                <span>{t(`report.survey.${s.key}`)}</span>
                <span className="font-sans font-semibold">{s.avg.toFixed(1)} / 5</span>
              </div>
              <div className="mt-[0.8cqw] h-[1.8cqw] rounded-full" style={{ background: `${INK}1a` }}>
                <div className="h-full rounded-full" style={{ width: `${(s.avg / 5) * 100}%`, background: INK }} />
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-[3cqw] text-[3cqw] font-semibold">
          {t('report.overall')}: <span className="font-sans">{Math.round((survey.reduce((a, b) => a + b.avg, 0) / survey.length / 5) * 100)}%</span>
        </p>
      </>
    )
  if (page === 'closing')
    inner = (
      <>
        <PageTitle>{t('review.names.closing')}</PageTitle>
        <p className="text-[2.8cqw] leading-relaxed">{t('report.closing')}</p>
        <div className="mt-auto grid grid-cols-3 gap-[2cqw] pt-[6cqw] text-center text-[2.4cqw]">
          {[t('report.prepared'), t('report.reviewed'), t('report.programs')].map((s) => (
            <div key={s}>
              <p className="font-semibold" style={{ color: INK }}>
                {s}
              </p>
              <div className="mx-auto mt-[5cqw] h-px w-4/5" style={{ background: `${INK}66` }} />
            </div>
          ))}
        </div>
      </>
    )

  return (
    <div className="@container aspect-[1/1.414] w-full overflow-hidden rounded-lg bg-white text-[#231F20] shadow-[0_10px_30px_-12px_rgba(0,0,0,0.35)] ring-1 ring-black/5">
      <div className="flex h-full flex-col gap-[2.5cqw] p-[6cqw]">{inner}</div>
    </div>
  )
}

function PageTitle({ children }: { children: ReactNode }) {
  return (
    <p className="border-b-[0.5cqw] pb-[1cqw] text-[4cqw] font-bold" style={{ color: INK, borderColor: INK }}>
      {children}
    </p>
  )
}

function Table({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    <table className="w-full border-collapse text-[2.2cqw]">
      <thead>
        <tr>
          {head.map((h) => (
            <th key={h} className="border border-white/30 px-[0.8cqw] py-[1cqw] font-semibold text-white" style={{ background: INK }}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className={i % 2 ? 'bg-[#1C2B4D0a]' : ''}>
            {r.map((cell, j) => (
              <td key={j} className={`border px-[0.8cqw] py-[1cqw] ${j === 1 ? 'text-start' : 'text-center font-sans'}`} style={{ borderColor: `${INK}26` }}>
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

/* ------------------------------------------------------------------ export */

const EXPORT_STEPS = ['pptx', 'pdf', 'certs', 'save'] as const

function Export({ t, c, onDone }: { t: T; c: Course; onDone: () => void }) {
  const pick = useLocalized()
  const reduce = useReducedMotion()
  const keys = ['a', 'b'] as const
  const total = keys.length * EXPORT_STEPS.length
  const [progress, setProgress] = useState(-1)

  useEffect(() => {
    if (progress < 0 || progress >= total) return
    const id = window.setTimeout(() => {
      setProgress((p) => p + 1)
      if (progress + 1 === total) onDone()
    }, reduce ? 80 : 420)
    return () => window.clearTimeout(id)
  }, [progress, total, reduce, onDone])

  const csv = useMemo(() => {
    const head = [t('report.name'), 'ID', t('review.company'), t('report.pre'), t('report.att'), t('report.part'), t('report.post'), t('report.total')]
    const rows = trainees.map((x) => {
      const s = scores(x)
      return [pick(x.name), x.id, pick(companies[x.company]), x.pre, s.attendance, x.participation, x.post, s.total]
    })
    const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`
    return '﻿' + [head, ...rows].map((r) => r.map(esc).join(',')).join('\r\n')
  }, [t, pick])

  const download = () => {
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `${c.title.replace(/[\\/:*?"<>|]/g, '').trim() || 'grades'} — grades.csv`
    a.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  const done = progress >= total
  return (
    <div className="grid gap-4 @4xl:grid-cols-[1fr_20rem] @4xl:items-start">
      <div className={`${panel} flex flex-col gap-4 p-4 @2xl:p-5`}>
        <div>
          <p className="font-semibold">{t('export.title')}</p>
          <p className="mt-1 text-sm text-text-2">{t('export.desc')}</p>
        </div>
        <ul className="flex flex-col gap-3">
          {keys.map((k, ci) => (
            <li key={k} className="rounded-xl bg-surface-2 p-3">
              <p className="mb-2 text-sm font-semibold">{pick(companies[k])}</p>
              <ol className="grid grid-cols-2 gap-2">
                {EXPORT_STEPS.map((s, si) => {
                  const n = ci * EXPORT_STEPS.length + si
                  const state = progress > n ? 'done' : progress === n ? 'active' : 'idle'
                  return (
                    <li key={s} className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs transition-colors ${state === 'done' ? 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-300' : state === 'active' ? 'bg-[var(--app-primary)]/12 text-[var(--app-primary)]' : 'bg-surface text-text-2'}`}>
                      {state === 'done' ? (
                        <Check className="size-3.5 shrink-0" aria-hidden="true" />
                      ) : state === 'active' ? (
                        <span className="size-3.5 shrink-0 animate-spin rounded-full border-2 border-current/30 border-t-current motion-reduce:animate-none" aria-hidden="true" />
                      ) : (
                        <span className="size-3.5 shrink-0 rounded-full border border-current/40" aria-hidden="true" />
                      )}
                      {t(`export.steps.${s}`)}
                    </li>
                  )
                })}
              </ol>
            </li>
          ))}
        </ul>
        <button type="button" onClick={() => setProgress(0)} disabled={progress >= 0 && !done} className={`inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[var(--app-primary)] px-5 text-sm font-semibold text-[var(--on-app-primary)] disabled:opacity-50 ${press}`}>
          <Presentation className="size-4.5" aria-hidden="true" />
          {t('export.run', { n: keys.length })}
        </button>
        <p className="text-xs text-text-2" aria-live="polite">
          {done ? t('export.done') : t('export.simulated')}
        </p>
      </div>
      <div className="flex flex-col gap-4">
        <div className={`${panel} p-4`} aria-label={t('export.done')}>
          <p className="flex items-center gap-2 text-sm font-semibold">
            <FolderOpen className="size-4.5 text-[var(--app-primary)]" aria-hidden="true" />
            <span className="truncate">{c.title}/</span>
          </p>
          <ul className="mt-2 flex flex-col gap-1.5 ps-6 text-xs">
            {keys.map((k, ci) => {
              const ready = progress >= (ci + 1) * EXPORT_STEPS.length
              return (
                <li key={k} className={ready ? '' : 'opacity-40'}>
                  <p className="flex items-center gap-1.5 font-medium">
                    <Folder className="size-3.5" aria-hidden="true" />
                    {pick(companies[k])}/
                  </p>
                  <p className="flex items-center gap-1.5 ps-5 text-text-2">
                    <Presentation className="size-3.5" aria-hidden="true" />
                    <span className="truncate">{c.title}.pptx</span>
                  </p>
                  <p className="flex items-center gap-1.5 ps-5 text-text-2">
                    <FileText className="size-3.5" aria-hidden="true" />
                    <span className="truncate">{c.title}.pdf</span>
                  </p>
                </li>
              )
            })}
          </ul>
        </div>
        <div className={`${panel} flex flex-col gap-2 p-4`}>
          <button type="button" onClick={download} className={`inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-border px-4 text-sm font-semibold ${press}`}>
            <Download className="size-4.5" aria-hidden="true" />
            {t('export.csv')}
          </button>
          <p className="text-xs text-text-2">{t('export.csvNote')}</p>
        </div>
      </div>
    </div>
  )
}
