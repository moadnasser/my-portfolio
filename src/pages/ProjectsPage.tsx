import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { BuildCard } from '../components/gallery/BuildCard'
import { ProjectFilters, type FilterValue } from '../components/gallery/ProjectFilters'
import { Reveal } from '../components/ui/Reveal'
import { Tile } from '../components/ui/Tile'
import { categoryOrder, visibleProjects } from '../data/projects'
import { useLanguage } from '../i18n/context'
import { EASE } from '../lib/motion'

function useProjectCount(n: number) {
  const { t } = useLanguage()
  if (n === 1) return t('projects.count.one')
  if (n === 2) return t('projects.count.two')
  if (n <= 10) return t('projects.count.few', { n })
  return t('projects.count.many', { n })
}

/** /projects — the full catalogue as a grid of build cards, filterable by platform. Each card opens its own page. */
export function ProjectsPage() {
  const { t, setPageTitle } = useLanguage()
  const reduce = useReducedMotion()
  const [filter, setFilter] = useState<FilterValue>('all')

  const filterOptions = useMemo<FilterValue[]>(() => {
    const present = new Set(visibleProjects.map((p) => p.category))
    return ['all', ...categoryOrder.filter((c) => present.has(c))]
  }, [])
  const filtered = useMemo(() => (filter === 'all' ? visibleProjects : visibleProjects.filter((p) => p.category === filter)), [filter])
  const countLabel = useProjectCount(filtered.length)

  useEffect(() => {
    setPageTitle('projects.meta')
    return () => setPageTitle(null)
  }, [setPageTitle])

  return (
    <main id="main">
      <Tile tone="canvas" aria-labelledby="projects-title" className="!pb-10 !pt-28 sm:!pt-36">
        <div className="shell">
          <Reveal className="mx-auto flex max-w-4xl flex-col items-center text-center">
            <p className="t-eyebrow">{t('projects.eyebrow')}</p>
            <h1 id="projects-title" className="t-hero mt-3 text-balance text-text">
              {t('projects.title')}
            </h1>
            <p className="t-lead mt-6 max-w-2xl text-pretty text-text-2">{t('projects.subtitle')}</p>
          </Reveal>
          <Reveal delay={0.08} className="mt-10 flex flex-col items-center gap-4">
            <LayoutGroup id="projects-filters">
              <ProjectFilters options={filterOptions} value={filter} onChange={setFilter} />
            </LayoutGroup>
            <span className="t-caption tabular-nums text-text-2" aria-live="polite">
              {countLabel}
            </span>
          </Reveal>
        </div>
      </Tile>

      <Tile tone="canvas" aria-label={t('projects.title')} className="!pt-4">
        <div className="shell">
          <ul className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6">
            <AnimatePresence mode="popLayout" initial={false}>
              {filtered.map((project, i) => (
                <motion.li
                  key={project.id}
                  layout={!reduce}
                  initial={reduce ? false : { opacity: 0, y: 28 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? undefined : { opacity: 0, scale: 0.97, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.55, delay: Math.min(i * 0.06, 0.24), ease: EASE }}
                  // An odd card out at the end takes the full row instead of leaving a hole.
                  className={i === filtered.length - 1 && filtered.length % 2 === 1 ? 'lg:col-span-2' : ''}
                >
                  <BuildCard project={project} blue={i % 4 === 1} eager={i < 2} />
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
          {filtered.length === 0 && (
            <p className="py-16 text-center text-text-2" role="status">
              {t('work.empty')}
            </p>
          )}
        </div>
      </Tile>
    </main>
  )
}
