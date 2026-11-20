import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { useState, type PointerEvent } from 'react'
import { visibleProjects } from '../../data/projects'
import type { Project } from '../../data/types'
import { useCanHover } from '../../hooks/useCanHover'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { useLanguage, useLocalized } from '../../i18n/context'
import { CINE } from '../../lib/motion'
import { ProjectActions } from '../gallery/ProjectActions'
import { Plate } from '../ui/Plate'
import { Reveal } from '../ui/Reveal'
import { SectionHeading } from '../ui/SectionHeading'
import { TLink } from '../ui/TLink'

function Row({ project, floating, onEnter }: { project: Project; floating: boolean; onEnter: () => void }) {
  const { t } = useLanguage()
  const localize = useLocalized()
  const title = localize(project.title)
  return (
    <li
      onPointerEnter={onEnter}
      data-cursor="view" data-cursor-label={t('cursor.view')}
      className="group relative border-b border-hairline transition-opacity duration-500 lg:group-hover/index:opacity-35 lg:hover:!opacity-100"
    >
      <div className="grid grid-cols-1 gap-x-10 gap-y-5 py-8 lg:grid-cols-12 lg:items-center lg:py-8">
        {/* Without a hover-capable pointer there is no floating preview, so the plate sits in the row. */}
        {!floating && project.screens && (
          <div className="lg:col-span-12">
            <Plate screens={project.screens} alt={title} transitionName={`shot-${project.id}`} />
          </div>
        )}
        <p className="t-caption text-text-2 lg:col-span-2">
          {t(`work.categories.${project.category}`)}
          {project.year && <span className="latin t-code ms-2">{project.year}</span>}
        </p>
        <h3 className="lg:col-span-5">
          <TLink
            to={`/projects/${project.id}`}
            aria-label={t('work.openDetails', { title })}
            className="t-hero inline-flex items-center gap-4 text-text transition-[color,transform] duration-500 ease-out-expo after:absolute after:inset-0 !text-[clamp(1.75rem,1.2rem+1.7vw,2.75rem)] lg:group-hover:translate-x-3 lg:group-hover:text-accent rtl:lg:group-hover:-translate-x-3"
          >
            {title}
            <ArrowUpRight className="size-[0.55em] shrink-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 max-lg:hidden rtl:-scale-x-100" aria-hidden="true" />
          </TLink>
        </h3>
        <p className="text-pretty text-[15px] leading-relaxed text-text-2 lg:col-span-3">{localize(project.description)}</p>
        <div className="lg:col-span-2 lg:justify-self-end">
          <ProjectActions project={project} size="sm" details={false} />
        </div>
      </div>
    </li>
  )
}

/**
 * Every build as an index you read down. With a mouse, the row under the pointer lights up, the
 * others step back, and that build's screens float beside the cursor; on touch screens each row
 * carries its plate instead. Builds with a runnable demo show the launch button in the row.
 */
export function Playground() {
  const { t } = useLanguage()
  const localize = useLocalized()
  const reduce = useReducedMotion()
  const fine = useCanHover()
  const wide = useMediaQuery('(min-width: 1024px)')
  const floating = fine && wide && !reduce
  const [hovered, setHovered] = useState<Project | null>(null)

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 170, damping: 22, mass: 0.6 })
  const sy = useSpring(y, { stiffness: 170, damping: 22, mass: 0.6 })
  // The preview hangs on whichever side of the pointer has more room.
  const [side, setSide] = useState<1 | -1>(1)
  const onMove = (e: PointerEvent<HTMLUListElement>) => {
    x.set(e.clientX)
    y.set(e.clientY)
    const next = e.clientX > window.innerWidth * 0.56 ? -1 : 1
    setSide((s) => (s === next ? s : next))
  }

  if (!visibleProjects.length) return null
  return (
    <section id="playground" className="sec themed sec-pad scroll-mt-4" aria-labelledby="playground-title">
      <div className="shell">
        <SectionHeading
          id="playground-title"
          eyebrow={t('playground.eyebrow')}
          title={t('playground.title')}
          subtitle={t('playground.subtitle')}
          aside={
            <TLink to="/projects" className="link-go">
              {t('work.viewAll')}
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </TLink>
          }
        />

        <Reveal className="mt-14 lg:mt-24">
          <ul aria-label={t('work.index')} onPointerMove={floating ? onMove : undefined} onPointerLeave={() => setHovered(null)} className="group/index border-t border-hairline">
            {visibleProjects.map((project) => (
              <Row key={project.id} project={project} floating={floating} onEnter={() => setHovered(project)} />
            ))}
          </ul>
        </Reveal>
      </div>

      {/* The preview that travels with the pointer. Decorative: the row itself is the link. */}
      {floating && (
        <motion.div aria-hidden="true" style={{ x: sx, y: sy }} className="pointer-events-none fixed left-0 top-0 z-40 -ml-[11rem] -mt-[7rem] w-[22rem] xl:-ml-[13rem] xl:-mt-[8.5rem] xl:w-[26rem]">
          <AnimatePresence>
            {hovered?.screens && (
              <motion.div
                key={hovered.id}
                initial={{ clipPath: 'inset(100% 0% 0% 0% round 1.25rem)', rotate: -4, x: `${side * 60}%` }}
                animate={{ clipPath: 'inset(0% 0% 0% 0% round 1.25rem)', rotate: 0, x: `${side * 60}%` }}
                exit={{ clipPath: 'inset(0% 0% 100% 0% round 1.25rem)', rotate: 3 }}
                transition={{ duration: 0.55, ease: CINE }}
                className="absolute inset-x-0 top-0"
              >
                <Plate screens={hovered.screens} alt={localize(hovered.title)} tone="blue" eager className="shadow-[0_40px_80px_-30px_rgb(0_0_0/0.6)]" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </section>
  )
}
