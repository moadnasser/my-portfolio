import type { ReactNode } from 'react'
import { technologies } from '../../data/technologies'
import { useLanguage } from '../../i18n/context'
import { AndroidPhone, BrowserWindow, IPhone } from '../ui/DeviceShowcase'
import { Reveal } from '../ui/Reveal'
import { SectionHeading } from '../ui/SectionHeading'
import { Tile } from '../ui/Tile'

/** What is on offer, as a bento grid: each card states one service and shows evidence for it. */
export function Services() {
  const { t } = useLanguage()
  return (
    <Tile id="services" tone="parchment" aria-labelledby="services-title" className="scroll-mt-12">
      <div className="shell">
        <SectionHeading id="services-title" eyebrow={t('services.eyebrow')} title={t('services.title')} subtitle={t('services.subtitle')} />

        <ul className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-6 lg:mt-20 lg:gap-6">
          {/* Mobile: the wide ink card, two phones standing on its edge. */}
          <Card className="md:col-span-6 lg:col-span-4" dark>
            <div className="grid h-full sm:grid-cols-2">
              <Copy id="mobile" />
              <div className="relative h-64 overflow-hidden sm:h-auto sm:min-h-[24rem]" dir="ltr">
                <div className="absolute left-[8%] top-16 h-[120%]">
                  <AndroidPhone src="/projects/uab-track.jpg" alt="" />
                </div>
                <div className="absolute right-[8%] top-6 h-[120%]">
                  <IPhone src="/projects/uab-order-details.jpg" alt="" />
                </div>
              </div>
            </div>
          </Card>

          {/* Bilingual: solid Telegram blue, the two scripts side by side. */}
          <Card className="bento-blue md:col-span-3 lg:col-span-2" delay={0.08}>
            <div className="flex h-full min-h-[22rem] flex-col justify-between p-7 sm:p-9">
              <p className="flex items-baseline gap-3 leading-none" aria-hidden="true">
                <span className="font-arabic text-[7.5rem] font-extrabold leading-[1.1]">ع</span>
                <span className="latin font-display text-[6.5rem] font-semibold tracking-[-0.04em] text-white/55">Aa</span>
              </p>
              <h3 className="t-title text-balance">{t('about.focus.i18n')}</h3>
            </div>
          </Card>

          {/* Web: a live site in a browser frame. */}
          <Card className="md:col-span-3 lg:col-span-2">
            <Copy id="web" />
            <div className="relative mt-auto h-44 overflow-hidden" dir="ltr">
              <div className="absolute inset-x-7 top-0 sm:inset-x-9">
                <BrowserWindow src="/projects/jabal-cover.webp" alt="" />
              </div>
            </div>
          </Card>

          {/* Backend: the protocols and stores actually used, set as type. */}
          <Card className="md:col-span-3 lg:col-span-2" delay={0.08}>
            <Copy id="backend" />
            <p className="latin font-display mt-auto flex flex-wrap gap-x-4 px-7 pb-7 text-[2.5rem] font-semibold leading-[1.05] tracking-[-0.03em] sm:px-9 sm:pb-9" dir="ltr" aria-hidden="true">
              <span className="text-accent">REST</span>
              <span className="text-text/70">Django</span>
              <span className="text-text/50">MySQL</span>
              <span className="text-text/35">Firestore</span>
              <span className="text-text/20">FCM</span>
            </p>
          </Card>

          {/* Product engineering: the stack. */}
          <Card className="md:col-span-3 lg:col-span-2" delay={0.16}>
            <Copy id="product" />
            <ul className="mt-auto flex flex-wrap gap-2 px-7 pb-7 sm:px-9 sm:pb-9" dir="ltr">
              {technologies.map((tech) => (
                <li key={tech.id} className="latin t-caption rounded-full bg-chip px-3 py-1.5 text-text">
                  {tech.label}
                </li>
              ))}
            </ul>
          </Card>
        </ul>
      </div>
    </Tile>
  )
}

function Card({ children, className = '', dark = false, delay = 0 }: { children: ReactNode; className?: string; dark?: boolean; delay?: number }) {
  return (
    <li className={className.split(' ').filter((c) => c.includes('col-span')).join(' ')}>
      <Reveal delay={delay} y={32} className="h-full">
        <div data-theme={dark ? 'dark' : undefined} className={`bento themed flex h-full flex-col ${className.split(' ').filter((c) => !c.includes('col-span')).join(' ')}`}>
          {children}
        </div>
      </Reveal>
    </li>
  )
}

function Copy({ id }: { id: 'product' | 'web' | 'mobile' | 'backend' }) {
  const { t } = useLanguage()
  return (
    <div className="p-7 pb-8 sm:p-9 sm:pb-10">
      <h3 className="t-title text-text">{t(`services.items.${id}.title`)}</h3>
      <p className="mt-3 text-pretty text-text-2">{t(`services.items.${id}.description`)}</p>
    </div>
  )
}
