import { animate, useInView, useReducedMotion } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { visibleProjects } from '../../data/projects'
import { technologies } from '../../data/technologies'
import { hasDemo } from '../../demos/registry'
import { useLanguage } from '../../i18n/context'

/** Every figure is counted from the site's own data, so it cannot drift from what the pages show. */
const figures = [
  { id: 'projects', value: visibleProjects.length },
  { id: 'demos', value: visibleProjects.filter((p) => hasDemo(p.id)).length },
  { id: 'languages', value: 2 },
  { id: 'tech', value: technologies.length },
] as const

function Count({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const seen = useInView(ref, { once: true, margin: '0px 0px -15% 0px' })
  const reduce = useReducedMotion()
  useEffect(() => {
    const el = ref.current
    if (!el || !seen || reduce) return
    const controls = animate(0, to, { duration: 1.1, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => (el.textContent = String(Math.round(v))) })
    return () => controls.stop()
  }, [seen, to, reduce])
  return (
    <span ref={ref} className="latin tabular-nums">
      {to}
    </span>
  )
}

/** A quiet band of four numbers between the two walkthroughs. */
export function Stats() {
  const { t } = useLanguage()
  return (
    <section data-tone="canvas" className="tile themed py-14 sm:py-20" aria-label={t('stats.label')}>
      <dl className="shell grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
        {figures.map((f) => (
          <div key={f.id} className="flex flex-col-reverse items-center gap-1 text-center">
            <dt className="t-caption max-w-[14ch] text-text-2">{t(`stats.${f.id}`)}</dt>
            <dd className="t-hero text-signal !py-0">
              <Count to={f.value} />
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
