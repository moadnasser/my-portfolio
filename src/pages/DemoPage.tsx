import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowLeft, Check, Info, ListChecks, Moon, RotateCcw, Sparkles, Sun, X } from 'lucide-react'
import { Suspense, use, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Link, Navigate, useParams } from 'react-router'
import { visibleProjects } from '../data/projects'
import { DemoContext } from '../demos/kit/DemoContext'
import { BrowserFrame, PhoneFrame } from '../demos/kit/Frames'
import type { DemoDefinition } from '../demos/kit/types'
import { hasDemo, loadDemo } from '../demos/registry'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { useLanguage, useLocalized } from '../i18n/context'
import { useTheme } from '../theme/context'
import { EASE } from '../lib/motion'

/** Frames need room: below this the demo takes over the whole screen with its own mobile layout. */
const FRAMED_QUERY = '(min-width: 768px) and (min-height: 640px)'

export function DemoPage() {
  const { projectId = '' } = useParams()
  const project = visibleProjects.find((p) => p.id === projectId)
  const { setPageTitle } = useLanguage()

  useEffect(() => {
    setPageTitle('demo.meta')
    return () => setPageTitle(null)
  }, [setPageTitle])

  // Immersive page: stop the document itself from scrolling or bouncing behind the app.
  useEffect(() => {
    const root = document.documentElement
    const prev = [root.style.overflow, root.style.overscrollBehavior]
    root.style.overflow = 'hidden'
    root.style.overscrollBehavior = 'none'
    return () => {
      root.style.overflow = prev[0]
      root.style.overscrollBehavior = prev[1]
    }
  }, [])

  if (!project || !hasDemo(project.id)) return <Navigate to={project ? `/projects/${project.id}` : '/projects'} replace />

  return (
    <Suspense fallback={<DemoLoading />}>
      <DemoRunner projectId={project.id} key={project.id} />
    </Suspense>
  )
}

function DemoLoading() {
  const { t } = useLanguage()
  return (
    <div className="grid h-dvh place-items-center bg-bg text-text-2" role="status">
      <div className="flex items-center gap-3 text-sm">
        <span className="size-5 animate-spin rounded-full border-2 border-accent/30 border-t-accent motion-reduce:animate-none" aria-hidden="true" />
        {t('demo.loading')}
      </div>
    </div>
  )
}

function DemoRunner({ projectId }: { projectId: string }) {
  const def = use(loadDemo(projectId))
  const project = visibleProjects.find((p) => p.id === projectId)!
  const framed = useMediaQuery(FRAMED_QUERY)
  const [done, setDone] = useState<string[]>([])
  const [runId, setRunId] = useState(0)
  const [toast, setToast] = useState<string | null>(null)
  const toastTimer = useRef<number | undefined>(undefined)
  const pick = useLocalized()

  const complete = useCallback(
    (taskId: string) => {
      setDone((prev) => {
        if (prev.includes(taskId) || !def.tasks.some((tk) => tk.id === taskId)) return prev
        const task = def.tasks.find((tk) => tk.id === taskId)!
        setToast(pick(task.label))
        window.clearTimeout(toastTimer.current)
        toastTimer.current = window.setTimeout(() => setToast(null), 2600)
        return [...prev, taskId]
      })
    },
    [def.tasks, pick],
  )

  useEffect(() => () => window.clearTimeout(toastTimer.current), [])

  const reset = useCallback(() => {
    setDone([])
    setToast(null)
    setRunId((n) => n + 1)
  }, [])

  const ctx = useMemo(() => ({ complete, fullscreen: !framed }), [complete, framed])
  const app = (
    <DemoContext.Provider value={ctx}>
      <def.App key={runId} />
    </DemoContext.Provider>
  )

  const shared = { def, title: pick(project.title), projectId, done, reset, toast }
  return framed ? <FramedLayout {...shared}>{app}</FramedLayout> : <FullscreenLayout {...shared}>{app}</FullscreenLayout>
}

interface LayoutProps {
  def: DemoDefinition
  title: string
  projectId: string
  done: string[]
  reset: () => void
  toast: string | null
  children: ReactNode
}

