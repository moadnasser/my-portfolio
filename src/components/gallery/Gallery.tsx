import { AnimatePresence, LayoutGroup, useReducedMotion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router'
import { visibleProjects } from '../../data/projects'
import type { Project } from '../../data/types'
import { useLanguage } from '../../i18n/context'
import { Reveal } from '../ui/Reveal'
import { SectionHeading } from '../ui/SectionHeading'
import { ProjectCard } from './ProjectCard'

const featured = visibleProjects.filter((p) => p.featured)

/** Home-page highlight strip: the featured projects, with a link to the full catalogue page. */
export function Gallery() {
  const { t } = useLanguage()
  const [openId, setOpenId] = useState<string | null>(null)
  const reduce = useReducedMotion()

  // The card's button is re-created when it folds back, so focus is restored by project id.
  const collapse = useCallback((id: string) => {
    setOpenId(null)
    window.setTimeout(() => document.querySelector<HTMLElement>(`[data-card-trigger="${id}"]`)?.focus({ preventScroll: true }), 80)
  }, [])

  // Clicking a card expands it in place; clicking again (or Escape) folds it back.
  const toggle = useCallback(
    (project: Project) => {
      if (openId === project.id) {
        collapse(project.id)
        return
      }
      setOpenId(project.id)
      window.setTimeout(() => {
        document.getElementById(`card-${project.id}`)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
        document.getElementById(`card-title-${project.id}`)?.focus({ preventScroll: true })
      }, 260)
    },
    [openId, reduce, collapse],
  )

  useEffect(() => {
    if (!openId) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      collapse(openId)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [openId, collapse])

  return (
    <section id="work" className="scroll-mt-24 py-24 sm:py-28 lg:py-36" aria-labelledby="work-title">
      <div className="shell">
        <SectionHeading id="work-title" index="01" eyebrow={t('work.eyebrow')} title={t('work.title')} subtitle={t('work.featuredSubtitle')} />

        <LayoutGroup id="gallery">
          <div className="mt-12 grid grid-flow-row-dense grid-cols-1 items-start gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8">
            <AnimatePresence mode="popLayout" initial={false}>
              {featured.map((project, i) => (
                <ProjectCard key={project.id} project={project} index={i} onOpen={toggle} uniform expanded={openId === project.id} />
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

    </section>
  )
}
