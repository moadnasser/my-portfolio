import { ChevronLeft, ChevronRight, Code2, ExternalLink } from 'lucide-react'
import { useEffect } from 'react'
import { Navigate, useParams } from 'react-router'
import { CurvedCarousel } from '../components/gallery/CurvedCarousel'
import { FullStage } from '../components/gallery/DeviceStage'
import { ButtonLink } from '../components/ui/Button'
import { DemoLink } from '../components/ui/DemoLink'
import { LoadImg } from '../components/ui/LoadImg'
import { Reveal } from '../components/ui/Reveal'
import { Tile } from '../components/ui/Tile'
import { TLink } from '../components/ui/TLink'
import { visibleProjects } from '../data/projects'
import { hasDemo } from '../demos/registry'
import { useLanguage, useLocalized } from '../i18n/context'

/** /projects/:projectId — one build: what it is, the stack, its actions, the device shot and every screenshot. */
export function ProjectPage() {
  const { t, setPageTitle } = useLanguage()
  const localize = useLocalized()
  const { projectId } = useParams()
  const index = visibleProjects.findIndex((p) => p.id === projectId)
  const project = visibleProjects[index]

  useEffect(() => {
    setPageTitle('projects.meta')
    return () => setPageTitle(null)
  }, [setPageTitle])

  // Unknown or hidden ids fall back to the catalogue.
  if (!project) return <Navigate to="/projects" replace />

  const title = localize(project.title)
  const demo = hasDemo(project.id)
  const next = visibleProjects[(index + 1) % visibleProjects.length]
  const shots = project.galleryImages

  return (
    <main id="main">
      <Tile tone="canvas" aria-labelledby="project-title" className="!pb-0 !pt-24 sm:!pt-28">
        <div className="shell">
          <TLink to="/projects" className="t-caption inline-flex items-center gap-1 text-text-2 hover:text-text">
            <ChevronLeft className="size-4 rtl:-scale-x-100" aria-hidden="true" />
            {t('projects.title')}
          </TLink>

          <div className="mx-auto mt-8 flex max-w-4xl flex-col items-center text-center">
            <p className="t-eyebrow">
              {t(`work.categories.${project.category}`)}
              {project.year && <span className="text-text-2"> · <span className="latin">{project.year}</span></span>}
            </p>
            <h1 id="project-title" className="t-hero mt-3 text-balance text-text">
              {title}
            </h1>
            <p className="t-lead mt-6 text-pretty text-text-2">{localize(project.description)}</p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              {demo && <DemoLink projectId={project.id} title={title} />}
              {project.liveUrl && (
                <ButtonLink href={project.liveUrl} external variant={demo ? 'secondary' : 'primary'}>
                  <ExternalLink className="size-4" aria-hidden="true" />
                  {t('work.viewLive')}
                </ButtonLink>
              )}
              {project.sourceUrl && (
                <ButtonLink href={project.sourceUrl} external variant="secondary">
                  <Code2 className="size-4" aria-hidden="true" />
                  {t('work.viewSource')}
                </ButtonLink>
              )}
            </div>
          </div>
        </div>

        {project.screens && (
          <div className="mt-14 pb-16 sm:mt-20 sm:pb-24">
            <FullStage screens={project.screens} alt={title} transitionName={`shot-${project.id}`} eager />
          </div>
        )}
      </Tile>

      {/* The story and the stack, side by side. */}
      <Tile tone="parchment" aria-label={t('work.technologies')}>
        <div className="shell grid gap-x-16 gap-y-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-8">
            <p className="t-lead text-pretty text-text">{localize(project.details ?? project.description)}</p>
          </Reveal>
          <Reveal delay={0.08} className="lg:col-span-4">
            <h2 className="t-caption font-semibold text-text-2">{t('work.technologies')}</h2>
            <ul className="mt-2">
              {project.technologies.map((tech) => (
                <li key={tech} className="latin t-title border-b border-hairline py-3 text-text" dir="ltr">
                  {tech}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </Tile>

      {shots.length > 0 && (
        <Tile tone="canvas" aria-labelledby="shots-title">
          <div className="shell">
            <h2 id="shots-title" className="t-display text-center text-text">
              {t('work.gallery')}
            </h2>
          </div>
          <div className="mt-8">
            {shots.length > 1 ? (
              <CurvedCarousel images={shots} label={t('work.gallery')} altFor={(i) => t('work.screenshotAlt', { title, n: i + 1 })} />
            ) : (
              <div className="shell flex justify-center">
                <LoadImg src={shots[0]} alt={t('work.screenshotAlt', { title, n: 1 })} loading="lazy" decoding="async" className="product-shadow max-h-[70svh] w-auto rounded-2xl" />
              </div>
            )}
          </div>
        </Tile>
      )}

      {/* Onward: the next build, as one large link. */}
      {next && next.id !== project.id && (
        <Tile tone="ink">
          <TLink to={`/projects/${next.id}`} className="shell group flex flex-col items-center text-center">
            <span className="t-eyebrow">{t('work.next')}</span>
            <span className="t-hero mt-3 inline-flex items-center gap-3 text-text transition-colors duration-300 group-hover:text-accent">
              {localize(next.title)}
              <ChevronRight className="size-[0.7em] shrink-0 transition-transform duration-500 ease-out-expo group-hover:translate-x-2 rtl:-scale-x-100 rtl:group-hover:-translate-x-2" aria-hidden="true" />
            </span>
          </TLink>
        </Tile>
      )}
    </main>
  )
}
