import { services } from '../../data/services'
import { useLanguage } from '../../i18n/context'
import { Reveal } from '../ui/Reveal'
import { SectionHeading } from '../ui/SectionHeading'
import { TiltCard } from '../ui/TiltCard'

export function Services() {
  const { t } = useLanguage()
  return (
    <section id="services" className="scroll-mt-24 py-24 sm:py-28 lg:py-36" aria-labelledby="services-title">
      <div className="shell">
        <SectionHeading id="services-title" index="02" eyebrow={t('services.eyebrow')} title={t('services.title')} subtitle={t('services.subtitle')} />

        <ul className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:mt-20 lg:grid-cols-4">
          {services.map((service, i) => {
            const Icon = service.icon
            const index = String(i + 1).padStart(2, '0')
            return (
              <Reveal key={service.id} delay={i * 0.07} className="h-full">
                <li className="h-full">
                  <TiltCard max={5} className="group h-full rounded-card">
                    <div className="glass themed relative flex h-full min-h-72 flex-col justify-between overflow-hidden rounded-card p-6 transition-[border-color,box-shadow] duration-300 group-hover:border-accent/50 group-hover:shadow-[0_30px_60px_-40px_var(--ring)] sm:p-7">
                      {/* Wrapper carries the logical offset; the inner span flips to LTR for the digits only. */}
                      <span className="pointer-events-none absolute -top-3 end-4 select-none" aria-hidden="true">
                        <span className="latin font-display text-outline block text-7xl font-bold leading-none">{index}</span>
                      </span>
                      <span className="themed inline-flex size-12 items-center justify-center rounded-2xl border border-border bg-surface text-accent transition-[background-color,color,border-color] duration-300 group-hover:border-transparent group-hover:bg-accent group-hover:text-on-accent">
                        <Icon className="size-5" strokeWidth={1.75} aria-hidden="true" />
                      </span>
                      <div className="mt-10">
                        <h3 className="font-display text-xl font-bold tracking-tight text-text">{t(`services.items.${service.id}.title`)}</h3>
                        <p className="mt-3 text-pretty text-sm leading-relaxed text-text-2">{t(`services.items.${service.id}.description`)}</p>
                      </div>
                    </div>
                  </TiltCard>
                </li>
              </Reveal>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
