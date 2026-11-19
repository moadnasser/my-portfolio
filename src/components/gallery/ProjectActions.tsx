import { ArrowUpRight, ExternalLink } from 'lucide-react'
import type { Project } from '../../data/types'
import { hasDemo } from '../../demos/registry'
import { useLanguage, useLocalized } from '../../i18n/context'
import { DemoLink } from '../ui/DemoLink'
import { TLink } from '../ui/TLink'
import type { ButtonSize } from '../ui/buttonClasses'

/**
 * The ways into a build, in priority order: its live demo, else its live site, then its page.
 * With `details` off the page link is dropped, unless it is the only action the build has.
 * Marked `data-cursor-off` so the labelled cursor steps aside over real controls.
 */
export function ProjectActions({ project, size = 'md', onBlue = false, details = true }: { project: Project; size?: ButtonSize; onBlue?: boolean; details?: boolean }) {
  const { t } = useLanguage()
  const title = useLocalized()(project.title)
  const demo = hasDemo(project.id)
  return (
    <div data-cursor-off className="relative z-10 flex flex-wrap items-center gap-x-5 gap-y-3">
      {demo ? (
        <DemoLink projectId={project.id} title={title} size={size} className={onBlue ? 'btn-on-blue' : ''} />
      ) : (
        project.liveUrl && (
          <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className={`btn btn-primary ${size === 'sm' ? 'btn-sm' : ''} ${onBlue ? 'btn-on-blue' : ''}`}>
            {t('work.viewLive')}
            <ExternalLink className="size-4" aria-hidden="true" />
          </a>
        )
      )}
      {(details || (!demo && !project.liveUrl)) && (
        <TLink to={`/projects/${project.id}`} className="link-go text-[15px]" aria-label={t('work.openDetails', { title })}>
          {t('projects.details')}
          <ArrowUpRight className="size-4" aria-hidden="true" />
        </TLink>
      )}
    </div>
  )
}
