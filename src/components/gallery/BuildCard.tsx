import { ChevronRight } from 'lucide-react'
import type { Project } from '../../data/types'
import { hasDemo } from '../../demos/registry'
import { useLanguage, useLocalized } from '../../i18n/context'
import { DemoLink } from '../ui/DemoLink'
import { TLink } from '../ui/TLink'
import { CardStage } from './DeviceStage'

/** One build as a large card: what it is, its actions, and the build itself standing on the bottom edge. */
export function BuildCard({ project, blue = false, eager = false }: { project: Project; blue?: boolean; eager?: boolean }) {
  const { t } = useLanguage()
  const localize = useLocalized()
  const title = localize(project.title)
  const onBlue = blue ? '!bg-white !text-[#005f8f]' : ''
  return (
    <article data-theme={blue ? 'dark' : undefined} className={`bento themed flex h-full flex-col ${blue ? 'bento-blue' : 'bento-soft'}`}>
      <div className="flex flex-col items-start p-7 sm:p-10 lg:p-12">
        <p className={`t-caption font-semibold ${blue ? 'text-white' : 'text-accent'}`}>
          {t(`work.categories.${project.category}`)}
          {project.year && <span className="opacity-70"> · <span className="latin">{project.year}</span></span>}
        </p>
        <h3 className="t-display mt-2 text-balance">{title}</h3>
        <p className={`mt-4 max-w-2xl text-pretty ${blue ? 'text-white' : 'text-text-2'}`}>{localize(project.description)}</p>
        <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
          {hasDemo(project.id) ? (
            <DemoLink projectId={project.id} title={title} className={onBlue} />
          ) : (
            project.liveUrl && (
              <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className={`btn-primary inline-flex h-11 items-center rounded-full px-[22px] text-[17px] active:scale-95 ${onBlue}`}>
                {t('work.viewLive')}
              </a>
            )
          )}
          <TLink to={`/projects/${project.id}`} className={`link-go text-[17px] ${blue ? '!text-white' : ''}`} aria-label={t('work.openDetails', { title })}>
            {t('projects.details')}
            <ChevronRight className="size-4" aria-hidden="true" />
          </TLink>
        </div>
      </div>
      {project.screens && <CardStage screens={project.screens} alt={title} transitionName={`shot-${project.id}`} eager={eager} />}
    </article>
  )
}
