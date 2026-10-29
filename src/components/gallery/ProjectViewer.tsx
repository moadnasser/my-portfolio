import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Code2, ExternalLink, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { Project } from '../../data/types'
import { useLanguage, useLocalized } from '../../i18n/context'
import { ButtonLink, IconButton } from '../ui/Button'
import { EASE } from '../../lib/motion'

interface ProjectViewerProps {
  projects: Project[]
  activeId: string | null
  onClose: () => void
  onNavigate: (id: string) => void
}

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'

/** One screenshot at its natural proportions. Portrait (phone) shots are narrowed so they read at a sensible size. */
function Shot({ src, alt, eager }: { src: string; alt: string; eager: boolean }) {
  const [portrait, setPortrait] = useState(false)
  return (
    <figure className={`themed overflow-hidden rounded-2xl border border-border bg-bg shadow-[0_30px_60px_-30px_rgb(var(--shadow-color)/0.7)] ${portrait ? 'mx-auto w-full max-w-[20rem] sm:max-w-[22rem]' : 'w-full'}`}>
      <img
        src={src}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={(e) => setPortrait(e.currentTarget.naturalHeight > e.currentTarget.naturalWidth)}
        className="block h-auto w-full"
      />
    </figure>
  )
}

export function ProjectViewer({ projects, activeId, onClose, onNavigate }: ProjectViewerProps) {
  const { t, dir } = useLanguage()
  const localize = useLocalized()
  const reduce = useReducedMotion()
  const dialogRef = useRef<HTMLDivElement>(null)
  const scrollerRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  const index = projects.findIndex((p) => p.id === activeId)
  const project = index >= 0 ? projects[index] : null
  const hasMany = projects.length > 1

  const goPrev = useCallback(() => {
    if (!hasMany) return
    onNavigate(projects[(index - 1 + projects.length) % projects.length].id)
  }, [hasMany, index, onNavigate, projects])
  const goNext = useCallback(() => {
    if (!hasMany) return
    onNavigate(projects[(index + 1) % projects.length].id)
  }, [hasMany, index, onNavigate, projects])

  // Keyboard: Escape closes, arrows navigate (direction-aware), Tab is trapped.
  useEffect(() => {
    if (!project) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      } else if (e.key === 'ArrowRight') {
        if (dir === 'rtl') goPrev()
        else goNext()
      } else if (e.key === 'ArrowLeft') {
        if (dir === 'rtl') goNext()
        else goPrev()
      } else if (e.key === 'Tab' && dialogRef.current) {
        const nodes = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((n) => n.offsetParent !== null)
        if (nodes.length === 0) return
        const first = nodes[0]
        const last = nodes[nodes.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [project, onClose, goNext, goPrev, dir])

  // Scroll lock + initial focus.
  useEffect(() => {
    if (!project) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const id = window.setTimeout(() => closeRef.current?.focus(), 30)
    return () => {
      document.body.style.overflow = prevOverflow
      window.clearTimeout(id)
    }
  }, [project])

  // Reset scroll position of the panel when the project changes.
  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: 0 })
  }, [activeId])

  const title = project ? localize(project.title) : ''

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          key="viewer"
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.22 }}
        >
          <button
            type="button"
            aria-label={t('work.close')}
            onClick={onClose}
            className="absolute inset-0 cursor-default backdrop-blur-md"
            style={{ background: 'var(--overlay)' }}
          />

          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="viewer-title"
            initial={reduce ? false : { opacity: 0, y: 28, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? undefined : { opacity: 0, y: 18, scale: 0.98, transition: { duration: 0.18 } }}
            transition={{ duration: 0.4, ease: EASE }}
            className="themed relative flex max-h-[94dvh] w-full max-w-6xl flex-col overflow-hidden rounded-t-[1.75rem] border border-[var(--glass-border)] bg-surface shadow-[0_60px_140px_-40px_rgb(var(--shadow-color)/0.7)] sm:max-h-[90dvh] sm:rounded-[1.75rem]"
          >
            <IconButton ref={closeRef} onClick={onClose} label={t('work.close')} className="absolute end-4 top-4 z-20">
              <X className="size-4" aria-hidden="true" />
            </IconButton>

            <div ref={scrollerRef} className="grid min-h-0 flex-1 grid-cols-1 overflow-y-auto overscroll-contain lg:grid-cols-12">
              {/* Stage: screenshots floating on a lit surface */}
              <div className="relative isolate bg-surface-2 p-4 pt-16 sm:p-6 sm:pt-16 lg:col-span-7 lg:p-8 lg:pt-8" aria-label={t('work.gallery')}>
                <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
                  <div className="ambient -top-20 start-[-10%] h-72 w-72" style={{ background: 'var(--glow-a)' }} />
                  <div className="ambient -bottom-24 end-[-10%] h-80 w-80" style={{ background: 'var(--glow-b)' }} />
                </div>
                <div className="flex flex-col gap-6">
                  {project.galleryImages.map((src, i) => (
                    <Shot key={src} src={src} alt={t('work.screenshotAlt', { title, n: i + 1 })} eager={i === 0} />
                  ))}
                </div>
              </div>

              {/* Details */}
              <div className="flex flex-col p-6 sm:p-8 lg:sticky lg:top-0 lg:col-span-5 lg:max-h-[90dvh] lg:self-start lg:overflow-y-auto lg:p-10 lg:pe-16">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="latin inline-flex items-center gap-1.5 rounded-full bg-accent/12 px-3 py-1 text-xs font-semibold text-accent">
                    <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
                    {t(`work.categories.${project.category}`)}
                  </span>
                  {project.year && <span className="latin glass rounded-full px-3 py-1 text-xs font-semibold text-text-2">{project.year}</span>}
                </div>
                <h2 id="viewer-title" className="font-display mt-5 text-balance text-3xl font-bold leading-[1.05] tracking-[-0.02em] text-text sm:text-4xl">
                  {title}
                </h2>
                <p className="mt-5 text-pretty text-base leading-relaxed text-text-2">{localize(project.details ?? project.description)}</p>

                <h3 className="mt-8 text-xs font-semibold uppercase tracking-[0.18em] text-text-2">{t('work.technologies')}</h3>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {project.technologies.map((tech) => (
                    <li key={tech} className="latin glass themed rounded-full px-3 py-1.5 text-xs font-semibold text-text">
                      {tech}
                    </li>
                  ))}
                </ul>

                {(project.liveUrl || project.sourceUrl) && (
                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    {project.liveUrl && (
                      <ButtonLink href={project.liveUrl} external size="md">
                        <ExternalLink className="size-4" aria-hidden="true" />
                        {t('work.viewLive')}
                      </ButtonLink>
                    )}
                    {project.sourceUrl && (
                      <ButtonLink href={project.sourceUrl} external variant="secondary" size="md">
                        <Code2 className="size-4" aria-hidden="true" />
                        {t('work.viewSource')}
                      </ButtonLink>
                    )}
                  </div>
                )}

                {hasMany && (
                  <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-6 lg:pt-8">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] tabular-nums text-text-2" aria-live="polite">
                      {t('work.counter', { current: index + 1, total: projects.length })}
                    </span>
                    <div className="flex items-center gap-2">
                      <IconButton onClick={goPrev} label={t('work.previous')}>
                        <ChevronLeft className="size-4 rtl:-scale-x-100" aria-hidden="true" />
                      </IconButton>
                      <IconButton onClick={goNext} label={t('work.next')}>
                        <ChevronRight className="size-4 rtl:-scale-x-100" aria-hidden="true" />
                      </IconButton>
                    </div>
                  </div>
                )}
                <div className="mt-8" aria-hidden="true" />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
