import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'
import { ArrowDown, ArrowUpRight, FileDown } from 'lucide-react'
import { useRef, type PointerEvent } from 'react'
import { profile } from '../../data/profile'
import { useLanguage, useLocalized } from '../../i18n/context'
import { Magnetic } from '../ui/Magnetic'
import { RiseText } from '../ui/RiseText'
import { Stats } from './Stats'

/** Portrait cut-out size, so the image reserves its space before it loads. */
const W = 760
const H = 1220

/**
 * Opening frame, in two halves. One side says who this is and what he builds, at reading size,
 * with the ways onward underneath. The other side is the engineer himself, standing in a blue
 * doorway. One entrance sequence on load, a slight drift with the pointer and the scroll, and a
 * row of four figures to close the frame.
 */
export function Hero() {
  const { t } = useLanguage()
  const localize = useLocalized()
  const reduce = useReducedMotion()
  const ref = useRef<HTMLElement>(null)

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const figureY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 60])

  const mx = useMotionValue(0)
  const px = useSpring(mx, { stiffness: 55, damping: 18 })
  const onMove = (e: PointerEvent<HTMLElement>) => {
    if (reduce || e.pointerType !== 'mouse') return
    mx.set(e.clientX / window.innerWidth - 0.5)
  }
  const figureX = useTransform(px, (v) => v * -10)

  /** Entrance step: a CSS animation (see `.enter` in the stylesheet), so content can never be left hidden by a missed frame. */
  const enter = (delay: number) => ({ style: { ['--d' as string]: `${delay}s` } })

  return (
    <section ref={ref} id="top" onPointerMove={onMove} className="sec themed relative flex flex-col overflow-clip lg:min-h-svh" aria-labelledby="hero-title">
      <div className="shell grid flex-1 grid-cols-1 items-center gap-x-10 gap-y-10 pt-28 lg:grid-cols-12">
        <div className="lg:col-span-6 lg:pb-12">
          <p {...enter(0.1)} className="enter t-eyebrow" dir="auto">
            <span className="font-semibold text-text">{localize(profile.name)}</span>
            <span className="opacity-50" aria-hidden="true">/</span>
            {localize(profile.role)}
            <span className="opacity-50" aria-hidden="true">/</span>
            {t('hero.location')}
          </p>

          <h1 id="hero-title" className="t-hero mt-6 text-text">
            {(['headline1', 'headline2', 'headline3'] as const).map((key, i) => (
              <span key={key} className="block">
                <RiseText immediate delay={0.2 + i * 0.1} stagger={0.05} text={t(`hero.${key}`)} />{' '}
              </span>
            ))}
          </h1>

          <p {...enter(0.55)} className="enter mt-6 max-w-[54ch] text-pretty text-[1.0625rem] text-text-2 lg:text-lg">
            {t('hero.paragraph')}
          </p>

          <div {...enter(0.7)} className="enter mt-9 flex flex-wrap items-center gap-3">
            <Magnetic>
              <a href="#work" data-cursor="magnetic" className="btn btn-primary">
                {t('hero.primaryCta')}
                <ArrowDown className="size-4" aria-hidden="true" />
              </a>
            </Magnetic>
            <a href="#contact" data-cursor="magnetic" className="btn btn-secondary">
              {t('hero.secondaryCta')}
            </a>
          </div>
          <div {...enter(0.8)} className="enter mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-[15px]">
            {profile.cvFile && (
              <a href={profile.cvFile} download className="link-go">
                {t('hero.downloadCv')}
                <FileDown className="size-4 !transform-none" aria-hidden="true" />
              </a>
            )}
            <a href="#playground" className="link-go">
              {t('hero.demosChip')}
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </a>
          </div>
        </div>

                <div className="lg:col-span-6 lg:self-end lg:pt-6" dir="ltr">
          <div className="relative mx-auto aspect-[1/1.02] w-full max-w-[24rem] sm:max-w-[28rem] lg:max-w-[34rem]">
            <motion.div style={{ y: figureY, x: figureX }} className="absolute bottom-0 left-1/2 w-[62%] -translate-x-1/2">
              <div className="enter-clip relative overflow-hidden rounded-b-plate">
                <div className="arch themed absolute inset-x-0 bottom-0 top-[13%]" />
                <img src="/portrait.webp" width={W} height={H} alt={t('hero.photoAlt')} fetchPriority="high" decoding="async" draggable={false} className="enter-lift relative -mx-[6%] block w-[112%] max-w-none select-none" />
              </div>
            </motion.div>

          </div>
        </div>
      </div>

      <div {...enter(1)} className="enter shell">
        <Stats />
      </div>
    </section>
  )
}
