import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { ArrowDown, ArrowUpRight, FileDown } from 'lucide-react'
import { Suspense, lazy, useRef } from 'react'
import { profile } from '../../data/profile'
import { useLanguage, useLocalized } from '../../i18n/context'
import { EASE } from '../../lib/motion'
import { useWebGL } from '../three/useWebGL'
import { Ambient } from '../ui/Ambient'
import { ButtonLink } from '../ui/Button'
import { Magnetic } from '../ui/Magnetic'
import { HeroPortrait } from './HeroPortrait'

const HeroScene = lazy(() => import('../three/HeroScene'))

/** Line-by-line masked rise. Each line slides up out of its own clipping box. */
function RisingLine({ children, delay, className = '', textClassName = '' }: { children: string; delay: number; className?: string; textClassName?: string }) {
  const reduce = useReducedMotion()
  return (
    <span className="-my-[0.06em] block overflow-hidden py-[0.06em] pb-[0.08em] rtl:-my-[0.2em] rtl:py-[0.2em]">
      <motion.span
        className={`block ${className}`}
        initial={reduce ? false : { y: '112%' }}
        animate={{ y: 0 }}
        transition={{ duration: 0.9, delay, ease: EASE }}
      >
        {/* Gradient lives on a plain inline span: Safari breaks background-clip:text on transformed elements. */}
        <span className={textClassName}>{children}</span>
      </motion.span>
    </span>
  )
}

export function Hero() {
  const { t } = useLanguage()
  const localize = useLocalized()
  const reduce = useReducedMotion()
  const webgl = useWebGL()
  const sectionRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] })
  // Decorative layers only drift with scroll; copy stays put for reading comfort.
  const sceneY = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '12%'])
  const sceneOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.15])

  const fade = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay, ease: EASE },
  })

  return (
    <section ref={sectionRef} id="top" className="relative isolate flex min-h-[100svh] flex-col justify-end overflow-hidden pb-14 pt-32 sm:pb-20 lg:justify-center lg:pb-24 lg:pt-36" aria-labelledby="hero-title">
      <Ambient />
      <motion.div className="absolute inset-0 -z-10" style={{ y: sceneY, opacity: sceneOpacity }} aria-hidden="true">
        {webgl && (
          <Suspense fallback={null}>
            <HeroScene eventSource={sectionRef} animate={!reduce} />
          </Suspense>
        )}
        {webgl === false && (
          <div className="ambient end-[-10%] top-[10%] h-[60vh] w-[60vh]" style={{ background: 'var(--glow-a)' }} />
        )}
      </motion.div>
      {/* Fade the scene into the page background at the bottom edge */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-bg to-transparent" aria-hidden="true" />

      <div className="shell relative">
        <div className="grid items-end gap-10 lg:grid-cols-12 lg:gap-8">
        <div className="order-2 lg:order-1 lg:col-span-7 lg:pb-6">
          <motion.div {...fade(0.05)} className="mb-8 flex items-center gap-4">
            <span className="h-px w-10 bg-accent" aria-hidden="true" />
            <div className="flex flex-col">
              <span className="font-display text-sm font-semibold text-text" dir="auto">{localize(profile.name)}</span>
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-text-2">{localize(profile.role)}</span>
            </div>
          </motion.div>

          <h1 id="hero-title" className="font-display text-balance text-[2.6rem] font-bold leading-[0.98] tracking-[-0.035em] rtl:leading-[1.12] text-text sm:text-6xl lg:text-[4rem] xl:text-[4.6rem] 2xl:text-[5.25rem]">
            <RisingLine delay={0.1}>{t('hero.headline1')}</RisingLine>
            <RisingLine delay={0.2} className="lg:ps-[0.5em]">{t('hero.headline2')}</RisingLine>
            <RisingLine delay={0.3} textClassName="text-signal">{t('hero.headline3')}</RisingLine>
          </h1>

          <div className="mt-10 flex flex-col gap-8">
            <motion.p {...fade(0.5)} className="max-w-xl text-pretty text-base leading-relaxed text-text-2 sm:text-lg">
              {t('hero.paragraph')}
            </motion.p>
            <motion.div {...fade(0.62)} className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <Magnetic className="w-full sm:w-auto">
                <ButtonLink href="#work" size="lg" className="w-full sm:w-auto">
                  {t('hero.primaryCta')}
                  <ArrowDown className="size-4" aria-hidden="true" />
                </ButtonLink>
              </Magnetic>
              <ButtonLink href="#contact" variant="secondary" size="lg" className="w-full sm:w-auto">
                {t('hero.secondaryCta')}
                <ArrowUpRight className="size-4 rtl:-scale-x-100" aria-hidden="true" />
              </ButtonLink>
              {profile.cvFile && (
                <ButtonLink href={profile.cvFile} download variant="secondary" size="lg" className="w-full sm:w-auto">
                  {t('hero.downloadCv')}
                  <FileDown className="size-4" aria-hidden="true" />
                </ButtonLink>
              )}
            </motion.div>
          </div>
        </div>
        <div className="order-1 w-[82%] max-w-[22rem] justify-self-center sm:max-w-[25rem] lg:order-2 lg:col-span-5 lg:w-full lg:max-w-[30rem] lg:justify-self-end">
          <HeroPortrait trackRef={sectionRef} />
        </div>
        </div>
      </div>
    </section>
  )
}
