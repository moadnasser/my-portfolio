import { motion, useReducedMotion } from 'framer-motion'
import { ArrowUpRight, Code2, ExternalLink } from 'lucide-react'
import { forwardRef } from 'react'
import type { Project } from '../../data/types'
import { useLanguage, useLocalized } from '../../i18n/context'
import { EASE } from '../../lib/motion'
import { TiltCard } from '../ui/TiltCard'

interface ProjectCardProps {
  project: Project
  index: number
  onOpen: (project: Project) => void
}

const orientationClasses: Record<Project['coverOrientation'], string> = {
  landscape: 'aspect-[16/10] lg:col-span-2',
  portrait: 'aspect-[4/5]',
  square: 'aspect-square',
}

const actionClass =
  'themed inline-flex size-9 items-center justify-center rounded-full border border-white/20 bg-black/35 text-white backdrop-blur-sm transition-colors duration-200 hover:bg-black/55'

export const ProjectCard = forwardRef<HTMLElement, ProjectCardProps>(function ProjectCard({ project, index, onOpen }, ref) {
  const { t } = useLanguage()
  const localize = useLocalized()
  const reduce = useReducedMotion()
  const title = localize(project.title)
  const hasActions = Boolean(project.liveUrl || project.sourceUrl)

  return (
    <motion.article
      ref={ref}
      layout={!reduce}
      initial={reduce ? false : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduce ? undefined : { opacity: 0, scale: 0.97, transition: { duration: 0.2 } }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.3), ease: EASE }}
      className={`group relative flex flex-col ${orientationClasses[project.coverOrientation].split(' ').slice(1).join(' ')}`}
    >
      <TiltCard max={6} className="rounded-card">
      <div
        className={`themed relative w-full overflow-hidden rounded-card border border-border bg-surface-2 shadow-[0_30px_60px_-40px_rgb(var(--shadow-color)/0.6)] ${orientationClasses[project.coverOrientation].split(' ')[0]}`}
      >
        <button
          type="button"
          onClick={() => onOpen(project)}
          aria-label={t('work.openDetails', { title })}
          className="absolute inset-0 block h-full w-full cursor-pointer rounded-card focus-visible:outline-offset-[-3px]"
        >
          <img
            src={project.coverImage}
            alt={title}
            loading={index < 2 ? 'eager' : 'lazy'}
            decoding="async"
            className="h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
          {/* Hover overlay */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 flex items-end bg-gradient-to-t from-[var(--overlay)] via-transparent to-transparent p-5 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100 touch:hidden"
          >
            <span className="flex w-full items-center justify-between gap-3 text-white">
              <span className="min-w-0">
                <span className="block truncate text-base font-bold">{title}</span>
                <span className="latin block text-xs font-medium text-white/75">{t(`work.categories.${project.category}`)}</span>
              </span>
              <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-accent text-on-accent">
                <ArrowUpRight className="size-4 rtl:-scale-x-100" />
              </span>
            </span>
          </span>
        </button>

        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-3 end-3 hidden size-9 items-center justify-center rounded-full bg-accent text-on-accent shadow-[0_8px_20px_-10px_rgb(0_0_0/0.5)] touch:inline-flex"
        >
          <ArrowUpRight className="size-4 rtl:-scale-x-100" />
        </span>

        {hasActions && (
          <div className="absolute end-3 top-3 flex gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100 touch:opacity-100">
            {project.liveUrl && (
              <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className={actionClass} aria-label={`${t('work.viewLive')} — ${title}`} title={t('work.viewLive')}>
                <ExternalLink className="size-4" aria-hidden="true" />
              </a>
            )}
            {project.sourceUrl && (
              <a href={project.sourceUrl} target="_blank" rel="noopener noreferrer" className={actionClass} aria-label={`${t('work.viewSource')} — ${title}`} title={t('work.viewSource')}>
                <Code2 className="size-4" aria-hidden="true" />
              </a>
            )}
          </div>
        )}
      </div>
      </TiltCard>

      <div className="flex flex-col gap-2 px-1 pt-5">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-display text-lg font-bold tracking-tight text-text">{title}</h3>
          <span className="latin shrink-0 text-xs font-semibold text-text-2">
            {t(`work.categories.${project.category}`)}
            {project.year && <span className="text-text-2/70"> · {project.year}</span>}
          </span>
        </div>
        <p className="text-pretty text-sm leading-relaxed text-text-2">{localize(project.description)}</p>
        <ul className="mt-1 flex flex-wrap gap-1.5" aria-label={t('work.technologies')}>
          {project.technologies.slice(0, 4).map((tech) => (
            <li key={tech} className="latin glass themed rounded-full px-2.5 py-0.5 text-[11px] font-semibold text-text-2">
              {tech}
            </li>
          ))}
          {project.technologies.length > 4 && (
            <li className="latin rounded-full px-1.5 py-0.5 text-[11px] font-semibold text-text-2/70">+{project.technologies.length - 4}</li>
          )}
        </ul>
      </div>
    </motion.article>
  )
})
