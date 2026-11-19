import { services } from '../../data/services'
import { technologies } from '../../data/technologies'
import { useLanguage } from '../../i18n/context'
import { Reveal, Unmask } from '../ui/Reveal'
import { SectionHeading } from '../ui/SectionHeading'

/** One band of the stack. The list is doubled so the loop has no seam; the copy is hidden from assistive tech. */
function Band({ reverse = false }: { reverse?: boolean }) {
  const items = reverse ? [...technologies].reverse() : technologies
  return (
    <div className="marquee" data-reverse={reverse || undefined} style={{ ['--marquee-time' as string]: reverse ? '58s' : '46s' }}>
      {[0, 1].map((copy) => (
        <ul key={copy} aria-hidden={copy === 1 || undefined} className="flex shrink-0 items-center">
          {items.map((tech, i) => (
            <li key={tech.id} className="latin t-hero flex items-center whitespace-nowrap !text-[clamp(1.75rem,1.2rem+2vw,3.25rem)]">
              <span className={i % 3 === 1 ? 't-outline' : 'text-text'}>{tech.label}</span>
              <span aria-hidden="true" className="arch-mark mx-[0.45em] inline-block h-[0.34em] w-[0.26em] shrink-0 " />
            </li>
          ))}
        </ul>
      ))}
    </div>
  )
}

/**
 * What is on offer. The four services read as a ruled list beside a blue plate carrying the two
 * scripts every build ships in; below, the working stack crosses the page in two bands running
 * in opposite directions.
 */
export function Services() {
  const { t } = useLanguage()
  return (
    <section id="services" className="sec themed sec-pad scroll-mt-4 overflow-x-clip" aria-labelledby="services-title">
      <div className="shell">
        <SectionHeading id="services-title" eyebrow={t('services.eyebrow')} title={t('services.title')} subtitle={t('services.subtitle')} />

        <div className="mt-14 grid grid-cols-1 gap-x-10 gap-y-10 lg:mt-24 lg:grid-cols-12">
          {/* Bilingual plate: Arabic and Latin, side by side. */}
          <div className="lg:col-span-5">
            <Unmask className="lg:sticky lg:top-24">
              <div data-theme="dark" data-tone="blue" className="plate flex aspect-[4/3] flex-col justify-between p-7 text-white sm:p-9 lg:aspect-[4/3.4]">
                <p className="flex items-baseline gap-4 leading-none" aria-hidden="true">
                  <span className="font-arabic text-[clamp(4.5rem,8vw,7rem)] font-black leading-[1.1]">ع</span>
                  <span className="latin font-display text-[clamp(4rem,7vw,6rem)] font-bold tracking-[-0.05em] text-white/45 [font-variation-settings:'wdth'_75]">Aa</span>
                </p>
                <p className="t-title max-w-[18ch] text-balance">{t('about.focus.i18n')}</p>
              </div>
            </Unmask>
          </div>

          <ul className="lg:col-span-7">
            {services.map((service, i) => {
              const Icon = service.icon
              return (
                <li key={service.id}>
                  <Reveal delay={i * 0.05} className="group grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 border-t border-hairline py-8 last:border-b sm:grid-cols-[4.5rem_1fr] lg:py-10">
                    <span className="mt-1 grid size-11 place-items-center rounded-lg border border-hairline text-text-2 transition-colors duration-500 group-hover:border-accent group-hover:bg-accent group-hover:text-on-accent" aria-hidden="true">
                      <Icon className="size-5" strokeWidth={1.6} />
                    </span>
                    <div>
                      <h3 className="t-display text-text !text-[clamp(1.375rem,1.15rem+0.9vw,2rem)]">{t(`services.items.${service.id}.title`)}</h3>
                      <p className="mt-3 max-w-[48ch] text-pretty text-text-2">{t(`services.items.${service.id}.description`)}</p>
                    </div>
                  </Reveal>
                </li>
              )
            })}
          </ul>
        </div>
      </div>

      {/* The stack. Latin names, so the strip is always laid out left to right. */}
      <div className="marquee-wrap mt-20 flex flex-col gap-3 overflow-hidden py-2 lg:mt-32" dir="ltr" role="group" aria-label={t('work.technologies')}>
        <Band />
        <Band reverse />
      </div>
    </section>
  )
}