/* ---------------------------------------------------------------- Large screens */

function FramedLayout({ def, title, projectId, done, reset, toast, children }: LayoutProps) {
  const { t } = useLanguage()
  const isPhone = def.frame === 'phone'
  return (
    <div className="relative flex h-dvh flex-col overflow-hidden bg-bg text-text">
      <div className="ambient pointer-events-none absolute inset-0 opacity-70" aria-hidden="true" />
      <div
        className={`relative mx-auto grid min-h-0 w-full max-w-[100rem] flex-1 grid-rows-[minmax(0,1fr)_auto] gap-6 lg:grid-rows-1 lg:gap-10 ${isPhone ? 'px-6 py-4 lg:px-10 lg:py-5' : 'p-6 lg:p-8'} ${
          isPhone ? 'grid-cols-1 lg:grid-cols-[minmax(18rem,26rem)_auto] lg:justify-center lg:gap-20 xl:gap-28' : 'grid-cols-1 lg:grid-cols-[19rem_1fr] xl:grid-cols-[21rem_1fr]'
        }`}
      >
        <aside className="no-scrollbar order-2 flex max-h-[34dvh] min-h-0 flex-col gap-6 overflow-y-auto lg:order-1 lg:max-h-none lg:py-4">
          <BackLink projectId={projectId} />
          <PanelBody def={def} title={title} done={done} reset={reset} />
        </aside>
        <main id="main" className="order-1 flex min-h-0 items-center justify-center lg:order-2" aria-label={t('demo.stageLabel', { title })}>
          {isPhone ? <PhoneFrame>{children}</PhoneFrame> : <BrowserFrame label={def.windowLabel ?? title}>{children}</BrowserFrame>}
        </main>
      </div>
      <Toast message={toast} placement="top" />
    </div>
  )
}

/* ---------------------------------------------------------------- Phones */

function FullscreenLayout({ def, title, projectId, done, reset, toast, children }: LayoutProps) {
  const { t } = useLanguage()
  const [guideOpen, setGuideOpen] = useState(false)
  const [introSeen, setIntroSeen] = useState(false)
  const remaining = def.tasks.length - done.length
  const introText = useLocalized()(def.intro)

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-bg text-text">
      <header className="z-30 flex shrink-0 items-center gap-1 border-b border-border bg-surface/90 px-2 pt-[env(safe-area-inset-top)] backdrop-blur-xl">
        <Link
          to={`/projects/${projectId}`}
          aria-label={t('demo.back')}
          className="inline-flex size-11 items-center justify-center rounded-full text-text-2 transition-colors active:bg-surface-2"
        >
          <ArrowLeft className="size-5 rtl:-scale-x-100" aria-hidden="true" />
        </Link>
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span className="truncate text-sm font-semibold">{title}</span>
          <span className="shrink-0 rounded-full bg-accent/12 px-2 py-0.5 text-[11px] font-semibold text-accent">{t('demo.badge')}</span>
        </div>
        <button
          type="button"
          onClick={() => setGuideOpen(true)}
          aria-label={t('demo.openGuide')}
          className="relative inline-flex h-11 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-text-2 transition-colors active:bg-surface-2"
        >
          <ListChecks className="size-5" aria-hidden="true" />
          <span className="latin text-xs tabular-nums">
            {done.length}/{def.tasks.length}
          </span>
          {remaining === 0 && <span className="absolute end-2 top-2 size-2 rounded-full bg-accent" aria-hidden="true" />}
        </button>
      </header>

      <main id="main" className="relative flex min-h-0 flex-1 flex-col overflow-hidden [container-type:size]">
        {children}
      </main>

      {!introSeen && (
        <IntroCard
          text={introText}
          onDismiss={() => setIntroSeen(true)}
          onGuide={() => {
            setIntroSeen(true)
            setGuideOpen(true)
          }}
        />
      )}

      <GuideSheet open={guideOpen} onClose={() => setGuideOpen(false)}>
        <PanelBody def={def} title={title} done={done} reset={() => (reset(), setGuideOpen(false))} compact />
      </GuideSheet>
      <Toast message={toast} placement="under-bar" />
    </div>
  )
}

