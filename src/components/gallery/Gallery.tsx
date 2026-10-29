import { AnimatePresence, LayoutGroup } from 'framer-motion'
import { useCallback, useMemo, useRef, useState } from 'react'
import { categoryOrder, visibleProjects } from '../../data/projects'
import type { Project } from '../../data/types'
import { useLanguage } from '../../i18n/context'
import { Reveal } from '../ui/Reveal'
import { SectionHeading } from '../ui/SectionHeading'
import { ProjectCard } from './ProjectCard'
import { ProjectFilters, type FilterValue } from './ProjectFilters'
import { ProjectViewer } from './ProjectViewer'

export function Gallery() {
  const { t } = useLanguage()
  const [filter, setFilter] = useState<FilterValue>('all')
  const [activeId, setActiveId] = useState<string | null>(null)
  const lastTrigger = useRef<HTMLElement | null>(null)

  // Only offer categories that actually have projects.
  const filterOptions = useMemo<FilterValue[]>(() => {
    const present = new Set(visibleProjects.map((p) => p.category))
    return ['all', ...categoryOrder.filter((c) => present.has(c))]
  }, [])

  const filtered = useMemo(
    () => (filter === 'all' ? visibleProjects : visibleProjects.filter((p) => p.category === filter)),
    [filter],
  )

  const open = useCallback((project: Project) => {
    lastTrigger.current = document.activeElement as HTMLElement | null
    setActiveId(project.id)
  }, [])

  const close = useCallback(() => {
    setActiveId(null)
    const el = lastTrigger.current
    window.setTimeout(() => el?.focus?.(), 40)
  }, [])

  return (
    <section id="work" className="scroll-mt-24 py-24 sm:py-28 lg:py-36" aria-labelledby="work-title">
      <div className="shell">
      <SectionHeading id="work-title" index="01" eyebrow={t('work.eyebrow')} title={t('work.title')} subtitle={t('work.subtitle')} />

      <Reveal delay={0.08} className="mt-10 sm:mt-14">
        <LayoutGroup id="filters">
          <ProjectFilters options={filterOptions} value={filter} onChange={setFilter} />
        </LayoutGroup>
      </Reveal>

      <LayoutGroup id="gallery">
        <div className="mt-10 grid grid-cols-1 items-start gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8" style={{ gridAutoFlow: 'dense' }}>
          <AnimatePresence mode="popLayout" initial={false}>
            {filtered.map((project, i) => (
              <ProjectCard key={project.id} project={project} index={i} onOpen={open} />
            ))}
          </AnimatePresence>
        </div>
      </LayoutGroup>

      {filtered.length === 0 && (
        <p className="mt-10 text-center text-text-2" role="status">
          {t('work.empty')}
        </p>
      )}

      <ProjectViewer projects={filtered} activeId={activeId} onClose={close} onNavigate={setActiveId} />
      </div>
    </section>
  )
}
