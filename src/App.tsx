import { useEffect, useRef } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router'
import { Footer } from './components/sections/Footer'
import { Header } from './components/sections/Header'
import { ScrollProgress } from './components/ui/ScrollProgress'
import { LanguageProvider } from './i18n/LanguageProvider'
import { lazy, Suspense } from 'react'
import { HomePage } from './pages/HomePage'
import { ProjectsPage } from './pages/ProjectsPage'
import { ThemeProvider } from './theme/ThemeProvider'

/** Scroll to the top on route change, or to the hash target when one is present (e.g. /#services from another page). */
function ScrollManager() {
  const { pathname, hash } = useLocation()
  const prev = useRef(pathname)
  useEffect(() => {
    const from = prev.current
    prev.current = pathname
    // Opening or closing a project inline on /projects keeps the reader where they are.
    const catalogue = (p: string) => /^\/projects(\/[^/]+)?$/.test(p)
    if (catalogue(from) && catalogue(pathname) && from !== pathname) return
    if (hash) {
      const el = document.querySelector(hash)
      if (el) {
        // Instant: the target page has just mounted, so a smooth scroll would race the lazy hero chunk.
        el.scrollIntoView({ block: 'start', behavior: 'instant' })
        return
      }
    }
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname, hash])
  return null
}

const DemoPage = lazy(() => import('./pages/DemoPage').then((m) => ({ default: m.DemoPage })))

/** Regular pages share the header, footer and scroll chrome. */
function SitePages() {
  return (
    <div className="grain relative min-h-svh">
      <ScrollProgress />
      <ScrollManager />
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:projectId" element={<ProjectsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </div>
  )
}

/** Demos are immersive: full-screen on phones, no site header or footer. */
function Page() {
  return (
    <Routes>
      <Route
        path="/projects/:projectId/demo"
        element={
          <Suspense fallback={<div className="h-dvh bg-bg" />}>
            <ScrollManager />
            <DemoPage />
          </Suspense>
        }
      />
      <Route path="*" element={<SitePages />} />
    </Routes>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <Page />
      </LanguageProvider>
    </ThemeProvider>
  )
}
