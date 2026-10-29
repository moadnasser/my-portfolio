import { AnimatePresence, LayoutGroup } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import { Link } from 'react-router'
import { visibleProjects } from '../../data/projects'
import type { Project } from '../../data/types'
import { useLanguage } from '../../i18n/context'
import { Reveal } from '../ui/Reveal'
import { SectionHeading } from '../ui/SectionHeading'
import { ProjectCard } from './ProjectCard'
import { ProjectViewer } from './ProjectViewer'

const featured = visibleProjects.filter((p) => p.featured)

/** Home-page highlight strip: the featured projects, with a link to the full catalogue page. */
export function Gallery() {
  const { t } = useLanguage()
  const [activeId, setActiveId] = useState<string | null>(null)
  const lastTrigger = useRef<HTMLElement | null>(null)

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
        <SectionHeading id="work-title" index="01" eyebrow={t('work.eyebrow')} title={t('work.title')} subtitle={t('work.featuredSubtitle')} />

        <LayoutGroup id="gallery">
          <div className="mt-12 grid grid-cols-1 items-start gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8">
            <AnimatePresence mode="popLayout" initial={false}>
              {featured.map((project, i) => (
                <ProjectCard key={project.id} project={project} index={i} onOpen={open} uniform />
              ))}
            </AnimatePresence>
          </div>
        </LayoutGroup>

        <Reveal className="mt-14 flex justify-center">
          <Link
            to="/projects"
            className="btn-primary inline-flex h-13 cursor-pointer items-center gap-2 rounded-full px-7 text-base font-semibold shadow-[0_12px_30px_-14px_var(--ring)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_36px_-14px_var(--ring)] motion-reduce:hover:translate-y-0"
          >
            {t('work.viewAll')}
            <ArrowUpRight className="size-4 rtl:-scale-x-100" aria-hidden="true" />
          </Link>
        </Reveal>
      </div>

      <ProjectViewer projects={featured} activeId={activeId} onClose={close} onNavigate={setActiveId} />
    </section>
  )
}
