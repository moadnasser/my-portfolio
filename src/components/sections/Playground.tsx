import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { visibleProjects } from '../../data/projects'
import { hasDemo } from '../../demos/registry'
import { useLanguage } from '../../i18n/context'
import { BuildCard } from '../gallery/BuildCard'
import { Reveal } from '../ui/Reveal'
import { TLink } from '../ui/TLink'
import { SectionHeading } from '../ui/SectionHeading'
import { Tile } from '../ui/Tile'

/** Everything except the two builds that have their own walkthroughs above. Builds with a live demo come first. */
const builds = visibleProjects.filter((p) => p.id !== 'uab-shipping' && p.id !== 'travelyuk').sort((a, b) => Number(hasDemo(b.id)) - Number(hasDemo(a.id)))

const arrow =
  'inline-flex size-11 cursor-pointer items-center justify-center rounded-full bg-chip text-text transition-[transform,opacity,background-color] duration-200 hover:bg-accent hover:text-on-accent active:scale-95 disabled:pointer-events-none disabled:opacity-30'

/**
 * The other builds as a shelf of large cards you swipe through. Native horizontal scrolling with
 * snap points does the work, so it is smooth on touch and trackpads and mirrors itself in Arabic.
 */
export function Playground() {
  const { t, dir } = useLanguage()
  const track = useRef<HTMLUListElement>(null)
  const [edges, setEdges] = useState({ start: true, end: false })

  const measure = useCallback(() => {
    const el = track.current
    if (!el) return
    // scrollLeft runs negative in RTL; the distance from the start edge is what matters.
    const x = Math.abs(el.scrollLeft)
    const max = el.scrollWidth - el.clientWidth
    const next = { start: x < 8, end: x > max - 8 }
    setEdges((e) => (e.start === next.start && e.end === next.end ? e : next))
  }, [])

  useEffect(() => {
    const el = track.current
    if (!el) return
    measure()
    el.addEventListener('scroll', measure, { passive: true })
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', measure)
      ro.disconnect()
    }
  }, [measure, dir])

  const step = (forward: boolean) => {
    const el = track.current
    const card = el?.querySelector<HTMLElement>('[data-card]')
    if (!el || !card) return
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0
    const distance = (card.offsetWidth + gap) * (forward ? 1 : -1) * (dir === 'rtl' ? -1 : 1)
    el.scrollBy({ left: distance, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
  }

  if (!builds.length) return null
  return (
    <Tile id="playground" tone="canvas" aria-labelledby="playground-title" className="scroll-mt-12">
      <div className="shell">
        <SectionHeading id="playground-title" eyebrow={t('playground.eyebrow')} title={t('playground.title')} subtitle={t('playground.subtitle')} />
      </div>

      <Reveal y={40}>
        <ul
          ref={track}
          tabIndex={0}
          aria-label={t('flagship.more')}
          className="no-scrollbar mt-14 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-px-[max(1.25rem,calc((100vw-84rem)/2))] px-[max(1.25rem,calc((100vw-84rem)/2))] pb-2 outline-none md:scroll-px-[max(2rem,calc((100vw-84rem)/2))] md:px-[max(2rem,calc((100vw-84rem)/2))] lg:mt-20 lg:gap-6 xl:scroll-px-[max(3rem,calc((100vw-84rem)/2))] xl:px-[max(3rem,calc((100vw-84rem)/2))]"
        >
          {builds.map((project, i) => (
            <li key={project.id} data-card className="w-[min(86vw,58rem)] shrink-0 snap-start">
              <BuildCard project={project} blue={i % 3 === 1} />
            </li>
          ))}
        </ul>
      </Reveal>

      <div className="shell mt-8 flex items-center justify-between gap-4">
        <TLink to="/projects" className="link-go text-[17px]">
          {t('work.viewAll')}
          <ChevronRight className="size-4" aria-hidden="true" />
        </TLink>
        <div className="flex gap-3">
          <button type="button" onClick={() => step(false)} disabled={edges.start} aria-label={t('flagship.prev')} className={arrow}>
            <ChevronLeft className="size-5 rtl:-scale-x-100" aria-hidden="true" />
          </button>
          <button type="button" onClick={() => step(true)} disabled={edges.end} aria-label={t('flagship.next')} className={arrow}>
            <ChevronRight className="size-5 rtl:-scale-x-100" aria-hidden="true" />
          </button>
        </div>
      </div>
    </Tile>
  )
}
