import { Gallery } from './components/gallery/Gallery'
import { About } from './components/sections/About'
import { Contact } from './components/sections/Contact'
import { Footer } from './components/sections/Footer'
import { Header } from './components/sections/Header'
import { Hero } from './components/sections/Hero'
import { Services } from './components/sections/Services'
import { TechStrip } from './components/sections/TechStrip'
import { ScrollProgress } from './components/ui/ScrollProgress'
import { LanguageProvider } from './i18n/LanguageProvider'
import { ThemeProvider } from './theme/ThemeProvider'

function Page() {
  return (
    <div className="grain relative min-h-svh">
      <ScrollProgress />
      <Header />
      <Hero />
      <main id="main" className="relative">
        <TechStrip />
        <Gallery />
        <Services />
        <About />
        <Contact />
      </main>
      <Footer />
    </div>
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
