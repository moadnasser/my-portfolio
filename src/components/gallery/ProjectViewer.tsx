import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Code2, ExternalLink, X } from 'lucide-react'
import { useCallback, useEffect, useRef } from 'react'
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

export function ProjectViewer({ projects, activeId, onClose, onNavigate }: ProjectViewerProps) {
  const { t, dir } = useLanguage()
  const localize = useLocalized()
  const reduce = useReducedMotion()
  const dialogRef = useRef<HTMLDivElement>(null)
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
    dialogRef.current?.scrollTo({ top: 0 })
  }, [activeId])

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
          <button type="button" aria-label={t('work.close')} onClick={onClose} className="absolute inset-0 cursor-default" style={{ background: 'var(--overlay)' }} />

          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="viewer-title"
            initial={reduce ? false : { opacity: 0, y: 24, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? undefined : { opacity: 0, y: 16, scale: 0.985, transition: { duration: 0.18 } }}
            transition={{ duration: 0.38, ease: EASE }}
            className="themed relative flex max-h-[94dvh] w-full max-w-6xl flex-col overflow-y-auto overscroll-contain rounded-t-[1.75rem] border border-border bg-surface shadow-[0_40px_120px_-40px_rgb(var(--shadow-color)/0.5)] sm:max-h-[90dvh] sm:rounded-[1.75rem]"
          >
            {/* Top bar */}
            <div className="themed sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-border bg-surface/90 px-4 py-3 backdrop-blur sm:px-6">
              <div className="flex items-center gap-2">
                {hasMany && (
                  <>
                    <IconButton onClick={goPrev} label={t('work.previous')}>
                      <ChevronLeft className="size-4 rtl:-scale-x-100" aria-hidden="true" />
                    </IconButton>
                    <IconButton onClick={goNext} label={t('work.next')}>
                      <ChevronRight className="size-4 rtl:-scale-x-100" aria-hidden="true" />
                    </IconButton>
                    <span className="ms-1 text-xs font-semibold tabular-nums text-text-2" aria-live="polite">
                      {t('work.counter', { current: index + 1, total: projects.length })}
                    </span>
                  </>
                )}
              </div>
              <IconButton ref={closeRef} onClick={onClose} label={t('work.close')}>
                <X className="size-4" aria-hidden="true" />
              </IconButton>
            </div>

            <div className="grid grid-cols-1 gap-8 p-4 sm:p-6 lg:grid-cols-12 lg:gap-10 lg:p-8">
              {/* Images */}
              <div className="flex flex-col gap-4 lg:col-span-7" aria-label={t('work.gallery')}>
                {project.galleryImages.map((src, i) => (
                  <figure key={src} className="themed overflow-hidden rounded-card border border-border bg-surface-2">
                    <img
                      src={src}
                      alt={t('work.screenshotAlt', { title: localize(project.title), n: i + 1 })}
                      loading={i === 0 ? 'eager' : 'lazy'}
                      decoding="async"
                      className="mx-auto max-h-[70dvh] w-full object-contain"
                    />
                  </figure>
                ))}
              </div>

              {/* Details */}
              <div className="lg:col-span-5">
                <div className="lg:sticky lg:top-20">
                  <p className="latin text-xs font-semibold uppercase tracking-wider text-text-2">
                    {t(`work.categories.${project.category}`)}
                    {project.year && <span className="text-text-2/70"> · {project.year}</span>}
                  </p>
                  <h2 id="viewer-title" className="font-display mt-2 text-balance text-2xl font-bold tracking-tight text-text sm:text-3xl">
                    {localize(project.title)}
                  </h2>
                  <p className="mt-4 text-pretty text-base leading-relaxed text-text-2">{localize(project.details ?? project.description)}</p>

                  <h3 className="mt-7 text-xs font-semibold uppercase tracking-wider text-text-2">{t('work.technologies')}</h3>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {project.technologies.map((tech) => (
                      <li key={tech} className="latin glass themed rounded-full px-3 py-1 text-xs font-semibold text-text">
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
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
