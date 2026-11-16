import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { Suspense, lazy, useRef, useState } from 'react'
import { visibleProjects } from '../../data/projects'
import { useLanguage, useLocalized } from '../../i18n/context'
import { EASE } from '../../lib/motion'
import { INTRO } from '../three/timeline'
import { useWebGL } from '../three/useWebGL'
import { LoadImg } from '../ui/LoadImg'
import { TLink } from '../ui/TLink'

const LaptopScene = lazy(() => import('../three/LaptopScene'))

const project = visibleProjects.find((p) => p.id === 'travelyuk')
const steps = [
  { id: 's1', screen: '/projects/travelyuk-screen-trip.jpg' },
  { id: 's2', screen: '/projects/travelyuk-screen-flights.jpg' },
  { id: 's3', screen: '/projects/travelyuk-screen-messages.jpg' },
] as const
const screens = steps.map((s) => s.screen)

function Actions() {
  const { t } = useLanguage()
  const localize = useLocalized()
  if (!project) return null
  const title = localize(project.title)
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-3 lg:justify-start">
      <TLink to={`/projects/${project.id}`} className="link-go text-[17px]" aria-label={t('work.openDetails', { title })}>
        {t('projects.details')}
        <ChevronRight className="size-4" aria-hidden="true" />
      </TLink>
    </div>
  )
}

/**
 * The web counterpart to the hero: a pinned stage where a 3D laptop opens and steps through the
 * web app's screens while the copy beside it changes. Plain stacked layout without WebGL or
 * under reduced motion.
 */
export function WebWalkthrough() {
  const reduce = useReducedMotion()
  const webgl = useWebGL()
  if (!project) return null
  return webgl && !reduce ? <Pinned /> : <Static />
}

function Pinned() {
  const { t, dir } = useLanguage()
  const localize = useLocalized()
  const sectionRef = useRef<HTMLElement>(null)
  const [step, setStep] = useState(0)
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] })
  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    const next = Math.min(steps.length - 1, Math.floor(Math.max(0, (p - INTRO) / (1 - INTRO)) * steps.length))
    setStep((s) => (s === next ? s : next))
  })
  const railScale = useTransform(scrollYProgress, [INTRO, 1], [0, 1])

  return (
    <section ref={sectionRef} id="web" data-tone="parchment" className="tile themed" style={{ height: `${100 + steps.length * 90}svh` }} aria-labelledby="web-title">
      <div className="sticky top-0 h-svh overflow-hidden">
        <div className="stage-glow pointer-events-none absolute inset-0" aria-hidden="true" />
        <Suspense fallback={null}>
          <LaptopScene eventSource={sectionRef} progress={scrollYProgress} screens={screens} rtl={dir === 'rtl'} />
        </Suspense>

        <div className="shell absolute inset-x-0 bottom-0 flex flex-col items-center pb-[max(1.75rem,4svh)] text-center lg:inset-y-0 lg:items-start lg:justify-center lg:pb-0 lg:text-start">
          <div className="w-full lg:max-w-[min(32rem,40%)]">
            <p className="t-eyebrow" id="web-title">
              {localize(project!.title)} <span className="text-text-2">· {t('web.eyebrow')}</span>
            </p>
            <div className="mt-3 grid" aria-live="polite">
              {steps.map((s, i) => (
                <motion.div
                  key={s.id}
                  aria-hidden={i !== step}
                  initial={false}
                  animate={{ opacity: i === step ? 1 : 0, y: i === step ? 0 : i < step ? -18 : 18 }}
                  transition={{ duration: 0.5, ease: EASE }}
                  className="[grid-area:1/1]"
                >
                  <h2 className="t-display text-balance text-text max-lg:!text-[1.75rem]">{t(`web.steps.${s.id}.title`)}</h2>
                  <p className="t-lead mt-4 text-pretty text-text-2 max-lg:mt-2 max-lg:!text-[1rem]">{t(`web.steps.${s.id}.body`)}</p>
                </motion.div>
              ))}
            </div>
            <div className="mt-6 flex items-center justify-center gap-4 lg:mt-9 lg:justify-start" role="img" aria-label={t('flagship.stepLabel', { current: step + 1, total: steps.length })}>
              <span className="latin t-caption tabular-nums text-text">
                0{step + 1} <span className="text-text-2">/ 0{steps.length}</span>
              </span>
              <span className="h-0.5 w-32 overflow-hidden rounded-full bg-chip">
                <motion.span style={{ scaleX: railScale }} className="block size-full origin-left rounded-full bg-accent rtl:origin-right" />
              </span>
            </div>
            <div className="mt-6 lg:mt-9">
              <Actions />
            </div>
            <p className="t-fine mt-5 text-text-2 max-lg:hidden">{t('web.note')}</p>
          </div>
        </div>
      </div>
    </section>
  )
}

function Static() {
  const { t } = useLanguage()
  const localize = useLocalized()
  return (
    <section id="web" data-tone="parchment" className="tile themed tile-pad" aria-labelledby="web-title">
      <div className="shell">
        <p className="t-eyebrow text-center" id="web-title">
          {localize(project!.title)} <span className="text-text-2">· {t('web.eyebrow')}</span>
        </p>
        <ol className="mt-10 grid gap-x-8 gap-y-14 lg:grid-cols-3">
          {steps.map((s) => (
            <li key={s.id} className="flex flex-col">
              <LoadImg src={s.screen} alt="" loading="lazy" decoding="async" width={1158} height={814} className="product-shadow w-full rounded-xl" />
              <h2 className="t-title mt-7 text-text">{t(`web.steps.${s.id}.title`)}</h2>
              <p className="mt-2 text-pretty text-text-2">{t(`web.steps.${s.id}.body`)}</p>
            </li>
          ))}
        </ol>
        <div className="mt-12 flex justify-center">
          <Actions />
        </div>
      </div>
    </section>
  )
}
