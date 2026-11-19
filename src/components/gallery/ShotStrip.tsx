import { useReducedMotion } from 'framer-motion'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react'
import { useLanguage } from '../../i18n/context'
import { IconButton } from '../ui/Button'
import { LoadImg } from '../ui/LoadImg'

/**
 * A project's screenshots as one long strip at a common height, phone and desktop captures side
 * by side at their true proportions. Native scroll does the work (swipe, trackpad, arrow keys);
 * mouse users can drag. A counter and a rail show how far along the strip you are.
 * The strip is always LTR so scroll maths stays the same in Arabic.
 */
export function ShotStrip({ images, altFor, label }: { images: string[]; altFor: (i: number) => string; label: string }) {
  const { t } = useLanguage()
  const reduce = useReducedMotion()
  const trackRef = useRef<HTMLDivElement>(null)
  const railRef = useRef<HTMLSpanElement>(null)
  const [edges, setEdges] = useState({ start: true, end: false })
  const [current, setCurrent] = useState(0)

  const slides = () => Array.from(trackRef.current?.querySelectorAll<HTMLElement>('[data-slide]') ?? [])

  const update = useCallback(() => {
    const track = trackRef.current
    if (!track) return
    const max = track.scrollWidth - track.clientWidth
    const next = { start: track.scrollLeft < 4, end: track.scrollLeft > max - 4 }
    setEdges((e) => (e.start === next.start && e.end === next.end ? e : next))
    // The rail is written straight to the DOM so scrolling never re-renders the strip.
    if (railRef.current) railRef.current.style.transform = `scaleX(${max > 0 ? Math.max(0.04, track.scrollLeft / max) : 1})`
    // The slide whose centre is nearest the middle of the strip is the current one.
    const mid = track.scrollLeft + track.clientWidth / 2
    let best = 0
    let distance = Infinity
    slides().forEach((el, i) => {
      const d = Math.abs(el.offsetLeft + el.offsetWidth / 2 - mid)
      if (d < distance) {
        distance = d
        best = i
      }
    })
    setCurrent((c) => (c === best ? c : best))
  }, [])

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    let frame = 0
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(() => ((frame = 0), update()))
    }
    const ro = new ResizeObserver(update)
    ro.observe(track)
    track.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      ro.disconnect()
      track.removeEventListener('scroll', onScroll)
    }
  }, [update])

  const step = (dir: 1 | -1) => {
    const track = trackRef.current
    if (!track) return
    const lefts = slides().map((el) => el.offsetLeft - parseFloat(getComputedStyle(track).scrollPaddingLeft || '0'))
    const target = dir > 0 ? lefts.find((l) => l > track.scrollLeft + 8) : lefts.findLast((l) => l < track.scrollLeft - 8)
    if (target !== undefined) track.scrollTo({ left: target, behavior: reduce ? 'auto' : 'smooth' })
  }

  // Mouse drag; touch and trackpads already scroll natively.
  const drag = useRef<{ x: number; left: number } | null>(null)
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return
    const track = e.currentTarget
    drag.current = { x: e.clientX, left: track.scrollLeft }
    track.style.scrollSnapType = 'none'
    track.setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (drag.current) e.currentTarget.scrollLeft = drag.current.left - (e.clientX - drag.current.x)
  }
  const endDrag = (e: PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return
    drag.current = null
    // Restoring snap lets the browser settle on the nearest slide.
    e.currentTarget.style.scrollSnapType = ''
  }

  const gutter = 'max(1.25rem,calc((100vw-92rem)/2))'
  return (
    <div dir="ltr">
      <div
        ref={trackRef}
        role="region"
        aria-roledescription="carousel"
        aria-label={label}
        tabIndex={0}
        data-cursor={t('cursor.drag')}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        style={{ paddingInline: gutter, scrollPaddingInline: gutter }}
        className="no-scrollbar flex snap-x snap-proximity items-end gap-4 overflow-x-auto py-4 outline-none focus-visible:ring-2 focus-visible:ring-accent/60 sm:gap-6 md:cursor-grab md:active:cursor-grabbing"
      >
        {images.map((src, i) => {
          const phone = src.includes('mobile') || src.includes('uab-')
          return (
            <figure key={src} data-slide className={`shot h-[clamp(17rem,62svh,38rem)] shrink-0 snap-start overflow-hidden ${phone ? 'shot-phone' : ''}`}>
              <LoadImg
                src={src}
                alt={altFor(i)}
                loading="lazy"
                decoding="async"
                draggable={false}
                onLoad={update}
                // Inline: the global `img { height: auto }` rule is unlayered and beats utilities.
                style={{ height: '100%', width: 'auto', maxWidth: 'none' }}
                className={`block select-none ${phone ? '[&:not([data-loaded])]:aspect-[9/19.5]' : '[&:not([data-loaded])]:aspect-[16/10]'}`}
              />
            </figure>
          )
        })}
      </div>

      <div className="shell mt-6 flex items-center gap-6">
        <span className="t-code tabular-nums text-text" aria-live="polite">
          {t('work.counter', { current: String(current + 1).padStart(2, '0'), total: String(images.length).padStart(2, '0') })}
        </span>
        <span className="h-px grow bg-hairline" aria-hidden="true">
          <span ref={railRef} className="block h-0.5 origin-left -translate-y-px bg-accent transition-transform duration-300 ease-out" style={{ transform: 'scaleX(0.04)' }} />
        </span>
        <div className="flex gap-2">
          <IconButton label={t('work.prevShot')} onClick={() => step(-1)} disabled={edges.start} className="disabled:pointer-events-none disabled:opacity-35">
            <ArrowLeft className="size-4" aria-hidden="true" />
          </IconButton>
          <IconButton label={t('work.nextShot')} onClick={() => step(1)} disabled={edges.end} className="disabled:pointer-events-none disabled:opacity-35">
            <ArrowRight className="size-4" aria-hidden="true" />
          </IconButton>
        </div>
      </div>
    </div>
  )
}
