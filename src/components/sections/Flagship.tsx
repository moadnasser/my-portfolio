import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { Suspense, lazy, useRef, useState } from 'react'
import { visibleProjects } from '../../data/projects'
import { useLanguage, useLocalized } from '../../i18n/context'
import { INTRO } from '../three/timeline'
import { useWebGL } from '../three/useWebGL'
import { DemoLink } from '../ui/DemoLink'
import { LoadImg } from '../ui/LoadImg'
import { Reveal } from '../ui/Reveal'
import { RiseText } from '../ui/RiseText'
import { StepCopy } from '../ui/StepCopy'
import { TLink } from '../ui/TLink'

const PhoneScene = lazy(() => import('../three/PhoneScene'))

/** The flagship build and the screens its walkthrough steps through, in order. */
const flagship = visibleProjects.find((p) => p.id === 'uab-shipping')
const steps = [
  { id: 's1', screen: '/projects/uab-home.jpg' },
  { id: 's2', screen: '/projects/uab-create-order.jpg' },
  { id: 's3', screen: '/projects/uab-live-map.jpg' },
  { id: 's4', screen: '/projects/uab-pricing.jpg' },
] as const
const screens = steps.map((s) => s.screen)

function useStepCopy() {
  const { t } = useLanguage()
  return steps.map((s) => ({ id: s.id, title: t(`flagship.steps.${s.id}.title`), body: t(`flagship.steps.${s.id}.body`) }))
}

function Actions({ center = false }: { center?: boolean }) {
  const { t } = useLanguage()
  const localize = useLocalized()
  if (!flagship) return null
  const title = localize(flagship.title)
  return (
    <div className={`flex flex-wrap items-center gap-x-6 gap-y-3 ${center ? 'justify-center lg:justify-start' : ''}`}>
      <DemoLink projectId={flagship.id} title={title} />
      <TLink to={`/projects/${flagship.id}`} className="link-go" aria-label={t('work.openDetails', { title })}>
        {t('projects.details')}
        <ArrowUpRight className="size-4" aria-hidden="true" />
      </TLink>
    </div>
  )
}

/**
 * The flagship build on a graphite stage that stays dark in both themes. The section is several
 * screens tall and its stage is pinned: the title holds the frame while a 3D phone rises from
 * below, then the phone stands beside the copy and makes one full turn per step, coming back
 * round with the next screen of the app. It can be dragged sideways to spin it by hand.
 * Without WebGL, or under reduced motion, the same content is laid out as a plain sequence.
 */
export function Flagship() {
  const reduce = useReducedMotion()
  const webgl = useWebGL()
  if (!flagship) return null
  return webgl && !reduce ? <Pinned /> : <Static />
}