function IntroCard({ text, onDismiss, onGuide }: { text: string; onDismiss: () => void; onGuide: () => void }) {
  const { t } = useLanguage()
  const reduce = useReducedMotion()
  return (
    <motion.div
      role="note"
      className="pointer-events-auto fixed inset-x-3 bottom-[calc(5.5rem+var(--safe-bottom,env(safe-area-inset-bottom)))] z-40 rounded-2xl border border-border bg-surface p-4 shadow-[0_24px_60px_-20px_rgb(var(--shadow-color)/0.45)]"
      initial={reduce ? false : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE, delay: 0.5 }}
    >
      <div className="flex gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-accent/12 text-accent">
          <Sparkles className="size-4.5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{t('demo.introTitle')}</p>
          <p className="mt-1 text-sm leading-relaxed text-text-2">{text}</p>
          <div className="mt-3 flex gap-2">
            <button type="button" onClick={onGuide} className="btn-primary inline-flex h-10 items-center rounded-full px-4 text-sm font-semibold">
              {t('demo.showSteps')}
            </button>
            <button type="button" onClick={onDismiss} className="inline-flex h-10 items-center rounded-full px-4 text-sm font-medium text-text-2 active:bg-surface-2">
              {t('demo.explore')}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function GuideSheet({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) {
  const { t } = useLanguage()
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const prev = document.activeElement as HTMLElement | null
    const raf = requestAnimationFrame(() => ref.current?.querySelector<HTMLElement>('button')?.focus())
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('keydown', onKey)
      prev?.focus?.()
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end">
          <motion.div className="absolute inset-0 bg-[var(--overlay)]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} aria-hidden="true" />
          <motion.div
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-label={t('demo.guideTitle')}
            className="relative max-h-[85dvh] w-full overflow-y-auto overscroll-contain rounded-t-[1.75rem] border-t border-border bg-surface px-5 pt-2 pb-[max(1.25rem,var(--safe-bottom,env(safe-area-inset-bottom)))]"
            initial={reduce ? { opacity: 0 } : { y: '100%' }}
            animate={reduce ? { opacity: 1 } : { y: 0 }}
            exit={reduce ? { opacity: 0 } : { y: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 38 }}
          >
            <div className="mx-auto mb-2 h-1.5 w-10 rounded-full bg-text-2/30" aria-hidden="true" />
            <div className="flex justify-end">
              <button type="button" onClick={onClose} aria-label={t('work.close')} className="-me-2 inline-flex size-11 items-center justify-center rounded-full text-text-2 active:bg-surface-2">
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

/* ---------------------------------------------------------------- Shared panel */

function BackLink({ projectId }: { projectId: string }) {
  const { t } = useLanguage()
  return (
    <Link to={`/projects/${projectId}`} className="link-underline inline-flex w-fit items-center gap-2 text-sm font-medium text-text-2 hover:text-text">
      <ArrowLeft className="size-4 rtl:-scale-x-100" aria-hidden="true" />
      {t('demo.back')}
    </Link>
  )
}

function PanelBody({ def, title, done, reset, compact = false }: { def: DemoDefinition; title: string; done: string[]; reset: () => void; compact?: boolean }) {
  const { t, lang, toggleLang } = useLanguage()
  const { theme, toggleTheme } = useTheme()
  const pick = useLocalized()
  const reduce = useReducedMotion()
  const progress = def.tasks.length ? done.length / def.tasks.length : 0
  const allDone = done.length === def.tasks.length

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="inline-flex items-center gap-2 rounded-full bg-accent/12 px-3 py-1 text-xs font-semibold text-accent">
          <span className="size-1.5 rounded-full bg-accent motion-safe:animate-pulse" aria-hidden="true" />
          {t('demo.badgeLong')}
        </p>
        <h1 className={`font-display mt-4 font-semibold tracking-tight text-balance ${compact ? 'text-2xl' : 'text-3xl xl:text-4xl'}`}>{title}</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-text-2">{pick(def.intro)}</p>
      </div>

      <section aria-labelledby="demo-steps">
        <div className="flex items-baseline justify-between gap-3">
          <h2 id="demo-steps" className="text-sm font-semibold">
            {t('demo.guideTitle')}
          </h2>
          <span className="text-xs text-text-2 tabular-nums" aria-live="polite">
            {t('demo.progress', { done: done.length, total: def.tasks.length })}
          </span>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-2" aria-hidden="true">
          <motion.div className="h-full rounded-full bg-accent" initial={false} animate={{ width: `${progress * 100}%` }} transition={{ duration: reduce ? 0 : 0.45, ease: EASE }} />
        </div>
        <ol className="mt-4 flex flex-col gap-2">
          {def.tasks.map((task, i) => {
            const isDone = done.includes(task.id)
            return (
              <li
                key={task.id}
                className={`flex items-start gap-3 rounded-xl border px-3.5 py-3 text-sm transition-colors duration-300 ${
                  isDone ? 'border-accent/30 bg-accent/8 text-text' : 'border-border bg-surface/60 text-text-2'
                }`}
              >
                <span
                  className={`latin mt-px grid size-5 shrink-0 place-items-center rounded-full text-[11px] font-semibold transition-colors duration-300 ${
                    isDone ? 'bg-accent text-on-accent' : 'border border-border text-text-2'
                  }`}
                  aria-hidden="true"
                >
                  {isDone ? <Check className="size-3" strokeWidth={3} /> : i + 1}
                </span>
                <span className={isDone ? 'line-through decoration-accent/50' : ''}>{pick(task.label)}</span>
                <span className="sr-only">{isDone ? t('demo.stepDone') : t('demo.stepTodo')}</span>
              </li>
            )
          })}
        </ol>
        {allDone && <p className="mt-3 text-sm font-medium text-accent">{t('demo.allDone')}</p>}
      </section>

      <p className="flex gap-2.5 rounded-xl bg-surface-2 p-3.5 text-[13px] leading-relaxed text-text-2">
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        {t('demo.notice')}
      </p>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={reset}
          className="glass inline-flex h-11 cursor-pointer items-center gap-2 rounded-full px-4 text-sm font-medium transition-colors hover:border-accent/60 active:scale-[0.98]"
        >
          <RotateCcw className="size-4" aria-hidden="true" />
          {t('demo.reset')}
        </button>
        <button
          type="button"
          onClick={toggleLang}
          aria-label={t('header.language')}
          className="glass latin inline-flex h-11 cursor-pointer items-center rounded-full px-4 text-sm font-semibold transition-colors hover:border-accent/60"
        >
          {lang === 'en' ? 'العربية' : 'English'}
        </button>
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? t('header.themeToLight') : t('header.themeToDark')}
          className="glass inline-flex size-11 cursor-pointer items-center justify-center rounded-full transition-colors hover:border-accent/60"
        >
          {theme === 'dark' ? <Sun className="size-4.5" aria-hidden="true" /> : <Moon className="size-4.5" aria-hidden="true" />}
        </button>
      </div>
    </div>
  )
}

function Toast({ message, placement }: { message: string | null; placement: 'top' | 'under-bar' }) {
  const { t } = useLanguage()
  const reduce = useReducedMotion()
  const offset = -16
  return (
    <div
      className={`pointer-events-none fixed inset-x-0 z-[60] flex justify-center px-4 ${
        placement === 'top' ? 'top-6' : 'top-[calc(env(safe-area-inset-top)+0.4rem)]'
      }`}
      aria-live="polite"
    >
      <AnimatePresence>
        {message && (
          <motion.div
            key={message}
            className="flex max-w-sm items-center gap-2.5 rounded-full border border-accent/30 bg-surface px-4 py-2.5 text-sm font-medium shadow-[0_18px_40px_-16px_rgb(var(--shadow-color)/0.5)]"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: offset, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: offset }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            <span className="grid size-5 shrink-0 place-items-center rounded-full bg-accent text-on-accent">
              <Check className="size-3" strokeWidth={3} aria-hidden="true" />
            </span>
            <span className="truncate">
              <span className="sr-only">{t('demo.stepDone')}: </span>
              {message}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
