import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { ProjectActions } from '../components/gallery/ProjectActions'
import { ProjectFilters, type FilterValue } from '../components/gallery/ProjectFilters'
import { Plate, type PlateShape, type PlateTone } from '../components/ui/Plate'
import { Reveal } from '../components/ui/Reveal'
import { RiseText } from '../components/ui/RiseText'
import { TLink } from '../components/ui/TLink'
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

/**
 * How each entry is cut, by its position in the list: the plate changes side, size, shape and
 * ground from one build to the next, so the catalogue reads as a sequence of spreads, not a grid.
 */
const cuts: { plate: string; text: string; shape: PlateShape; tone: PlateTone }[] = [
  { plate: 'lg:col-span-8', text: 'lg:col-span-4', shape: 'wide', tone: 'blue' },
  { plate: 'lg:col-span-5 lg:col-start-8 lg:row-start-1', text: 'lg:col-span-6 lg:col-start-1 lg:row-start-1', shape: 'tall', tone: 'neutral' },
  { plate: 'lg:col-span-7', text: 'lg:col-span-4 lg:col-start-9', shape: 'wide', tone: 'ink' },
  { plate: 'lg:col-span-6 lg:col-start-7 lg:row-start-1', text: 'lg:col-span-5 lg:col-start-1 lg:row-start-1', shape: 'wide', tone: 'neutral' },
]

function Entry({ project, index, eager }: { project: Project; index: number; eager: boolean }) {
  const { t } = useLanguage()
  const localize = useLocalized()
  const title = localize(project.title)
  const cut = cuts[index % cuts.length]
  return (
    <article className="grid grid-cols-1 items-end gap-x-10 gap-y-7 lg:grid-cols-12">
      {project.screens && (
        <TLink to={`/projects/${project.id}`} tabIndex={-1} aria-hidden="true" data-cursor={t('cursor.view')} className={`group block ${cut.plate}`}>
          <Plate screens={project.screens} alt="" shape={cut.shape} tone={cut.tone} transitionName={`shot-${project.id}`} eager={eager} />
        </TLink>
      )}
      <div className={`${cut.text} lg:pb-4`}>
        <p className="t-caption text-text-2">
          {t(`work.categories.${project.category}`)}
          {project.year && <span className="latin t-code ms-2">{project.year}</span>}
        </p>
        <h2 className="mt-3">
          <TLink to={`/projects/${project.id}`} className="t-display text-text transition-colors duration-300 hover:text-accent" aria-label={t('work.openDetails', { title })}>
            {title}
          </TLink>
        </h2>
        <p className="mt-4 max-w-[46ch] text-pretty text-text-2">{localize(project.description)}</p>
        <ul className="mt-6 flex flex-wrap gap-1.5" aria-label={t('work.technologies')}>
          {project.technologies.map((tech) => (
            <li key={tech} className="tag">
              {tech}
            </li>
          ))}
        </ul>
        <div className="mt-8">
          <ProjectActions project={project} />
        </div>
      </div>
    </article>
  )
}

/** /projects — the full catalogue, filterable by platform. Each entry opens its own page. */
export function ProjectsPage() {
  const { t, setPageTitle } = useLanguage()
  const reduce = useReducedMotion()
  const [filter, setFilter] = useState<FilterValue>('all')

  const { options, counts } = useMemo(() => {
    const tally: Partial<Record<FilterValue, number>> = { all: visibleProjects.length }
    for (const p of visibleProjects) tally[p.category] = (tally[p.category] ?? 0) + 1
    return { options: ['all', ...categoryOrder.filter((c) => tally[c])] as FilterValue[], counts: tally }
  }, [])
  const filtered = useMemo(() => (filter === 'all' ? visibleProjects : visibleProjects.filter((p) => p.category === filter)), [filter])
  const countLabel = useProjectCount(filtered.length)

  useEffect(() => {
    setPageTitle('projects.meta')
    return () => setPageTitle(null)
  }, [setPageTitle])

  return (
    <main id="main" className="sec themed">
      <header className="shell pb-10 pt-32 sm:pt-40 lg:pb-14">
        <p className="t-eyebrow">{t('projects.eyebrow')}</p>
        <h1 id="projects-title" className="t-hero mt-5 text-text">
          <RiseText immediate delay={0.1} stagger={0.06} text={t('projects.title')} />
        </h1>
        <Reveal delay={0.25} className="mt-6 flex flex-wrap items-end justify-between gap-x-12 gap-y-8">
          <p className="t-lead max-w-[44ch] text-pretty text-text-2">{t('projects.subtitle')}</p>
          <span className="t-caption tabular-nums text-text-2" aria-live="polite">
            {countLabel}
          </span>
        </Reveal>
        <Reveal delay={0.3} className="mt-12 border-b border-hairline">
          <LayoutGroup id="projects-filters">
            <ProjectFilters options={options} value={filter} onChange={setFilter} counts={counts} />
          </LayoutGroup>
        </Reveal>
      </header>

      <section aria-labelledby="projects-title" className="shell pb-[clamp(5rem,3rem+8vw,11rem)] pt-8 lg:pt-14">
        <ul className="flex flex-col gap-y-20 lg:gap-y-36">
          <AnimatePresence mode="popLayout" initial={false}>
            {filtered.map((project, i) => (
              <motion.li
                key={project.id}
                layout={reduce ? false : 'position'}
                initial={reduce ? false : { opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, transition: { duration: 0.2 } }}
                transition={{ duration: 0.8, delay: Math.min(i * 0.07, 0.21), ease: EASE }}
              >
                <Entry project={project} index={i} eager={i < 2} />
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
        {filtered.length === 0 && (
          <p className="py-16 text-center text-text-2" role="status">
            {t('work.empty')}
          </p>
        )}
      </section>
    </main>
  )
}
