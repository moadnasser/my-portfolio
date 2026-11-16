import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'
import { Code2, FileDown, Globe2, Languages, Smartphone } from 'lucide-react'
import { useRef } from 'react'
import { profile } from '../../data/profile'
import { useLanguage } from '../../i18n/context'
import { ButtonLink } from '../ui/Button'
import { Reveal } from '../ui/Reveal'
import { ScrollWords } from '../ui/ScrollWords'
import { Tile } from '../ui/Tile'

const focusAreas = [
  { id: 'mobile', icon: Smartphone },
  { id: 'web', icon: Globe2 },
  { id: 'backend', icon: Code2 },
  { id: 'i18n', icon: Languages },
] as const

/** Portrait cut-out size, so the image reserves its space before it loads. */
const W = 760
const H = 1220

export function About() {
  const { t } = useLanguage()
  const reduce = useReducedMotion()
  const ref = useRef<HTMLElement>(null)
  // The portrait stands on the tile's bottom edge and rises a little as the tile scrolls through.
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end end'] })
  const smooth = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.5 })
  const y = useTransform(smooth, [0, 1], [reduce ? '0%' : '12%', '0%'])

  return (
    <Tile ref={ref} id="about" tone="ink" aria-labelledby="about-title" className="scroll-mt-12 !pb-0">
      <div className="shell grid grid-cols-1 gap-x-16 gap-y-12 lg:grid-cols-12">
        <Reveal className="pb-4 lg:col-span-7 lg:pb-[clamp(4.5rem,3rem+6vw,8.5rem)]">
          <p className="t-eyebrow">{t('about.eyebrow')}</p>
          <h2 id="about-title" className="t-display mt-3 text-balance text-text">
            {t('about.title')}
          </h2>
          <ScrollWords text={t('about.p1')} className="t-lead mt-8 text-pretty text-text" />
          <p className="mt-5 text-pretty text-text-2">{t('about.p2')}</p>

          <h3 className="t-caption mt-12 font-semibold text-text-2">{t('about.focusTitle')}</h3>
          <ul className="mt-3 grid grid-cols-1 gap-x-10 sm:grid-cols-2">
            {focusAreas.map((area) => {
              const Icon = area.icon
              return (
                <li key={area.id} className="flex items-start gap-3.5 border-t border-hairline py-4">
                  <Icon className="mt-0.5 size-5 shrink-0 text-accent" strokeWidth={1.6} aria-hidden="true" />
                  <span className="text-[15px] leading-relaxed text-text rtl:leading-loose">{t(`about.focus.${area.id}`)}</span>
                </li>
              )
            })}
          </ul>

          {profile.cvFile && (
            <ButtonLink href={profile.cvFile} download variant="secondary" className="mt-8">
              <FileDown className="size-4" aria-hidden="true" />
              {t('hero.downloadCv')}
            </ButtonLink>
          )}
        </Reveal>

        <div className="flex items-end justify-center overflow-hidden lg:col-span-5">
          <motion.img
            src="/portrait.webp"
            width={W}
            height={H}
            alt={t('hero.photoAlt')}
            loading="lazy"
            decoding="async"
            draggable={false}
            style={{ y }}
            className="block w-[min(78%,24rem)] select-none lg:w-full lg:max-w-[27rem]"
          />
        </div>
      </div>
    </Tile>
  )
}
