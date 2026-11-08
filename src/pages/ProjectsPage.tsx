import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'framer-motion'
import { ArrowLeft, ChevronDown, Code2, ExternalLink, Maximize2 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { ProjectFilters, type FilterValue } from '../components/gallery/ProjectFilters'
import { ProjectDetails } from '../components/gallery/ProjectDetails'
import { Ambient } from '../components/ui/Ambient'
import { Button, ButtonLink } from '../components/ui/Button'
import { DemoLink } from '../components/ui/DemoLink'
import { DeviceShowcase } from '../components/ui/DeviceShowcase'
import { Reveal } from '../components/ui/Reveal'
import { hasDemo } from '../demos/registry'
import { TiltCard } from '../components/ui/TiltCard'
import { categoryOrder, visibleProjects } from '../data/projects'
import type { Project } from '../data/types'
import { useLanguage, useLocalized } from '../i18n/context'
import { EASE } from '../lib/motion'
import { LoadImg } from '../components/ui/LoadImg'

function useProjectCount(n: number) {
  const { t } = useLanguage()
  if (n === 1) return t('projects.count.one')
  if (n === 2) return t('projects.count.two')
  if (n <= 10) return t('projects.count.few', { n })
  return t('projects.count.many', { n })
}

interface ShowcaseRowProps {
  project: Project
  index: number
  expanded: boolean
  onToggle: (project: Project, trigger: HTMLElement | null) => void
}

/** One editorial row: large cover on one side, full story on the other. Rows alternate sides on desktop. */
function ShowcaseRow({ project, index, expanded, onToggle }: ShowcaseRowProps) {
  const { t } = useLanguage()
  const localize = useLocalized()
  const reduce = useReducedMotion()
  const title = localize(project.title)
  const flip = index % 2 === 1
  const portrait = project.coverOrientation === 'portrait'
  const [hover, setHover] = useState(false)
  const rowRef = useRef<HTMLElement>(null)
  const panelId = `details-${project.id}`
  const headingId = `details-title-${project.id}`

  // Bring the opened row into view and move focus into the panel (also for shared deep links).
  useEffect(() => {
    if (!expanded) return
    const id = window.setTimeout(() => {
      rowRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
      document.getElementById(headingId)?.focus({ preventScroll: true })
    }, 120)
    return () => window.clearTimeout(id)
  }, [expanded, headingId, reduce])

  return (
    <motion.article
      ref={rowRef}
      layout={!reduce}
      initial={reduce ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      exit={reduce ? undefined : { opacity: 0, scale: 0.98, transition: { duration: 0.2 } }}
      transition={{ duration: 0.6, ease: EASE }}
      className="scroll-mt-24 border-t border-border py-12 lg:py-20"
    >
      <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-14">
      {/* Media */}
      <div className={`lg:col-span-7 ${flip ? 'lg:order-2' : ''}`}>
        <TiltCard max={5} className="rounded-card">
          <motion.button
            type="button"
            style={{ borderRadius: 20 }}
            aria-expanded={expanded}
            aria-controls={panelId}
            onClick={(e) => onToggle(project, e.currentTarget)}
            aria-label={t('work.openDetails', { title })}
            onPointerEnter={() => setHover(true)}
            onPointerLeave={() => setHover(false)}
            onFocus={() => setHover(true)}
            onBlur={() => setHover(false)}
            className={`group themed relative block w-full cursor-pointer overflow-hidden border border-border bg-surface-2 shadow-[0_40px_80px_-40px_rgb(var(--shadow-color)/0.7)] ${
              project.screens ? 'aspect-[16/11]' : portrait ? 'aspect-[4/3] p-6 sm:p-10' : 'aspect-[16/10]'
            }`}
          >
            {project.screens ? (
              <>
                <span className="absolute inset-0 bg-[radial-gradient(120%_90%_at_80%_100%,color-mix(in_oklab,var(--accent)_22%,transparent),transparent_60%)]" aria-hidden="true" />
                <DeviceShowcase screens={project.screens} alt={title} active={hover} eager={index < 1} />
              </>
            ) : (
              <>
                {portrait && <Ambient />}
                <LoadImg
                  src={project.coverImage}
                  alt={title}
                  loading={index < 1 ? 'eager' : 'lazy'}
                  decoding="async"
                  className={`transition-transform duration-700 ease-out motion-reduce:transition-none ${
                    portrait
                      ? 'relative mx-auto h-full w-auto [&:not([data-loaded])]:aspect-[9/19] rounded-xl border border-border object-contain shadow-[0_30px_60px_-30px_rgb(var(--shadow-color)/0.8)] group-hover:-translate-y-1'
                      : 'h-full w-full object-cover object-top group-hover:scale-[1.03]'
                  }`}
                />
              </>
            )}
            <span
              aria-hidden="true"
              className="absolute bottom-4 end-4 inline-flex size-11 items-center justify-center rounded-full bg-accent text-on-accent opacity-0 shadow-[0_12px_30px_-10px_var(--ring)] transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 touch:opacity-100"
            >
              <Maximize2 className="size-4" />
            </span>
          </motion.button>
        </TiltCard>
      </div>

      {/* Story */}
      <div className={`flex flex-col lg:col-span-5 ${flip ? 'lg:order-1' : ''}`}>
        <div className="flex flex-wrap items-center gap-2">
          <span className="latin font-display text-sm font-bold text-accent">{String(index + 1).padStart(2, '0')}</span>
          <span className="h-px w-6 bg-border" aria-hidden="true" />
          <span className="latin rounded-full bg-accent/12 px-3 py-1 text-xs font-semibold text-accent">{t(`work.categories.${project.category}`)}</span>
          {project.year && <span className="latin glass rounded-full px-3 py-1 text-xs font-semibold text-text-2">{project.year}</span>}
        </div>
        <h2 className="font-display mt-5 text-balance text-3xl font-bold leading-[1.05] tracking-[-0.02em] text-text sm:text-4xl lg:text-[2.75rem]">{title}</h2>
        <p className="mt-5 text-pretty text-base leading-relaxed text-text-2 sm:text-lg">{localize(project.details ?? project.description)}</p>
        <ul className="mt-6 flex flex-wrap gap-2" aria-label={t('work.technologies')}>
          {project.technologies.map((tech) => (
            <li key={tech} className="latin glass themed rounded-full px-3 py-1.5 text-xs font-semibold text-text">
              {tech}
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          {hasDemo(project.id) && <DemoLink projectId={project.id} title={localize(project.title)} />}
          <Button onClick={(e) => onToggle(project, e.currentTarget)} size="md" variant={hasDemo(project.id) ? 'secondary' : 'primary'} aria-expanded={expanded} aria-controls={panelId}>
            {expanded ? t('work.hideDetails') : t('projects.details')}
            <ChevronDown className={`size-4 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} aria-hidden="true" />
          </Button>
          {project.liveUrl && (
            <ButtonLink href={project.liveUrl} external variant="secondary" size="md">
              <ExternalLink className="size-4" aria-hidden="true" />
              {t('work.viewLive')}
            </ButtonLink>
          )}
          {project.sourceUrl && (
            <ButtonLink href={project.sourceUrl} external variant="ghost" size="md">
              <Code2 className="size-4" aria-hidden="true" />
              {t('work.viewSource')}
            </ButtonLink>
          )}
        </div>
      </div>
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="details"
            id={panelId}
            role="region"
            aria-labelledby={headingId}
            initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={reduce ? { opacity: 1 } : { height: 'auto', opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="mt-10 rounded-[1.75rem] border border-border bg-surface/70 p-5 sm:p-8">
              <ProjectDetails project={project} variant="gallery" headingId={headingId} onClose={() => onToggle(project, null)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  )
}

/** /projects and /projects/:projectId — the full catalogue. The id in the URL opens the detail viewer, so links are shareable. */
export function ProjectsPage() {
  const { t, setPageTitle } = useLanguage()
  const navigate = useNavigate()
  const { projectId } = useParams()
  const [filter, setFilter] = useState<FilterValue>('all')
  const lastTrigger = useRef<HTMLElement | null>(null)

  const filterOptions = useMemo<FilterValue[]>(() => {
    const present = new Set(visibleProjects.map((p) => p.category))
    return ['all', ...categoryOrder.filter((c) => present.has(c))]
  }, [])
  const filtered = useMemo(() => (filter === 'all' ? visibleProjects : visibleProjects.filter((p) => p.category === filter)), [filter])
  const countLabel = useProjectCount(filtered.length)

  // A URL id that is unknown or hidden just shows the list.
  const activeId = projectId && visibleProjects.some((p) => p.id === projectId) ? projectId : null
  useEffect(() => {
    if (projectId && !activeId) navigate('/projects', { replace: true })
  }, [projectId, activeId, navigate])

  // One row open at a time; its id lives in the URL so the expanded view is shareable.
  const toggle = useCallback(
    (project: Project, trigger: HTMLElement | null) => {
      if (activeId === project.id) {
        navigate('/projects', { replace: true })
        const back = trigger ?? lastTrigger.current
        window.setTimeout(() => back?.focus?.({ preventScroll: true }), 60)
      } else {
        lastTrigger.current = trigger
        navigate(`/projects/${project.id}`, { replace: !!activeId })
      }
    },
    [activeId, navigate],
  )

  // Escape collapses the open row.
  useEffect(() => {
    if (!activeId) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      navigate('/projects', { replace: true })
      window.setTimeout(() => lastTrigger.current?.focus?.({ preventScroll: true }), 60)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [activeId, navigate])

  useEffect(() => {
    setPageTitle('projects.meta')
    return () => setPageTitle(null)
  }, [setPageTitle])

  return (
    <main id="main" className="relative pt-28 sm:pt-36">
      <section className="relative isolate overflow-hidden pb-6" aria-labelledby="projects-title">
        <Ambient />
        <div className="shell relative">
          <Reveal className="flex flex-col gap-6">
            <Link to="/" className="link-underline inline-flex w-fit items-center gap-2 text-sm font-medium text-text-2 hover:text-text">
              <ArrowLeft className="size-4 rtl:-scale-x-100" aria-hidden="true" />
              {t('projects.backHome')}
            </Link>
            <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-text-2">
              <span className="latin font-display text-accent">01</span>
              <span className="h-px w-8 bg-border" aria-hidden="true" />
              <span>{t('projects.eyebrow')}</span>
            </div>
            <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
              <h1 id="projects-title" className="font-display text-balance text-5xl font-bold leading-[0.98] tracking-[-0.035em] text-text sm:text-6xl lg:col-span-8 lg:text-7xl">
                {t('projects.title')}
              </h1>
              <p className="max-w-md text-pretty text-base leading-relaxed text-text-2 lg:col-span-4 lg:text-lg">{t('projects.subtitle')}</p>
            </div>
          </Reveal>

          <Reveal delay={0.08} className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <LayoutGroup id="projects-filters">
              <ProjectFilters options={filterOptions} value={filter} onChange={setFilter} align="start" />
            </LayoutGroup>
            <span className="latin text-sm font-semibold tabular-nums text-text-2" aria-live="polite">
              {countLabel}
            </span>
          </Reveal>
        </div>
      </section>

      <section className="shell pb-24 sm:pb-32" aria-label={t('projects.title')}>
        <div className="mt-6">
          {filtered.map((project, i) => (
            <ShowcaseRow key={project.id} project={project} index={i} expanded={activeId === project.id} onToggle={toggle} />
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="py-16 text-center text-text-2" role="status">
            {t('work.empty')}
          </p>
        )}
      </section>

    </main>
  )
}
