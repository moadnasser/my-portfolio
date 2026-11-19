import { lazy, Suspense, useEffect, useRef } from 'react'
import { Route, Routes, useLocation } from 'react-router'
import { Footer } from './components/sections/Footer'
import { Header } from './components/sections/Header'
import { CommandPalette } from './components/ui/CommandPalette'
import { Cursor } from './components/ui/Cursor'
import { LanguageProvider } from './i18n/LanguageProvider'
import { scrollToTarget, startSmoothScroll } from './lib/scroll'
import { DemoSkeleton } from './pages/DemoSkeleton'
import { HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { ProjectPage } from './pages/ProjectPage'
import { ProjectsPage } from './pages/ProjectsPage'
import { ThemeProvider } from './theme/ThemeProvider'

/** Scroll to the top on route change, or to the hash target when one is present (e.g. /#services from another page). */
function ScrollManager() {
  const { pathname, hash } = useLocation()
  const prev = useRef(pathname)
  useEffect(() => {
    const from = prev.current
    prev.current = pathname
    // First load or refresh (no route change, no hash): leave the browser's own scroll restoration alone.
    if (from === pathname && !hash) return
    if (hash) {
      const el = document.querySelector<HTMLElement>(hash)
      if (el) {
        // Arriving from another page is instant: the target has just mounted, so an animated scroll would race the page's own entrance.
        scrollToTarget(el, from !== pathname)
        return
      }
    }
    scrollToTarget(0, true)
  }, [pathname, hash])
  return null
}

const DemoPage = lazy(() => import('./pages/DemoPage').then((m) => ({ default: m.DemoPage })))

/** Regular pages share the header, footer, smooth scrolling and the cursor. */
function SitePages() {
  useEffect(() => startSmoothScroll(), [])
  return (
    <div className="relative min-h-svh">
      <ScrollManager />
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:projectId" element={<ProjectPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Footer />
      <CommandPalette />
      <Cursor />
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
          <Suspense
            fallback={
              <div className="grid h-dvh place-items-center bg-bg p-4">
                <DemoSkeleton />
              </div>
            }
          >
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
