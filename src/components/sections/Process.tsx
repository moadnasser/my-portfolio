import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '../../i18n/context'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { SectionHeading } from '../ui/SectionHeading'
import { Tile } from '../ui/Tile'

const stages = ['spec', 'architecture', 'build', 'ship'] as const

function Stage({ id, index }: { id: (typeof stages)[number]; index: number }) {
  const { t } = useLanguage()
  return (
    <article className="bento bento-soft themed flex h-full flex-col p-7 sm:p-10">
      <p className="latin t-hero text-signal !py-0" aria-hidden="true">
        0{index + 1}
      </p>
      <h3 className="t-eyebrow mt-6">{t(`process.items.${id}.title`)}</h3>
      <p className="t-display mt-2 text-balance text-text !text-[clamp(1.75rem,1.2rem+1.6vw,2.5rem)]">{t(`process.items.${id}.lead`)}</p>
      <p className="mt-4 text-pretty text-text-2">{t(`process.items.${id}.body`)}</p>
      <ul className="mt-auto pt-8">
        {[0, 1, 2].map((n) => (
          <li key={n} className="border-t border-hairline py-3 text-[15px] text-text">
            {t(`process.items.${id}.points.${n}`)}
          </li>
        ))}
      </ul>
    </article>
  )
}

/**
 * The four stages of a build. On wide screens the section is pinned and vertical scrolling
 * drives the row sideways (mirrored in Arabic); on small screens, or under reduced motion,
 * it is an ordinary stack.
 */
export function Process() {
  const { t, dir } = useLanguage()
  const reduce = useReducedMotion()
  const wide = useMediaQuery('(min-width: 1024px) and (min-height: 640px)')
  const sectionRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLOListElement>(null)
  const [distance, setDistance] = useState(0)
  const pinned = wide && !reduce

  useEffect(() => {
    const track = trackRef.current
    if (!track || !pinned) return
    const measure = () => setDistance(Math.max(0, track.scrollWidth - track.clientWidth))
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(track)
    return () => ro.disconnect()
  }, [pinned, dir])

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] })
  const smooth = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4 })
  const x = useTransform(smooth, [0.05, 0.95], [0, dir === 'rtl' ? distance : -distance])

  if (!pinned)
    return (
      <Tile id="process" tone="canvas" aria-labelledby="process-title" className="scroll-mt-12">
        <div className="shell">
          <SectionHeading id="process-title" eyebrow={t('process.eyebrow')} title={t('process.title')} subtitle={t('process.subtitle')} />
          <ol className="mt-14 grid gap-5 sm:grid-cols-2">
            {stages.map((id, i) => (
              <li key={id}>
                <Stage id={id} index={i} />
              </li>
            ))}
          </ol>
        </div>
      </Tile>
    )

  return (
    <section ref={sectionRef} id="process" data-tone="canvas" className="tile themed scroll-mt-12" style={{ height: '320svh' }} aria-labelledby="process-title">
      <div className="sticky top-0 flex h-svh flex-col justify-center overflow-hidden pt-12">
        <div className="shell">
          <p className="t-eyebrow">{t('process.eyebrow')}</p>
          <h2 id="process-title" className="t-display mt-2 text-text">
            {t('process.title')}
          </h2>
        </div>
        <motion.ol ref={trackRef} style={{ x }} className="mt-6 flex gap-6 px-[max(3rem,calc((100vw-84rem)/2))] will-change-transform">
          {stages.map((id, i) => (
            <li key={id} className="h-[min(64svh,38rem)] w-[min(42vw,34rem)] shrink-0">
              <Stage id={id} index={i} />
            </li>
          ))}
        </motion.ol>
      </div>
    </section>
  )
}
