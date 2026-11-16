import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { ChevronRight, FileDown } from 'lucide-react'
import { Suspense, lazy, useRef, useState } from 'react'
import { Link } from 'react-router'
import { profile } from '../../data/profile'
import { visibleProjects } from '../../data/projects'
import { useLanguage, useLocalized } from '../../i18n/context'
import { useTheme } from '../../theme/context'
import { EASE } from '../../lib/motion'
import { INTRO } from '../three/timeline'
import { useWebGL } from '../three/useWebGL'
import { ButtonLink } from '../ui/Button'
import { DemoLink } from '../ui/DemoLink'
import { IPhone } from '../ui/DeviceShowcase'

// Start fetching the 3D chunk as soon as this module loads, not when the hero first renders.
const sceneChunk = import('../three/PhoneScene')
const PhoneScene = lazy(() => sceneChunk)

/** The flagship build and the screens its walkthrough steps through, in order. */
const flagship = visibleProjects.find((p) => p.id === 'uab-shipping')!
const steps = [
  { id: 's1', screen: '/projects/uab-home.jpg' },
  { id: 's2', screen: '/projects/uab-create-order.jpg' },
  { id: 's3', screen: '/projects/uab-live-map.jpg' },
  { id: 's4', screen: '/projects/uab-pricing.jpg' },
] as const
const screens = steps.map((s) => s.screen)

/** Line-by-line masked rise. Each line slides up out of its own clipping box. */
function RisingLine({ children, delay, className = '' }: { children: string; delay: number; className?: string }) {
  const reduce = useReducedMotion()
  return (
    <span className="-my-[0.08em] block overflow-hidden py-[0.08em] rtl:-my-[0.2em] rtl:py-[0.2em]">
      <motion.span className="block" initial={reduce ? false : { y: '115%' }} animate={{ y: 0 }} transition={{ duration: 0.7, delay, ease: EASE }}>
        {/* Gradient lives on a plain inline span: Safari breaks background-clip:text on transformed elements. */}
        <span className={className}>{children}</span>
      </motion.span>
    </span>
  )
}

function Statement() {
  const { t } = useLanguage()
  const localize = useLocalized()
  const reduce = useReducedMotion()
  const fade = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay, ease: EASE },
  })
  return (
    <div className="shell flex flex-col items-center text-center">
      <motion.p {...fade(0)} className="t-eyebrow" dir="auto">
        {localize(profile.name)} <span className="text-text-2">· {localize(profile.role)}</span>
      </motion.p>
      <h1 id="hero-title" className="t-hero mt-4 text-balance text-text">
        <RisingLine delay={0}>{t('hero.headline1')}</RisingLine>
        <RisingLine delay={0.07}>{t('hero.headline2')}</RisingLine>
        <RisingLine delay={0.14} className="text-signal">
          {t('hero.headline3')}
        </RisingLine>
      </h1>
      <motion.div {...fade(0.3)} className="mt-8 flex flex-wrap items-center justify-center gap-x-7 gap-y-4">
        <ButtonLink href="#playground">{t('hero.primaryCta')}</ButtonLink>
        <a href="#contact" className="link-go text-[17px]">
          {t('hero.secondaryCta')}
          <ChevronRight className="size-4" aria-hidden="true" />
        </a>
        {profile.cvFile && (
          <a href={profile.cvFile} download className="link-go text-[17px]">
            {t('hero.downloadCv')}
            <FileDown className="size-4 !transform-none" aria-hidden="true" />
          </a>
        )}
      </motion.div>
    </div>
  )
}

function StepActions() {
  const { t } = useLanguage()
  const localize = useLocalized()
  const title = localize(flagship.title)
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-3 lg:justify-start">
      <DemoLink projectId={flagship.id} title={title} />
      <Link to={`/projects/${flagship.id}`} className="link-go text-[17px]" aria-label={t('work.openDetails', { title })}>
        {t('projects.details')}
        <ChevronRight className="size-4" aria-hidden="true" />
      </Link>
    </div>
  )
}

/**
 * Opening statement that turns into the flagship walkthrough. The section is several screens
 * tall and its stage is pinned: a 3D phone rises from below, stands up beside the copy, and
 * makes one full turn per step, coming back round with the next screen of the app.
 * Without WebGL, or under reduced motion, the same content is laid out as a plain page.
 */
export function Hero() {
  const reduce = useReducedMotion()
  const webgl = useWebGL()
  return webgl && !reduce ? <PinnedHero /> : <StaticHero />
}

