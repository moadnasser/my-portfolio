import { Code2, Globe2, Languages, Smartphone } from 'lucide-react'
import { profile } from '../../data/profile'
import { technologies } from '../../data/technologies'
import { useLanguage } from '../../i18n/context'
import { Reveal } from '../ui/Reveal'

const focusAreas = [
  { id: 'mobile', icon: Smartphone },
  { id: 'web', icon: Globe2 },
  { id: 'backend', icon: Code2 },
  { id: 'i18n', icon: Languages },
] as const

/** Isometric stack of floating glass plates (CSS 3D). Used when no portrait is supplied. */
function LayerStack({ label }: { label: string }) {
  const plates = [
    { z: '0px', delay: '0s', opacity: 0.9 },
    { z: '70px', delay: '-2.3s', opacity: 0.75 },
    { z: '140px', delay: '-4.6s', opacity: 0.6 },
  ]
  const chips = technologies.slice(0, 6)
  return (
    <div role="img" aria-label={label} className="perspective relative aspect-square w-full">
      <div className="ambient start-[10%] top-[10%] h-[70%] w-[70%]" style={{ background: 'var(--glow-a)' }} />
      <div className="preserve-3d relative h-full w-full">
        {plates.map((p, i) => (
          <div
            key={p.z}
            className="plate glass themed shadow-[0_40px_80px_-40px_rgb(var(--shadow-color)/0.6)]"
            style={{ '--z': p.z, '--delay': p.delay, opacity: p.opacity } as React.CSSProperties}
          >
            {i === 0 && <div className="grid-bg absolute inset-0 rounded-[inherit] opacity-70" />}
            {i === 1 && (
              <div className="absolute inset-0 flex flex-wrap content-start gap-2 p-5" aria-hidden="true">
                {chips.map((c) => (
                  <span key={c.id} className="latin rounded-full border border-border bg-surface/70 px-2.5 py-1 text-[11px] font-semibold text-text-2">
                    {c.label}
                  </span>
                ))}
              </div>
            )}
            {i === 2 && (
              <div className="absolute inset-0 flex flex-col justify-between p-5" aria-hidden="true">
                <span className="size-3 rounded-full bg-accent shadow-[0_0_24px_var(--accent)]" />
                <div className="space-y-2">
                  <span className="block h-2 w-3/5 rounded-full bg-text/60" />
                  <span className="block h-2 w-2/5 rounded-full bg-text/30" />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export function About() {
  const { t } = useLanguage()
  return (
    <section id="about" className="scroll-mt-24 border-y border-border bg-surface/40 py-24 sm:py-28 lg:py-36" aria-labelledby="about-title">
      <div className="shell grid grid-cols-1 items-center gap-14 lg:grid-cols-12 lg:gap-16">
        <Reveal className="lg:col-span-7">
          <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-text-2">
            <span className="latin font-display text-accent">03</span>
            <span className="h-px w-8 bg-border" aria-hidden="true" />
            <span>{t('about.eyebrow')}</span>
          </div>
          <h2 id="about-title" className="font-display mt-6 text-balance text-4xl font-bold leading-[1.02] tracking-[-0.03em] text-text sm:text-5xl lg:text-6xl">
            {t('about.title')}
          </h2>
          <p className="mt-8 text-pretty text-base leading-relaxed text-text-2 sm:text-lg">{t('about.p1')}</p>
          <p className="mt-4 text-pretty text-base leading-relaxed text-text-2 sm:text-lg">{t('about.p2')}</p>

          <h3 className="mt-10 text-xs font-semibold uppercase tracking-[0.18em] text-text-2">{t('about.focusTitle')}</h3>
          <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {focusAreas.map((area) => {
              const Icon = area.icon
              return (
                <li key={area.id} className="glass themed flex items-start gap-3 rounded-2xl p-4 transition-[border-color] duration-200 hover:border-accent/60">
                  <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-xl bg-accent/12 text-accent">
                    <Icon className="size-4" strokeWidth={1.75} aria-hidden="true" />
                  </span>
                  <span className="text-sm leading-relaxed text-text">{t(`about.focus.${area.id}`)}</span>
                </li>
              )
            })}
          </ul>
        </Reveal>

        <Reveal delay={0.1} className="mx-auto w-full max-w-md lg:col-span-5 lg:max-w-none">
          {profile.photo ? (
            <img src={profile.photo} alt={t('hero.photoAlt')} className="themed aspect-[4/5] w-full rounded-card border border-border object-cover" loading="lazy" decoding="async" />
          ) : (
            <LayerStack label={t('about.visualLabel')} />
          )}
        </Reveal>
      </div>
    </section>
  )
}
