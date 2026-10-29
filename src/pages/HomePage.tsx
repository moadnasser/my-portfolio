import { Gallery } from '../components/gallery/Gallery'
import { About } from '../components/sections/About'
import { Contact } from '../components/sections/Contact'
import { Hero } from '../components/sections/Hero'
import { Services } from '../components/sections/Services'
import { TechStrip } from '../components/sections/TechStrip'

export function HomePage() {
  return (
    <>
      <Hero />
      <main id="main" className="relative">
        <TechStrip />
        <Gallery />
        <Services />
        <About />
        <Contact />
      </main>
    </>
  )
}