function PinnedHero() {
  const { t, dir } = useLanguage()
  const localize = useLocalized()
  const { theme } = useTheme()
  const [ready, setReady] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const grabRef = useRef<HTMLDivElement>(null)
  const [step, setStep] = useState(0)
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] })

  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    const next = Math.min(steps.length - 1, Math.floor(Math.max(0, (p - INTRO) / (1 - INTRO)) * steps.length))
    setStep((s) => (s === next ? s : next))
  })

  // The statement lifts away during the opening move; the walkthrough copy arrives as the phone settles.
  const statementOpacity = useTransform(scrollYProgress, [0, INTRO * 0.55], [1, 0])
  const statementY = useTransform(scrollYProgress, [0, INTRO], ['0%', '-22%'])
  const statementScale = useTransform(scrollYProgress, [0, INTRO], [1, 0.94])
  const copyOpacity = useTransform(scrollYProgress, [INTRO * 0.7, INTRO], [0, 1])
  const railScale = useTransform(scrollYProgress, [INTRO, 1], [0, 1])
  const [interactive, setInteractive] = useState<'statement' | 'copy'>('statement')
  useMotionValueEvent(scrollYProgress, 'change', (p) => setInteractive(p < INTRO * 0.6 ? 'statement' : 'copy'))

  return (
    <section ref={sectionRef} id="top" data-tone="canvas" className="tile themed" style={{ height: `${100 + steps.length * 90}svh` }} aria-labelledby="hero-title">
      <div className="sticky top-0 h-svh overflow-hidden">
        <div className="stage-glow pointer-events-none absolute inset-0" aria-hidden="true" />
        {/* Phone-shaped skeleton where the 3D phone will rise, until its first frame is painted. */}
        <div
          aria-hidden="true"
          className={`skeleton pointer-events-none absolute left-1/2 top-[70svh] h-[60svh] w-[min(64vw,19rem)] -translate-x-1/2 rounded-[2.6rem] transition-opacity duration-500 ${ready ? 'opacity-0' : 'opacity-100'}`}
        />
        <Suspense fallback={null}>
          <PhoneScene eventSource={sectionRef} progress={scrollYProgress} screens={screens} rtl={dir === 'rtl'} light={theme === 'light'} onReady={() => setReady(true)} grab={grabRef} />
        </Suspense>

        {/* Invisible handle over the standing phone: drag sideways to spin it. Vertical swipes still scroll. */}
        <div
          ref={grabRef}
          aria-hidden="true"
          className={`absolute inset-x-[22%] top-[10%] h-[46%] touch-pan-y cursor-grab active:cursor-grabbing lg:inset-x-auto lg:inset-y-[10%] lg:end-[9%] lg:h-auto lg:w-[30%] ${interactive === 'copy' ? '' : 'pointer-events-none'}`}
        />

        <motion.div
          style={{ opacity: statementOpacity, y: statementY, scale: statementScale }}
          className={`absolute inset-x-0 top-0 pt-[max(5.5rem,13svh)] ${interactive === 'statement' ? '' : 'pointer-events-none'}`}
        >
          <Statement />
        </motion.div>

        <motion.div
          style={{ opacity: copyOpacity }}
          inert={interactive !== 'copy'}
          className="shell absolute inset-x-0 bottom-0 flex flex-col items-center pb-[max(1.75rem,4svh)] text-center lg:inset-y-0 lg:items-start lg:justify-center lg:pb-0 lg:text-start"
        >
          <div className="w-full lg:max-w-[min(34rem,44%)]">
            <p className="t-eyebrow">
              {localize(flagship.title)} <span className="text-text-2">· {t('flagship.eyebrow')}</span>
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
                  <h2 className="t-display text-balance text-text max-lg:!text-[1.75rem]">{t(`flagship.steps.${s.id}.title`)}</h2>
                  <p className="t-lead mt-4 text-pretty text-text-2 max-lg:mt-2 max-lg:!text-[1rem]">{t(`flagship.steps.${s.id}.body`)}</p>
                </motion.div>
              ))}
            </div>

            {/* Step counter with a rail that fills as the walkthrough advances. */}
            <div className="mt-6 flex items-center justify-center gap-4 lg:mt-9 lg:justify-start" role="img" aria-label={t('flagship.stepLabel', { current: step + 1, total: steps.length })}>
              <span className="latin t-caption tabular-nums text-text">
                0{step + 1} <span className="text-text-2">/ 0{steps.length}</span>
              </span>
              <span className="h-0.5 w-32 overflow-hidden rounded-full bg-chip">
                <motion.span style={{ scaleX: railScale }} className="block size-full origin-left rounded-full bg-accent rtl:origin-right" />
              </span>
            </div>

            <div className="mt-6 lg:mt-9">
              <StepActions />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/** Same statement and steps as a normal, unpinned page. */
function StaticHero() {
  const { t } = useLanguage()
  const localize = useLocalized()
  return (
    <section id="top" data-tone="canvas" className="tile themed pb-20 pt-28 sm:pt-36" aria-labelledby="hero-title">
      <Statement />
      <div className="shell mt-24">
        <p className="t-eyebrow text-center">
          {localize(flagship.title)} <span className="text-text-2">· {t('flagship.eyebrow')}</span>
        </p>
        <ol className="mt-10 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <li key={s.id} className="flex flex-col items-center text-center">
              <div className="h-[26rem]" dir="ltr">
                <IPhone src={s.screen} alt="" />
              </div>
              <h2 className="t-title mt-8 text-text">{t(`flagship.steps.${s.id}.title`)}</h2>
              <p className="mt-2 text-pretty text-text-2">{t(`flagship.steps.${s.id}.body`)}</p>
            </li>
          ))}
        </ol>
        <div className="mt-12 flex justify-center">
          <StepActions />
        </div>
      </div>
    </section>
  )
}
