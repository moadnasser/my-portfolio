import { Gallery } from '../components/gallery/Gallery'
import { About } from '../components/sections/About'
import { Contact } from '../components/sections/Contact'
import { Hero } from '../components/sections/Hero'
import { Playground } from '../components/sections/Playground'
import { Services } from '../components/sections/Services'

export function HomePage() {
  return (
    <>
      <Hero />
      <main id="main" className="relative">
        <Gallery />
        <Playground />
        <Services />
        <About />
        <Contact />
      </main>
    </>
  )
}
