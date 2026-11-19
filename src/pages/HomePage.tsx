import { About } from '../components/sections/About'
import { Contact } from '../components/sections/Contact'
import { Flagship } from '../components/sections/Flagship'
import { Hero } from '../components/sections/Hero'
import { Playground } from '../components/sections/Playground'
import { Process } from '../components/sections/Process'
import { Services } from '../components/sections/Services'
import { WebWalkthrough } from '../components/sections/WebWalkthrough'

/**
 * The home page as a sequence of scenes: the opening frame with its numbers, the
 * flagship on its 3D stage, the web build as a reel, the index of every build, then how the work
 * runs, what is on offer, who is behind it and how to reach him.
 */
export function HomePage() {
  return (
    <>
      <Hero />
      <main id="main" className="relative">
        <Flagship />
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
