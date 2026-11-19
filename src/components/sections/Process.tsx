import { motion, useInView, useReducedMotion, useScroll, useSpring } from 'framer-motion'
import { useRef } from 'react'
import { useLanguage } from '../../i18n/context'
import { Reveal } from '../ui/Reveal'
import { SectionHeading } from '../ui/SectionHeading'

const stages = ['spec', 'architecture', 'build', 'ship'] as const

function Stage({ id, index }: { id: (typeof stages)[number]; index: number }) {
  const { t } = useLanguage()
  const ref = useRef<HTMLLIElement>(null)
  // A stage counts as reached once its top passes the middle of the screen.
  const reached = useInView(ref, { margin: '0px 0px -50% 0px', once: false })
  return (
    <li ref={ref} className="relative grid grid-cols-1 gap-x-10 gap-y-4 border-t border-hairline py-10 ps-8 lg:grid-cols-12 lg:py-14 lg:ps-0">
      {/* The numeral is drawn in outline and fills in when the stage is reached. */}
      <p aria-hidden="true" className={`latin t-hero transition-[color,-webkit-text-stroke-color] duration-700 lg:col-span-3 lg:ps-14 ${reached ? 'text-accent [-webkit-text-stroke:1.5px_var(--accent)]' : 't-outline'}`}>
        0{index + 1}
      </p>
      <div className="lg:col-span-4">
        <h3 className="t-caption font-semibold text-accent">{t(`process.items.${id}.title`)}</h3>
        <p className="t-display mt-2 text-balance text-text !text-[clamp(1.375rem,1.15rem+0.9vw,2rem)]">{t(`process.items.${id}.lead`)}</p>
      </div>
      <div className="lg:col-span-5">
        <p className="text-pretty text-text-2">{t(`process.items.${id}.body`)}</p>
        <ul className="mt-6 flex flex-wrap gap-2">
          {[0, 1, 2].map((n) => (
            <li key={n} className="rounded-md border border-hairline px-3 py-1.5 text-[14px] text-text">
              {t(`process.items.${id}.points.${n}`)}
            </li>
          ))}
        </ul>
      </div>
    </li>
  )
}

/**
 * The four stages of a build, read top to bottom. A blue line down the start edge is drawn by
 * the scroll, and each stage's numeral fills in as the line reaches it.
 */
export function Process() {
  const { t } = useLanguage()
  const reduce = useReducedMotion()
  const listRef = useRef<HTMLOListElement>(null)
  const { scrollYProgress } = useScroll({ target: listRef, offset: ['start 0.5', 'end 0.5'] })
  const scaleY = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.4 })

  return (
    <section id="process" data-tone="surface" className="sec themed sec-pad scroll-mt-4" aria-labelledby="process-title">
      <div className="shell">
        <SectionHeading id="process-title" eyebrow={t('process.eyebrow')} title={t('process.title')} subtitle={t('process.subtitle')} />
        <Reveal className="relative mt-14 lg:mt-20">
          <span aria-hidden="true" className="absolute inset-y-0 start-0 w-px bg-hairline" />
          <motion.span aria-hidden="true" style={{ scaleY: reduce ? 1 : scaleY }} className="absolute inset-y-0 start-0 w-0.5 origin-top bg-accent" />
          <ol ref={listRef} className="border-b border-hairline">
            {stages.map((id, i) => (
              <Stage key={id} id={id} index={i} />
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  )
}
