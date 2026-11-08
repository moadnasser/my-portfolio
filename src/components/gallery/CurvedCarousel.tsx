import { useReducedMotion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react'
import { useLanguage } from '../../i18n/context'
import { IconButton } from '../ui/Button'
import { LoadImg } from '../ui/LoadImg'

/** Max tilt (deg) and growth for a slide one half-width away from the centre. */
const TILT = 34
const GROW = 0.14

/**
 * Screenshots on the inside of a cylinder: slides turn towards the centre and grow as they
 * near the edges. Native scroll does the work (swipe, trackpad, arrow keys); mouse users can
 * drag. Transforms are written straight to the DOM on scroll so nothing re-renders.
 * The strip is always LTR so scroll maths stays the same in Arabic. Flat under reduced motion.
 */
export function CurvedCarousel({ images, altFor, label }: { images: string[]; altFor: (i: number) => string; label: string }) {
  const { t } = useLanguage()
  const reduce = useReducedMotion()
  const trackRef = useRef<HTMLDivElement>(null)
  const touched = useRef(false)
  const [edges, setEdges] = useState({ start: true, end: false })

  const slides = () => Array.from(trackRef.current?.querySelectorAll<HTMLElement>('[data-slide]') ?? [])

  const update = useCallback(() => {
    const track = trackRef.current
    if (!track) return
    const half = track.clientWidth / 2
    for (const el of slides()) {
      if (reduce) {
        el.style.transform = ''
        continue
      }
      // offsetLeft ignores transforms, so reading it never feeds back into the effect.
      const d = Math.max(-1.5, Math.min(1.5, (el.offsetLeft + el.offsetWidth / 2 - track.scrollLeft - half) / half))
      el.style.transform = `rotateY(${(-d * TILT).toFixed(2)}deg) scale(${(1 + Math.abs(d) * GROW).toFixed(3)})`
    }
    const max = track.scrollWidth - track.clientWidth
    const next = { start: track.scrollLeft < 4, end: track.scrollLeft > max - 4 }
    setEdges((e) => (e.start === next.start && e.end === next.end ? e : next))
  }, [reduce])

  /** Until the visitor moves it, keep the strip centred while images load and change size. */
  const recentre = useCallback(() => {
    const track = trackRef.current
    if (track && !touched.current) track.scrollLeft = (track.scrollWidth - track.clientWidth) / 2
    update()
  }, [update])

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    let frame = 0
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(() => ((frame = 0), update()))
    }
    const ro = new ResizeObserver(recentre)
    ro.observe(track)
    track.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      ro.disconnect()
      track.removeEventListener('scroll', onScroll)
    }
  }, [update, recentre])

  const step = (dir: 1 | -1) => {
    const track = trackRef.current
    if (!track) return
    touched.current = true
    const mid = track.scrollLeft + track.clientWidth / 2
    const centres = slides().map((el) => el.offsetLeft + el.offsetWidth / 2)
    const target = dir > 0 ? centres.find((c) => c > mid + 8) : centres.findLast((c) => c < mid - 8)
    if (target !== undefined) track.scrollTo({ left: target - track.clientWidth / 2, behavior: reduce ? 'auto' : 'smooth' })
  }

  // Mouse drag; touch and trackpads already scroll natively.
  const drag = useRef<{ x: number; left: number } | null>(null)
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return
    const track = e.currentTarget
    drag.current = { x: e.clientX, left: track.scrollLeft }
    touched.current = true
    track.style.scrollSnapType = 'none'
    track.setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (drag.current) e.currentTarget.scrollLeft = drag.current.left - (e.clientX - drag.current.x)
  }
  const endDrag = (e: PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return
    drag.current = null
    const track = e.currentTarget
    // Restoring snap lets the browser settle on the nearest slide.
    track.style.scrollSnapType = ''
  }

  return (
    <div dir="ltr">
      <div className="[mask-image:linear-gradient(to_right,transparent,#000_7%,#000_93%,transparent)]">
        <div
          ref={trackRef}
          role="region"
          aria-roledescription="carousel"
          aria-label={label}
          tabIndex={0}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onWheel={() => (touched.current = true)}
          onTouchStart={() => (touched.current = true)}
          onKeyDown={() => (touched.current = true)}
          className="no-scrollbar relative flex snap-x snap-mandatory items-center gap-4 overflow-x-auto px-[max(1.5rem,calc(50%-7rem))] py-10 outline-none [perspective:1100px] focus-visible:ring-2 focus-visible:ring-accent/60 sm:gap-9 md:cursor-grab md:active:cursor-grabbing"
        >
          {images.map((src, i) => (
            <figure
              key={src}
              data-slide
              className="h-[clamp(15rem,52vw,26rem)] shrink-0 snap-center overflow-hidden rounded-2xl border border-border bg-bg shadow-[0_30px_60px_-30px_rgb(var(--shadow-color)/0.7)] will-change-transform"
            >
              <LoadImg src={src} alt={altFor(i)} loading="lazy" decoding="async" draggable={false} onLoad={recentre}
                // Inline: the global `img { height: auto }` rule is unlayered and beats utilities.
                style={{ height: '100%', width: 'auto', maxWidth: 'none' }}
                className={`block select-none ${src.includes('mobile') || src.includes('uab-') ? '[&:not([data-loaded])]:aspect-[9/19]' : '[&:not([data-loaded])]:aspect-[16/10]'}`}
              />
            </figure>
          ))}
        </div>
      </div>
      <div className="mt-1 flex items-center justify-center gap-3">
        <IconButton label={t('work.prevShot')} onClick={() => step(-1)} disabled={edges.start} className="disabled:pointer-events-none disabled:opacity-40">
          <ChevronLeft className="size-4" aria-hidden="true" />
        </IconButton>
        <IconButton label={t('work.nextShot')} onClick={() => step(1)} disabled={edges.end} className="disabled:pointer-events-none disabled:opacity-40">
          <ChevronRight className="size-4" aria-hidden="true" />
        </IconButton>
      </div>
    </div>
  )
}
