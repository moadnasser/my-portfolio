import { Code2, FileDown, Globe2, Languages, Smartphone } from 'lucide-react'
import { profile } from '../../data/profile'
import { useLanguage, useLocalized } from '../../i18n/context'
import { Reveal } from '../ui/Reveal'
import { RiseText } from '../ui/RiseText'
import { ScrollWords } from '../ui/ScrollWords'

const focusAreas = [
  { id: 'mobile', icon: Smartphone },
  { id: 'web', icon: Globe2 },
  { id: 'backend', icon: Code2 },
  { id: 'i18n', icon: Languages },
] as const

/**
 * The biography on an ink ground: the claim set large in the start column with a small signed
 * portrait under it, the two paragraphs and the focus areas in the reading column beside it.
 */
export function About() {
  const { t } = useLanguage()
  const localize = useLocalized()
  return (
    <section id="about" data-theme="dark" data-tone="ink" className="sec sec-pad scroll-mt-4" aria-labelledby="about-title">
      <div className="shell grid grid-cols-1 gap-x-10 gap-y-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            <p className="t-eyebrow">{t('about.eyebrow')}</p>
            <h2 id="about-title" className="t-display mt-5 max-w-[14ch] text-balance text-text">
              <RiseText text={t('about.title')} />
            </h2>
            <Reveal delay={0.2} className="mt-10 flex items-center gap-4">
              {profile.photo && <img src={profile.photo} alt="" width={56} height={68} loading="lazy" decoding="async" className="arch h-[4.25rem] w-14 shrink-0 object-cover object-top" />}
              <p className="leading-snug">
                <span className="block font-semibold text-text" dir="auto">
                  {localize(profile.name)}
                </span>
                <span className="t-caption text-text-2">
                  {localize(profile.role)}, {t('hero.location')}
                </span>
              </p>
            </Reveal>
          </div>
        </div>

        <div className="lg:col-span-7">
          <ScrollWords text={t('about.p1')} className="t-lead text-pretty text-text" />
          <Reveal>
            <p className="mt-6 max-w-[62ch] text-pretty text-text-2">{t('about.p2')}</p>
          </Reveal>

          <h3 className="t-caption mt-14 font-semibold text-text-2">{t('about.focusTitle')}</h3>
          <ul className="mt-4 grid grid-cols-1 gap-x-10 sm:grid-cols-2">
            {focusAreas.map((area, i) => {
              const Icon = area.icon
              return (
                <li key={area.id}>
                  <Reveal delay={i * 0.05} className="flex h-full items-start gap-4 border-t border-hairline py-5">
                    <Icon className="mt-0.5 size-5 shrink-0 text-accent" strokeWidth={1.6} aria-hidden="true" />
                    <span className="text-[15px] leading-relaxed text-text rtl:leading-loose">{t(`about.focus.${area.id}`)}</span>
                  </Reveal>
                </li>
              )
            })}
          </ul>

          {profile.cvFile && (
            <Reveal className="mt-10">
              <a href={profile.cvFile} download className="btn btn-secondary">
                <FileDown className="size-4" aria-hidden="true" />
                {t('hero.downloadCv')}
              </a>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  )
}
