import { About } from '../components/sections/About'
import { Contact } from '../components/sections/Contact'
import { Hero } from '../components/sections/Hero'
import { Playground } from '../components/sections/Playground'
import { Process } from '../components/sections/Process'
import { Services } from '../components/sections/Services'
import { Stats } from '../components/sections/Stats'
import { WebWalkthrough } from '../components/sections/WebWalkthrough'

export function HomePage() {
  return (
    <>
      <Hero />
      <main id="main" className="relative">
        <Stats />
        <WebWalkthrough />
        <Playground />
        <Process />
        <Services />
        <About />
        <Contact />
      </main>
    </>
  )
}
