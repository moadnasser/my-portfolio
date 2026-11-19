import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { TLink } from '../components/ui/TLink'
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
    <main id="main" className="sec themed stage-glow grid min-h-svh place-items-center px-5 py-32">
      <div className="flex flex-col items-center text-center">
        {/* 404, with the empty doorway standing in for the zero. */}
        <p className="latin t-mega flex items-end justify-center gap-[0.06em] text-text [--mega:clamp(7rem,30vw,24rem)]" role="img" aria-label="404">
          <span aria-hidden="true">4</span>
          <span aria-hidden="true" className="arch mb-[0.04em] inline-block h-[0.72em] w-[0.46em]" />
          <span aria-hidden="true">4</span>
        </p>
        <h1 className="t-display mt-10 text-balance">{t('notFound.title')}</h1>
        <p className="t-lead mx-auto mt-4 max-w-[34ch] text-pretty text-text-2">{t('notFound.body')}</p>
        <p className="tag mt-6 max-w-full !h-auto truncate py-1.5">{pathname}</p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <TLink to="/" className="btn btn-primary">
            {t('projects.backHome')}
          </TLink>
          <TLink to="/projects" className="btn btn-secondary">
            {t('work.viewAll')}
          </TLink>
        </div>
      </div>
    </main>
  )
}
