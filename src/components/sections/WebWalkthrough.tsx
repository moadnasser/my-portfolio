import { motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { useRef, useState } from 'react'
import { visibleProjects } from '../../data/projects'
import { useLanguage, useLocalized } from '../../i18n/context'
import { CINE, EASE } from '../../lib/motion'
import { LoadImg } from '../ui/LoadImg'
import { Reveal } from '../ui/Reveal'
import { StepCopy } from '../ui/StepCopy'
import { TLink } from '../ui/TLink'

const project = visibleProjects.find((p) => p.id === 'travelyuk')
const steps = [
  { id: 's1', screen: '/projects/travelyuk-screen-trip.jpg' },
  { id: 's2', screen: '/projects/travelyuk-screen-flights.jpg' },
  { id: 's3', screen: '/projects/travelyuk-screen-messages.jpg' },
] as const
/** The captures are all 1158×814. */
const SHOT = { w: 1158, h: 814 }

function useStepCopy() {
  const { t } = useLanguage()
  return steps.map((s) => ({ id: s.id, title: t(`web.steps.${s.id}.title`), body: t(`web.steps.${s.id}.body`) }))
}

function Actions() {
  const { t } = useLanguage()
  const localize = useLocalized()
  if (!project) return null
  const title = localize(project.title)
  return (
    <TLink to={`/projects/${project.id}`} className="link-go" aria-label={t('work.openDetails', { title })}>
      {t('projects.details')}
      <ArrowUpRight className="size-4" aria-hidden="true" />
    </TLink>
  )
}

/**
 * The web counterpart to the flagship stage: a pinned reel. The screen stays in place while each
 * new capture wipes up over the last one and the copy beside it changes with it; the whole plate
 * turns a few degrees as the reel runs. Plain stacked layout under reduced motion.
 */
export function WebWalkthrough() {
  const reduce = useReducedMotion()
  if (!project) return null
  return reduce ? <Static /> : <Pinned />
}

function Pinned() {
  const { t, dir } = useLanguage()
  const localize = useLocalized()
  const copy = useStepCopy()
  const sectionRef = useRef<HTMLElement>(null)
  const [step, setStep] = useState(0)
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] })
  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    const next = Math.min(steps.length - 1, Math.floor(p * steps.length))
    setStep((s) => (s === next ? s : next))
  })
  const smooth = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.6 })
  const side = dir === 'rtl' ? -1 : 1
  const rotateY = useTransform(smooth, [0, 1], [-9 * side, 5 * side])
  const rotateX = useTransform(smooth, [0, 1], [5, -2])
  const title = localize(project!.title)

  return (
    <section ref={sectionRef} id="web" data-tone="surface" className="sec themed" style={{ height: `${100 + steps.length * 75}svh` }} aria-labelledby="web-title">
      <div className="sticky top-0 flex h-svh items-center overflow-hidden">
        <div className="shell grid grid-cols-1 items-center gap-x-14 gap-y-8 lg:grid-cols-12">
          <div className="order-2 text-center lg:order-1 lg:col-span-4 lg:text-start">
            <h2 id="web-title" className="t-eyebrow">
              <span className="font-semibold text-text">{title}</span>
              <span className="opacity-50" aria-hidden="true">/</span>
              {t('web.eyebrow')}
            </h2>
            <div className="mt-4">
              <StepCopy steps={copy} step={step} label={t('flagship.stepLabel', { current: step + 1, total: steps.length })} />
            </div>
            <div className="mt-6 flex justify-center lg:mt-9 lg:justify-start">
              <Actions />
            </div>
            <p className="t-fine mt-5 text-text-2 max-lg:hidden">{t('web.note')}</p>
          </div>

          <div className="order-1 [perspective:1600px] lg:order-2 lg:col-span-8" dir="ltr">
            <motion.div style={{ rotateY, rotateX, aspectRatio: `${SHOT.w} / ${SHOT.h}` }} className="shot relative mx-auto max-h-[46svh] overflow-hidden will-change-transform lg:max-h-[74svh]">
              {steps.map((s, i) => (
                <motion.div
                  key={s.id}
                  aria-hidden={i !== step}
                  initial={false}
                  animate={{ clipPath: i <= step ? 'inset(0% 0% 0% 0%)' : 'inset(100% 0% 0% 0%)' }}
                  transition={{ duration: 0.95, ease: CINE }}
                  className="absolute inset-0"
                >
                  <motion.img
                    src={s.screen}
                    alt=""
                    width={SHOT.w}
                    height={SHOT.h}
                    loading={i === 0 ? 'eager' : 'lazy'}
                    decoding="async"
                    initial={false}
                    animate={{ scale: i === step ? 1 : i < step ? 1 : 1.16 }}
                    transition={{ duration: 1.3, ease: EASE }}
                    className="size-full object-cover object-top"
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Static() {
  const { t } = useLanguage()
  const localize = useLocalized()
  const copy = useStepCopy()
  return (
    <section id="web" data-tone="surface" className="sec themed sec-pad" aria-labelledby="web-title">
      <div className="shell">
        <p className="t-eyebrow">{t('web.eyebrow')}</p>
        <h2 id="web-title" className="t-hero mt-3 text-text">
          {localize(project!.title)}
        </h2>
        <ol className="mt-12 grid gap-x-8 gap-y-14 lg:grid-cols-3">
          {copy.map((s, i) => (
            <li key={s.id}>
              <Reveal delay={i * 0.06}>
                <LoadImg src={steps[i].screen} alt="" loading="lazy" decoding="async" width={SHOT.w} height={SHOT.h} className="shot w-full" />
                <p className="t-code mt-6 text-accent">0{i + 1}</p>
                <h3 className="t-title mt-2 text-text">{s.title}</h3>
                <p className="mt-2 text-pretty text-text-2">{s.body}</p>
              </Reveal>
            </li>
          ))}
        </ol>
        <div className="mt-12">
          <Actions />
        </div>
      </div>
    </section>
  )
}
