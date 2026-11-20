import { ArrowLeft, ArrowUpRight, Code2, ExternalLink } from 'lucide-react'
import { useEffect } from 'react'
import { Navigate, useParams } from 'react-router'
import { ShotGallery } from '../components/gallery/ShotGallery'
import { DemoLink } from '../components/ui/DemoLink'
import { Plate } from '../components/ui/Plate'
import { Reveal } from '../components/ui/Reveal'
import { RiseText } from '../components/ui/RiseText'
import { TLink } from '../components/ui/TLink'
import { visibleProjects } from '../data/projects'
import { hasDemo } from '../demos/registry'
import { useLanguage, useLocalized } from '../i18n/context'

/** /projects/:projectId — one build: what it is, its actions, the plate, the story, the stack and every screenshot. */
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
    // Keyed by project so the entrance replays when moving from one build to the next.
    <main id="main" key={project.id}>
      <section className="sec themed pb-[clamp(4rem,3rem+5vw,8rem)] pt-28 sm:pt-32" aria-labelledby="project-title">
        <div className="shell">
          <TLink to="/projects" className="link-go t-caption text-text-2">
            <ArrowLeft className="size-4" aria-hidden="true" />
            {t('projects.title')}
          </TLink>

          <h1 id="project-title" className="t-hero mt-8 text-text">
            <RiseText immediate delay={0.1} stagger={0.1} text={title} />
          </h1>

          <Reveal delay={0.3} className="mt-8 grid grid-cols-1 gap-x-10 gap-y-8 border-t border-hairline pt-8 lg:grid-cols-12">
            <dl className="flex gap-10 lg:col-span-3 lg:flex-col lg:gap-5">
              <div>
                <dt className="t-caption text-text-2">{t('work.category')}</dt>
                <dd className="mt-0.5 font-semibold text-text">{t(`work.categories.${project.category}`)}</dd>
              </div>
              {project.year && (
                <div>
                  <dt className="t-caption text-text-2">{t('work.year')}</dt>
                  <dd className="latin mt-0.5 font-semibold text-text">{project.year}</dd>
                </div>
              )}
            </dl>
            <div className="lg:col-span-9">
              <p className="t-lead max-w-[48ch] text-pretty text-text">{localize(project.description)}</p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                {demo && <DemoLink projectId={project.id} title={title} />}
                {project.liveUrl && (
                  <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className={`btn ${demo ? 'btn-secondary' : 'btn-primary'}`}>
                    {t('work.viewLive')}
                    <ExternalLink className="size-4" aria-hidden="true" />
                  </a>
                )}
                {project.sourceUrl && (
                  <a href={project.sourceUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                    <Code2 className="size-4" aria-hidden="true" />
                    {t('work.viewSource')}
                  </a>
                )}
              </div>
            </div>
          </Reveal>

          {project.screens && (
            <div className="group mt-14 lg:mt-20">
              <Plate screens={project.screens} alt={title} tone="blue" transitionName={`shot-${project.id}`} eager className="max-sm:aspect-[4/3.4] lg:aspect-[16/8.4]" />
            </div>
          )}
        </div>
      </section>

      {/* The story and the stack, side by side. */}
      <section data-tone="surface" className="sec themed sec-pad" aria-label={t('work.technologies')}>
        <div className="shell grid gap-x-10 gap-y-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-4">
            <h2 className="t-eyebrow">{t('work.technologies')}</h2>
            <ul className="mt-6 border-b border-hairline">
              {project.technologies.map((tech, i) => (
                <li key={tech} className="flex items-baseline justify-between gap-4 border-t border-hairline py-3.5" dir="ltr">
                  <span className="latin t-title text-text">{tech}</span>
                  <span className="t-code text-text-2" aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.1} className="lg:col-span-7 lg:col-start-6">
            <p className="font-display text-pretty text-[clamp(1.25rem,1rem+0.8vw,1.625rem)] font-medium leading-[1.4] tracking-[-0.02em] text-text [font-variation-settings:'wdth'_92] rtl:leading-[1.7] rtl:[font-variation-settings:normal]">
              {localize(project.details ?? project.description)}
            </p>
          </Reveal>
        </div>
      </section>

      {shots.length > 0 && (
        <section className="sec themed sec-pad overflow-x-clip" aria-labelledby="shots-title">
          <div className="shell">
            <h2 id="shots-title" className="t-display text-text">
              <RiseText text={t('work.gallery')} />
            </h2>
          </div>
          <div className="shell mt-8 lg:mt-12">
            <ShotGallery images={shots} title={title} />
          </div>
        </section>
      )}

      {/* Onward: the next build, as one large link. */}
      {next && next.id !== project.id && (
        <section data-theme="dark" data-tone="ink" className="sec border-b border-hairline">
          <TLink to={`/projects/${next.id}`} data-cursor="view" data-cursor-label={t('cursor.open')} className="shell group flex flex-col py-[clamp(4rem,3rem+5vw,7.5rem)]">
            <span className="t-eyebrow">{t('work.next')}</span>
            <span className="t-hero mt-5 flex items-end justify-between gap-6 text-text transition-colors duration-500 group-hover:text-accent">
              {localize(next.title)}
              <ArrowUpRight className="mb-[0.08em] size-[0.62em] shrink-0 transition-transform duration-700 ease-out-expo group-hover:-translate-y-[0.1em] group-hover:translate-x-[0.1em] rtl:-scale-x-100 rtl:group-hover:-translate-x-[0.1em]" strokeWidth={1.5} aria-hidden="true" />
            </span>
          </TLink>
        </section>
      )}
    </main>
  )
}
