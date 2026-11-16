import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { buttonClasses } from '../components/ui/buttonClasses'
import { TLink } from '../components/ui/TLink'
import { Tile } from '../components/ui/Tile'
import { useLanguage } from '../i18n/context'

/** Shown for any address the router does not know, instead of silently sending the visitor home. */
export function NotFoundPage() {
  const { t, setPageTitle } = useLanguage()
  const { pathname } = useLocation()

  useEffect(() => {
    setPageTitle('notFound.meta')
    return () => setPageTitle(null)
  }, [setPageTitle])

  return (
    <main id="main">
      <Tile tone="canvas" pad={false} className="stage-glow grid min-h-svh place-items-center px-6 py-28 text-center">
        <div>
          <p className="t-hero text-signal latin !py-0" aria-hidden="true">
            404
          </p>
          <h1 className="t-display mt-2 text-balance">{t('notFound.title')}</h1>
          <p className="t-lead mx-auto mt-4 max-w-[34ch] text-pretty text-text-2">{t('notFound.body')}</p>
          <p className="latin t-caption mx-auto mt-5 max-w-full truncate rounded-full bg-chip px-4 py-1.5 text-text-2 sm:w-fit" dir="ltr">
            {pathname}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <TLink to="/" className={buttonClasses('primary')}>
              {t('projects.backHome')}
            </TLink>
            <TLink to="/projects" className={buttonClasses('secondary')}>
              {t('work.viewAll')}
            </TLink>
          </div>
        </div>
      </Tile>
    </main>
  )
}
