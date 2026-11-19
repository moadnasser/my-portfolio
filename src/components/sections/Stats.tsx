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
  const seen = useInView(ref, { once: true })
  const reduce = useReducedMotion()
  useEffect(() => {
    const el = ref.current
    if (!el || !seen || reduce) return
    const controls = animate(0, to, { duration: 1.4, delay: 0.9, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => (el.textContent = String(Math.round(v))) })
    return () => controls.stop()
  }, [seen, to, reduce])
  return (
    <span ref={ref} className="latin tabular-nums">
      {to}
    </span>
  )
}

/** Four figures in a row: a compact strip that closes the opening frame. */
export function Stats() {
  const { t } = useLanguage()
  return (
    <dl aria-label={t('stats.label')} className="grid grid-cols-2 gap-x-6 gap-y-6 py-8 lg:grid-cols-4 lg:py-9">
      {figures.map((f) => (
        <div key={f.id} className="flex items-center gap-4">
          <dd className="font-display order-first text-[2rem] font-bold leading-none text-accent lg:text-[2.25rem]">
            <Count to={f.value} />
          </dd>
          <dt className="t-caption max-w-[16ch] text-text-2">{t(`stats.${f.id}`)}</dt>
        </div>
      ))}
    </dl>
  )
}