function Pinned() {
  const { t, dir } = useLanguage()
  const localize = useLocalized()
  const copy = useStepCopy()
  const [ready, setReady] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const grabRef = useRef<HTMLDivElement>(null)
  const [step, setStep] = useState(0)
  const [phase, setPhase] = useState<'title' | 'steps'>('title')
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] })

  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    const next = Math.min(steps.length - 1, Math.floor(Math.max(0, (p - INTRO) / (1 - INTRO)) * steps.length))
    setStep((s) => (s === next ? s : next))
    setPhase(p < INTRO * 0.6 ? 'title' : 'steps')
  })

  // The title lifts away during the opening move; the walkthrough copy arrives as the phone settles.
  const titleOpacity = useTransform(scrollYProgress, [0, INTRO * 0.6], [1, 0])
  const titleY = useTransform(scrollYProgress, [0, INTRO], ['0%', '-30%'])
  const copyOpacity = useTransform(scrollYProgress, [INTRO * 0.7, INTRO], [0, 1])
  const ghostOpacity = useTransform(scrollYProgress, [INTRO * 0.8, INTRO * 1.2], [0, 1])
  const title = localize(flagship!.title)

  return (
    <section ref={sectionRef} id="work" data-theme="dark" data-tone="ink" className="sec scroll-mt-0" style={{ height: `${100 + steps.length * 90}svh` }} aria-labelledby="flagship-title">
      <div className="sticky top-0 h-svh overflow-hidden">
        <div className="stage-glow pointer-events-none absolute inset-0" aria-hidden="true" />

        {/* Step numeral, outlined, standing behind the phone. */}
        <motion.div aria-hidden="true" style={{ opacity: ghostOpacity }} className="pointer-events-none absolute inset-x-0 top-[7svh] lg:end-[26%] lg:start-[40%] lg:top-1/2 lg:-translate-y-1/2">
          <p className="latin t-mega t-outline text-center opacity-60 [--mega:clamp(7rem,30svh,20rem)] lg:[--mega:clamp(9rem,40svh,24rem)]">0{step + 1}</p>
        </motion.div>

        {/* Phone-shaped skeleton where the 3D phone will rise, until its first frame is painted. */}
        <div
          aria-hidden="true"
          className={`skeleton pointer-events-none absolute left-1/2 top-[70svh] h-[60svh] w-[min(64vw,19rem)] -translate-x-1/2 rounded-[2.6rem] transition-opacity duration-500 ${ready ? 'opacity-0' : 'opacity-100'}`}
        />
        <Suspense fallback={null}>
          <PhoneScene eventSource={sectionRef} progress={scrollYProgress} screens={screens} rtl={dir === 'rtl'} light={false} onReady={() => setReady(true)} grab={grabRef} />
        </Suspense>

        {/* Invisible handle over the standing phone: drag sideways to spin it. Vertical swipes still scroll. */}
        <div
          ref={grabRef}
          aria-hidden="true"
          data-cursor={phase === 'steps' ? t('cursor.drag') : undefined}
          className={`absolute inset-x-[22%] top-[10%] h-[46%] touch-pan-y cursor-grab active:cursor-grabbing lg:inset-x-auto lg:inset-y-[10%] lg:end-[9%] lg:h-auto lg:w-[30%] ${phase === 'steps' ? '' : 'pointer-events-none'}`}
        />

        <motion.div style={{ opacity: titleOpacity, y: titleY }} className="pointer-events-none absolute inset-x-0 top-0 pt-[max(6.5rem,15svh)]">
          <div className="shell flex flex-col items-center text-center">
            <p className="t-eyebrow">{t('flagship.eyebrow')}</p>
            <h2 id="flagship-title" className="t-hero mt-5 text-text">
              <RiseText text={title} stagger={0.08} />
            </h2>
            <p className="mt-6 max-w-[44ch] text-pretty text-text-2">{localize(flagship!.description)}</p>
          </div>
        </motion.div>

        <motion.div
          style={{ opacity: copyOpacity }}
          inert={phase !== 'steps'}
          className="shell absolute inset-x-0 bottom-0 flex flex-col items-center pb-[max(1.75rem,4svh)] text-center lg:inset-y-0 lg:items-start lg:justify-center lg:pb-0 lg:text-start"
        >
          <div className="w-full lg:max-w-[min(34rem,42%)]">
            <p className="t-eyebrow">
              {title}
              <span className="opacity-50" aria-hidden="true">/</span>
              {t('flagship.eyebrow')}
            </p>
            <div className="mt-4">
              <StepCopy steps={copy} step={step} label={t('flagship.stepLabel', { current: step + 1, total: steps.length })} />
            </div>
            <div className="mt-6 lg:mt-9">
              <Actions center />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/** Same title and steps as a normal, unpinned sequence. */
function Static() {
  const { t } = useLanguage()
  const localize = useLocalized()
  const copy = useStepCopy()
  return (
    <section id="work" data-theme="dark" data-tone="ink" className="sec sec-pad" aria-labelledby="flagship-title">
      <div className="shell">
        <p className="t-eyebrow">{t('flagship.eyebrow')}</p>
        <h2 id="flagship-title" className="t-hero mt-4 text-text">
          {localize(flagship!.title)}
        </h2>
        <p className="t-lead mt-6 max-w-[46ch] text-pretty text-text-2">{localize(flagship!.description)}</p>
        <ol className="mt-14 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
          {copy.map((s, i) => (
            <li key={s.id}>
              <Reveal delay={i * 0.06}>
                <LoadImg src={steps[i].screen} alt="" loading="lazy" decoding="async" className="shot shot-phone aspect-[9/19.5] w-full max-w-[16rem] object-cover object-top" />
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
