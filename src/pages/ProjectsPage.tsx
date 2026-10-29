import { LayoutGroup, motion, useReducedMotion } from 'framer-motion'
import { ArrowLeft, ArrowUpRight, Code2, ExternalLink, Maximize2 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { ProjectFilters, type FilterValue } from '../components/gallery/ProjectFilters'
import { ProjectViewer } from '../components/gallery/ProjectViewer'
import { Ambient } from '../components/ui/Ambient'
import { Button, ButtonLink } from '../components/ui/Button'
import { Reveal } from '../components/ui/Reveal'
import { TiltCard } from '../components/ui/TiltCard'
import { categoryOrder, visibleProjects } from '../data/projects'
import type { Project } from '../data/types'
import { useLanguage, useLocalized } from '../i18n/context'
import { EASE } from '../lib/motion'

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
  onOpen: (project: Project, trigger: HTMLElement | null) => void
}

/** One editorial row: large cover on one side, full story on the other. Rows alternate sides on desktop. */
function ShowcaseRow({ project, index, onOpen }: ShowcaseRowProps) {
  const { t } = useLanguage()
  const localize = useLocalized()
  const reduce = useReducedMotion()
  const title = localize(project.title)
  const flip = index % 2 === 1
  const portrait = project.coverOrientation === 'portrait'

  return (
    <motion.article
      layout={!reduce}
      initial={reduce ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      exit={reduce ? undefined : { opacity: 0, scale: 0.98, transition: { duration: 0.2 } }}
      transition={{ duration: 0.6, ease: EASE }}
      className="grid grid-cols-1 items-center gap-8 border-t border-border py-12 lg:grid-cols-12 lg:gap-14 lg:py-20"
    >
      {/* Media */}
      <div className={`lg:col-span-7 ${flip ? 'lg:order-2' : ''}`}>
        <TiltCard max={5} className="rounded-card">
          <button
            type="button"
            onClick={(e) => onOpen(project, e.currentTarget)}
            aria-label={t('work.openDetails', { title })}
            className={`group themed relative block w-full cursor-pointer overflow-hidden rounded-card border border-border bg-surface-2 shadow-[0_40px_80px_-40px_rgb(var(--shadow-color)/0.7)] ${
              portrait ? 'aspect-[4/3] p-6 sm:p-10' : 'aspect-[16/10]'
            }`}
          >
            {portrait && <Ambient />}
            <img
              src={project.coverImage}
              alt={title}
              loading={index < 1 ? 'eager' : 'lazy'}
              decoding="async"
              className={`transition-transform duration-700 ease-out motion-reduce:transition-none ${
                portrait
                  ? 'relative mx-auto h-full w-auto rounded-xl border border-border object-contain shadow-[0_30px_60px_-30px_rgb(var(--shadow-color)/0.8)] group-hover:-translate-y-1'
                  : 'h-full w-full object-cover object-top group-hover:scale-[1.03]'
              }`}
            />
            <span
              aria-hidden="true"
              className="absolute bottom-4 end-4 inline-flex size-11 items-center justify-center rounded-full bg-accent text-on-accent opacity-0 shadow-[0_12px_30px_-10px_var(--ring)] transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 touch:opacity-100"
            >
              <Maximize2 className="size-4" />
            </span>
          </button>
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
          <Button onClick={(e) => onOpen(project, e.currentTarget)} size="md">
            {t('projects.details')}
            <ArrowUpRight className="size-4 rtl:-scale-x-100" aria-hidden="true" />
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

  // The viewer navigates within the current filter; if the open project is filtered out, keep it reachable.
  const viewerProjects = useMemo(() => {
    if (!activeId || filtered.some((p) => p.id === activeId)) return filtered
    return visibleProjects
  }, [activeId, filtered])

  const open = useCallback(
    (project: Project, trigger: HTMLElement | null) => {
      lastTrigger.current = trigger
      navigate(`/projects/${project.id}`)
    },
    [navigate],
  )
  const close = useCallback(() => {
    navigate('/projects')
    const el = lastTrigger.current
    window.setTimeout(() => el?.focus?.(), 40)
  }, [navigate])
  const goTo = useCallback((id: string) => navigate(`/projects/${id}`, { replace: true }), [navigate])

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
            <ShowcaseRow key={project.id} project={project} index={i} onOpen={open} />
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="py-16 text-center text-text-2" role="status">
            {t('work.empty')}
          </p>
        )}
      </section>

      <ProjectViewer projects={viewerProjects} activeId={activeId} onClose={close} onNavigate={goTo} />
    </main>
  )
}
