import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Maximize2, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState, type SyntheticEvent } from 'react'
import { useLanguage } from '../../i18n/context'
import { EASE } from '../../lib/motion'
import { lockScroll } from '../../lib/scroll'
import { IconButton } from '../ui/Button'
import { LoadImg } from '../ui/LoadImg'

type Kind = 'phone' | 'web'
type Filter = 'all' | Kind

/** First guess from the file name, so the wall has its shape before any image arrives. */
const guess = (src: string) => (src.includes('mobile') || src.includes('uab-') ? 9 / 19.5 : 16 / 10)

/**
 * A project's screenshots as a wall that arranges itself. Each picture is given the room its own
 * proportions ask for (read from the file once it loads), so phone and desktop captures share
 * rows at a common height (250px on phones, 400px on wide screens) that end flush, whatever the mix. When a build has both kinds, a switch narrows the
 * wall to one of them. Any picture opens in a full-screen viewer that steps through the visible
 * set with the arrow keys, the on-screen arrows or a swipe, and closes on Escape or a click
 * outside the picture.
 */
export function ShotGallery({ images, title }: { images: string[]; title: string }) {
  const { t } = useLanguage()
  const reduce = useReducedMotion()
  const [ratios, setRatios] = useState<Record<string, number>>({})
  const [filter, setFilter] = useState<Filter>('all')
  const [open, setOpen] = useState<number | null>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  const opener = useRef<HTMLElement | null>(null)

  const ratio = useCallback((src: string) => ratios[src] ?? guess(src), [ratios])
  const kind = useCallback((src: string): Kind => (ratio(src) < 1 ? 'phone' : 'web'), [ratio])
  const mixed = useMemo(() => new Set(images.map(kind)).size > 1, [images, kind])
  const shown = useMemo(() => (filter === 'all' ? images : images.filter((src) => kind(src) === filter)), [images, filter, kind])
  const alt = (src: string) => t('work.screenshotAlt', { title, n: images.indexOf(src) + 1 })

  const onLoad = (src: string) => (e: SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth: w, naturalHeight: h } = e.currentTarget
    if (w && h) setRatios((r) => (r[src] ? r : { ...r, [src]: w / h }))
  }

  const step = useCallback((by: number) => setOpen((i) => (i === null ? i : (i + by + shown.length) % shown.length)), [shown.length])

  // The viewer is a native modal dialog: focus trap, Escape and the inert page come with it.
  useEffect(() => {
    const el = dialog.current
    if (!el) return
    if (open !== null && !el.open) {
      el.showModal()
      return lockScroll()
    }
    if (open === null && el.open) el.close()
  }, [open])
  useEffect(() => {
    if (open === null) return
    const onKey = (e: KeyboardEvent) => {
      // The strip of pictures is always laid out left to right, so the keys are too.
      if (e.key === 'ArrowRight') step(1)
      if (e.key === 'ArrowLeft') step(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, step])

  const current = open !== null ? shown[open] : null
  const filters: Filter[] = ['all', 'phone', 'web']
  const label = { all: t('work.allShots'), phone: t('work.phoneShots'), web: t('work.webShots') }

  return (
    <div>
      {mixed && (
        <div role="group" aria-label={t('work.gallery')} className="mb-6 inline-flex rounded-full border border-hairline p-1">
          {filters.map((f) => (
            <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)} className={`relative cursor-pointer rounded-full px-4 py-2 text-sm transition-colors duration-300 ${filter === f ? 'text-on-accent' : 'text-text-2 hover:text-text'}`}>
              {filter === f && <motion.span layoutId="shot-filter" className="absolute inset-0 rounded-full bg-accent" transition={reduce ? { duration: 0 } : { duration: 0.45, ease: EASE }} aria-hidden="true" />}
              <span className="relative">
                {label[f]}
                <span className="latin t-code ms-1.5 opacity-70">{f === 'all' ? images.length : images.filter((s) => kind(s) === f).length}</span>
              </span>
            </button>
          ))}
        </div>
      )}

      <ul dir="ltr" className="flex flex-wrap gap-3 sm:gap-4 [--row:250px] lg:[--row:400px]">
        <AnimatePresence mode="popLayout" initial={false}>
          {shown.map((src, i) => {
            const r = ratio(src)
            return (
              <motion.li
                key={src}
                layout={reduce ? false : 'position'}
                initial={reduce ? false : { opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduce ? undefined : { opacity: 0, scale: 0.94, transition: { duration: 0.2 } }}
                transition={{ duration: 0.5, ease: EASE }}
                // Grow in proportion to the picture's width at the row height: a justified row.
                style={{ flexGrow: r, flexBasis: `calc(var(--row) * ${r})`, aspectRatio: String(r) }}
                className="min-w-0 max-lg:max-h-[22rem] lg:max-h-[34rem]"
              >
                <button
                  type="button"
                  onClick={(e) => {
                    opener.current = e.currentTarget
                    setOpen(i)
                  }}
                  aria-label={t('work.openShot', { n: images.indexOf(src) + 1 })}
                  data-cursor="view"
                  data-cursor-label={t('cursor.open')}
                  className={`shot group relative block size-full cursor-pointer overflow-hidden ${r < 1 ? 'shot-phone' : ''}`}
                >
                  <LoadImg src={src} alt={alt(src)} loading="lazy" decoding="async" draggable={false} onLoad={onLoad(src)} style={{ height: '100%' }} className="size-full object-cover object-top transition-transform duration-700 ease-out-expo group-hover:scale-[1.03]" />
                  <span className="absolute end-3 top-3 grid size-9 place-items-center rounded-full bg-black/55 text-white opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 touch:opacity-100" aria-hidden="true">
                    <Maximize2 className="size-4" />
                  </span>
                </button>
              </motion.li>
            )
          })}
        </AnimatePresence>
        {/* Soaks up the spare width of a short last row, so its pictures keep their size. */}
        <li aria-hidden="true" className="h-0 grow-[100]" />
      </ul>

      <dialog
        ref={dialog}
        aria-label={t('work.gallery')}
        onClose={() => {
          setOpen(null)
          opener.current?.focus()
        }}
        onClick={(e) => e.target === e.currentTarget && dialog.current?.close()}
        className="viewer m-0 size-full max-h-none max-w-none bg-transparent p-0 text-white"
      >
        {current && (
          <div className="flex size-full flex-col" dir="ltr" onClick={(e) => e.target === e.currentTarget && dialog.current?.close()}>
            <div className="flex items-center justify-between gap-4 p-4 sm:p-6">
              <p className="t-code tabular-nums text-white/80" aria-live="polite">
                {t('work.counter', { current: String((open ?? 0) + 1).padStart(2, '0'), total: String(shown.length).padStart(2, '0') })}
              </p>
              <IconButton label={t('work.close')} onClick={() => dialog.current?.close()} className="!border-white/25 !text-white hover:!bg-white hover:!text-black">
                <X className="size-5" aria-hidden="true" />
              </IconButton>
            </div>
            <div className="relative flex min-h-0 grow items-center justify-center px-4 pb-4 sm:px-20 sm:pb-8" onClick={(e) => e.target === e.currentTarget && dialog.current?.close()}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.img
                  key={current}
                  src={current}
                  alt={alt(current)}
                  draggable={false}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease: EASE }}
                  drag={shown.length > 1 && !reduce ? 'x' : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.3}
                  onDragEnd={(_, info) => Math.abs(info.offset.x) > 70 && step(info.offset.x < 0 ? 1 : -1)}
                  style={{ height: 'auto' }}
                  className={`max-h-full max-w-full object-contain shadow-[0_40px_120px_rgb(0_0_0/0.6)] ${ratio(current) < 1 ? 'rounded-[2rem]' : 'rounded-[1.25rem]'}`}
                />
              </AnimatePresence>
              {shown.length > 1 && (
                <>
                  <IconButton label={t('work.prevShot')} onClick={() => step(-1)} className="absolute left-3 top-1/2 -translate-y-1/2 !border-white/25 !bg-black/40 !text-white backdrop-blur hover:!bg-white hover:!text-black max-sm:top-auto max-sm:bottom-3 max-sm:translate-y-0">
                    <ArrowLeft className="size-4" aria-hidden="true" />
                  </IconButton>
                  <IconButton label={t('work.nextShot')} onClick={() => step(1)} className="absolute right-3 top-1/2 -translate-y-1/2 !border-white/25 !bg-black/40 !text-white backdrop-blur hover:!bg-white hover:!text-black max-sm:top-auto max-sm:bottom-3 max-sm:translate-y-0">
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </IconButton>
                </>
              )}
            </div>
          </div>
        )}
      </dialog>
    </div>
  )
}
