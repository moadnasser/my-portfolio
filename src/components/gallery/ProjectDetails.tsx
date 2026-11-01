import { ChevronUp, Code2, ExternalLink } from 'lucide-react'
import { useState } from 'react'
import type { Project } from '../../data/types'
import { hasDemo } from '../../demos/registry'
import { useLanguage, useLocalized } from '../../i18n/context'
import { Button, ButtonLink } from '../ui/Button'
import { DemoLink } from '../ui/DemoLink'

/** Screenshot at its natural proportions; phone shots get a narrower column so they read at a sensible size. */
function Shot({ src, alt }: { src: string; alt: string }) {
  const [portrait, setPortrait] = useState(src.includes('mobile') || src.includes('login'))
  return (
    <figure className={`shrink-0 snap-start overflow-hidden rounded-2xl border border-border bg-bg shadow-[0_24px_50px_-30px_rgb(var(--shadow-color)/0.6)] ${portrait ? 'w-[46%] sm:w-56' : 'w-[88%] sm:w-auto sm:flex-1'}`}>
      <img src={src} alt={alt} loading="lazy" decoding="async" onLoad={(e) => setPortrait(e.currentTarget.naturalHeight > e.currentTarget.naturalWidth)} className="block h-auto w-full" />
    </figure>
  )
}

interface ProjectDetailsProps {
  project: Project
  onClose: () => void
  /** "full" adds the story, technologies and links (home cards); "gallery" assumes the row already shows them. */
  variant: 'full' | 'gallery'
  headingId: string
}

/** Content of an expanded project: real screenshots, then the story and links. */
export function ProjectDetails({ project, onClose, variant, headingId }: ProjectDetailsProps) {
  const { t } = useLanguage()
  const pick = useLocalized()
  const title = pick(project.title)
  const demo = hasDemo(project.id)
  const shots = project.galleryImages

  return (
    <div className="flex flex-col gap-8">
      {variant === 'full' && (
        <div className="grid gap-8 lg:grid-cols-[1fr_18rem] lg:gap-12">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="latin inline-flex items-center gap-1.5 rounded-full bg-accent/12 px-3 py-1 text-xs font-semibold text-accent">
                <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
                {t(`work.categories.${project.category}`)}
              </span>
              {project.year && <span className="latin rounded-full bg-surface-2 px-3 py-1 text-xs font-semibold text-text-2">{project.year}</span>}
            </div>
            <h3 id={headingId} tabIndex={-1} className="font-display mt-4 text-balance text-3xl font-bold leading-[1.05] tracking-[-0.02em] text-text outline-none focus-visible:outline-none sm:text-4xl">
              {title}
            </h3>
            <p className="mt-4 max-w-2xl text-pretty text-base leading-relaxed text-text-2">{pick(project.details ?? project.description)}</p>
          </div>
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-2">{t('work.technologies')}</p>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {project.technologies.map((tech) => (
                  <li key={tech} className="latin rounded-full border border-border px-2.5 py-1 text-xs font-medium text-text">
                    {tech}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-2.5">
              {demo && <DemoLink projectId={project.id} title={title} className="w-full" />}
              {project.liveUrl && (
                <ButtonLink href={project.liveUrl} external size="md" variant={demo ? 'secondary' : 'primary'} className="w-full">
                  <ExternalLink className="size-4" aria-hidden="true" />
                  {t('work.viewLive')}
                </ButtonLink>
              )}
              {project.sourceUrl && (
                <ButtonLink href={project.sourceUrl} external variant="secondary" size="md" className="w-full">
                  <Code2 className="size-4" aria-hidden="true" />
                  {t('work.viewSource')}
                </ButtonLink>
              )}
            </div>
          </div>
        </div>
      )}

      {shots.length > 0 && (
      <section aria-label={t('work.gallery')}>
        {variant === 'gallery' && (
          <h3 id={headingId} tabIndex={-1} className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-text-2 outline-none focus-visible:outline-none">
            {t('work.gallery')}
          </h3>
        )}
        <div className="no-scrollbar -mx-1 flex snap-x items-start gap-4 overflow-x-auto px-1 pb-2 sm:overflow-visible">
          {shots.map((src, i) => (
            <Shot key={src} src={src} alt={t('work.screenshotAlt', { title, n: i + 1 })} />
          ))}
        </div>
      </section>
      )}

      {variant === 'gallery' && shots.length === 0 && (
        <h3 id={headingId} tabIndex={-1} className="text-sm text-text-2 outline-none focus-visible:outline-none">
          {t('work.noScreenshots')}
        </h3>
      )}

      <div className="flex justify-center">
        <Button variant="ghost" size="sm" onClick={onClose}>
          <ChevronUp className="size-4" aria-hidden="true" />
          {t('work.hideDetails')}
        </Button>
      </div>
    </div>
  )
}
