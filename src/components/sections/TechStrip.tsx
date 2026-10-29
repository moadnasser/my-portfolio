import { useReducedMotion } from 'framer-motion'
import { technologies } from '../../data/technologies'
import { useLanguage } from '../../i18n/context'

function Row({ reverse, outline, hidden = false }: { reverse: boolean; outline: boolean; hidden?: boolean }) {
  const items = [...technologies, ...technologies]
  return (
    <ul
      className="ticker-track items-center"
      data-reverse={reverse}
      style={{ '--ticker-duration': reverse ? '52s' : '44s' } as React.CSSProperties}
      aria-hidden={hidden || undefined}
    >
      {items.map((tech, i) => (
        <li
          key={`${tech.id}-${i}`}
          aria-hidden={i >= technologies.length || undefined}
          className={`latin font-display flex shrink-0 items-center gap-6 px-6 text-4xl font-bold tracking-tight sm:gap-8 sm:px-8 sm:text-6xl ${
            outline ? 'text-outline' : 'text-text'
          }`}
        >
          {tech.label}
          <span className="size-2 rounded-full bg-accent" aria-hidden="true" />
        </li>
      ))}
    </ul>
  )
}

/** Two counter-scrolling rows of technology names, laid back in 3D like a signage plane. Static wrap under reduced motion. */
export function TechStrip() {
  const { t } = useLanguage()
  const reduce = useReducedMotion()

  return (
    <section aria-label={t('tech.label')} className="relative overflow-hidden border-y border-border py-8 sm:py-10">
      <p className="sr-only">{t('tech.label')}</p>
      {reduce ? (
        <ul className="shell flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
          {technologies.map((tech) => (
            <li key={tech.id} className="latin font-display text-xl font-bold text-text sm:text-2xl">
              {tech.label}
            </li>
          ))}
        </ul>
      ) : (
        <div className="perspective ticker [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]" dir="ltr">
          <div className="preserve-3d flex flex-col gap-3 sm:gap-4" style={{ transform: 'rotateX(24deg) rotateY(-6deg) translateY(-6px)' }}>
            <Row reverse={false} outline={false} />
            <Row reverse outline hidden />
          </div>
        </div>
      )}
    </section>
  )
}
