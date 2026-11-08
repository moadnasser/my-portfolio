import { ArrowUpRight, Monitor, Smartphone } from 'lucide-react'
import { Link } from 'react-router'
import { visibleProjects } from '../../data/projects'
import type { Project } from '../../data/types'
import { demoPath, hasDemo, preloadDemo } from '../../demos/registry'
import { useLanguage, useLocalized } from '../../i18n/context'
import { useTheme } from '../../theme/context'
import { Reveal } from '../ui/Reveal'
import { SectionHeading } from '../ui/SectionHeading'
import { TiltCard } from '../ui/TiltCard'
import { LoadImg } from '../ui/LoadImg'

/** Phone apps first, then web apps; spans make a 3 + 2 bento on large screens. */
const demoProjects = [...visibleProjects.filter((p) => hasDemo(p.id))].sort((a, b) => (a.category === b.category ? 0 : a.category === 'mobile' ? -1 : 1))

/** Screenshots captured from the demos themselves, one per theme. */
const thumb = (id: string, theme: 'light' | 'dark') => `/demos/thumbs/${id}-${theme}.webp`

export function Playground() {
  const { t } = useLanguage()
  if (!demoProjects.length) return null
  return (
    <section id="playground" aria-labelledby="playground-title" className="relative py-24 lg:py-32">
      <div className="shell">
        <SectionHeading id="playground-title" index="02" eyebrow={t('playground.eyebrow')} title={t('playground.title')} subtitle={t('playground.subtitle')} />
        <ul className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:mt-16 lg:grid-cols-6">
          {demoProjects.map((p, i) => (
            <li key={p.id} className={demoProjects.length % 3 === 0 || (demoProjects.length === 5 && i < 3) ? 'lg:col-span-2' : 'lg:col-span-3'}>
              <Reveal delay={i * 0.06} className="h-full">
                <DemoCard project={p} wide={!(demoProjects.length % 3 === 0 || (demoProjects.length === 5 && i < 3))} />
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function DemoCard({ project, wide }: { project: Project; wide: boolean }) {
  const { t } = useLanguage()
  const pick = useLocalized()
  const { theme } = useTheme()
  const phone = project.category === 'mobile'
  const title = pick(project.title)
  const warm = () => preloadDemo(project.id)
  return (
    <TiltCard max={5} className="h-full rounded-card">
      <Link
        to={demoPath(project.id)}
        onMouseEnter={warm}
        onFocus={warm}
        onTouchStart={warm}
        aria-label={t('demo.tryFor', { title })}
        className="group glass themed relative flex h-full flex-col overflow-hidden rounded-card transition-[border-color] duration-300 hover:border-accent/50"
      >
        {/* Device stage */}
        <div className={`relative isolate flex items-end justify-center overflow-hidden bg-surface-2 px-6 pt-14 ${phone ? 'h-80 sm:h-[22rem]' : wide ? 'h-64 sm:h-72' : 'h-64'}`}>
          <div className="pointer-events-none absolute inset-0 -z-10 opacity-80" aria-hidden="true" style={{ background: 'radial-gradient(60% 70% at 50% 100%, var(--glow-a), transparent 70%)' }} />
          {phone ? (
            <div className="relative w-[56%] max-w-52 translate-y-6 rounded-t-[1.6rem] border-[5px] border-b-0 border-[#0b1218] bg-[#0b1218] shadow-[0_30px_50px_-20px_rgb(var(--shadow-color)/0.6)] transition-transform duration-500 ease-out group-hover:translate-y-2 motion-reduce:transition-none">
              <span className="absolute start-1/2 top-1.5 z-10 h-2.5 w-10 -translate-x-1/2 rounded-full bg-[#0b1218] rtl:translate-x-1/2" aria-hidden="true" />
              <LoadImg src={thumb(project.id, theme)} alt="" loading="lazy" width={480} height={868} className="aspect-[9/16] w-full rounded-t-[1.2rem] object-cover object-top" />
            </div>
          ) : (
            <div className="relative w-[88%] translate-y-6 overflow-hidden rounded-t-xl border border-b-0 border-border bg-surface shadow-[0_30px_50px_-20px_rgb(var(--shadow-color)/0.5)] transition-transform duration-500 ease-out group-hover:translate-y-2 motion-reduce:transition-none">
              <div className="flex h-6 items-center gap-1 border-b border-border px-2.5" aria-hidden="true">
                <span className="size-1.5 rounded-full bg-text-2/35" />
                <span className="size-1.5 rounded-full bg-text-2/25" />
                <span className="size-1.5 rounded-full bg-text-2/15" />
              </div>
              <LoadImg src={thumb(project.id, theme)} alt="" loading="lazy" width={960} height={431} className={`w-full object-cover object-top ${wide ? 'aspect-[16/8]' : 'aspect-[16/10]'}`} />
            </div>
          )}
          <span className="absolute start-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-surface/85 px-2.5 py-1 text-xs font-semibold text-text-2 backdrop-blur">
            {phone ? <Smartphone className="size-3.5" aria-hidden="true" /> : <Monitor className="size-3.5" aria-hidden="true" />}
            {phone ? t('playground.phone') : t('playground.web')}
          </span>
        </div>
        {/* Copy */}
        <div className="flex flex-1 flex-col gap-2 p-5 sm:p-6">
          <h3 className="font-display text-xl font-semibold tracking-tight">{title}</h3>
          <p className="line-clamp-2 text-sm leading-relaxed text-text-2">{pick(project.description)}</p>
          <span className="mt-auto inline-flex items-center gap-2 pt-3 text-sm font-semibold text-accent">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full rounded-full bg-accent opacity-60 motion-safe:animate-ping" />
              <span className="relative inline-flex size-2 rounded-full bg-accent" />
            </span>
            {t('playground.launch')}
            <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5" aria-hidden="true" />
          </span>
        </div>
      </Link>
    </TiltCard>
  )
}
