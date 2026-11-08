import { motion, useReducedMotion } from 'framer-motion'
import type { ProjectScreens } from '../../data/types'
import { useCanHover } from '../../hooks/useCanHover'
import { LoadImg } from './LoadImg'

interface DeviceShowcaseProps {
  screens: ProjectScreens
  alt: string
  /** Hover state of the parent card, so the devices react to the whole card. */
  active?: boolean
  eager?: boolean
}

const spring = { type: 'spring', stiffness: 160, damping: 22 } as const

/**
 * Real screenshots placed in device frames, angled in 3D.
 * Phone apps: an iPhone in front of an Android phone. Web apps: a browser window with the phone layout in front.
 * Flattens and stops moving under reduced motion.
 */
export function DeviceShowcase({ screens, alt, active = false, eager = false }: DeviceShowcaseProps) {
  const reduce = useReducedMotion()
  const canHover = useCanHover()
  const lift = active && canHover && !reduce

  return (
    <div className="absolute inset-0 [perspective:1600px]" dir="ltr">
      <motion.div
        className="absolute inset-0 [transform-style:preserve-3d]"
        initial={false}
        animate={reduce ? { rotateX: 0, rotateY: 0, rotateZ: 0 } : lift ? { rotateX: 12, rotateY: -16, rotateZ: 2 } : { rotateX: 20, rotateY: -28, rotateZ: 6 }}
        transition={spring}
      >
        {screens.kind === 'phones' ? (
          <>
            <motion.div
              className="absolute top-[9%] h-[82%] [transform-style:preserve-3d]"
              style={{ left: '19%' }}
              initial={false}
              animate={reduce ? { x: 0, z: 0 } : lift ? { x: '-14%', z: -70 } : { x: 0, z: -60 }}
              transition={spring}
            >
              <AndroidPhone src={screens.back} alt={alt} eager={eager} />
            </motion.div>
            <motion.div
              className="absolute top-[13%] h-[82%] [transform-style:preserve-3d]"
              style={{ left: '43%' }}
              initial={false}
              animate={reduce ? { x: 0, z: 0 } : lift ? { x: '10%', z: 60 } : { x: 0, z: 40 }}
              transition={spring}
            >
              <IPhone src={screens.front} alt={alt} eager={eager} />
            </motion.div>
          </>
        ) : (
          <>
            <motion.div className="absolute left-[7%] top-[12%] w-[74%]" initial={false} animate={reduce ? { z: 0 } : { z: lift ? -40 : -30 }} transition={spring}>
              <BrowserWindow src={screens.desktop} alt={alt} eager={eager} />
            </motion.div>
            <motion.div
              className="absolute right-[9%] top-[22%] h-[72%]"
              initial={false}
              animate={reduce ? { z: 0, y: 0 } : lift ? { z: 90, y: '-4%' } : { z: 60, y: 0 }}
              transition={spring}
            >
              <IPhone src={screens.phone} alt="" eager={eager} />
            </motion.div>
          </>
        )}
      </motion.div>
    </div>
  )
}

/** Screens are ~9:19.5; frame proportions follow. */
function IPhone({ src, alt, eager }: { src: string; alt: string; eager: boolean }) {
  return (
    <div className="relative aspect-[0.49] h-full rounded-[13%/6%] bg-[#0b1218] p-[3.2%] shadow-[0_40px_60px_-20px_rgb(0_0_0/0.45),inset_0_0_0_1px_rgba(255,255,255,0.12)]">
      <span className="absolute top-[18%] -left-[1.4%] h-[6%] w-[1.4%] rounded-l bg-[#1b2530]" />
      <span className="absolute top-[27%] -left-[1.4%] h-[10%] w-[1.4%] rounded-l bg-[#1b2530]" />
      <span className="absolute top-[24%] -right-[1.4%] h-[13%] w-[1.4%] rounded-r bg-[#1b2530]" />
      <div className="relative size-full overflow-hidden rounded-[10.5%/4.9%] bg-white">
        <LoadImg src={src} alt={alt} loading={eager ? 'eager' : 'lazy'} decoding="async" className="size-full object-cover object-top" />
        <span className="absolute left-1/2 top-[1.6%] h-[3.2%] w-[30%] -translate-x-1/2 rounded-full bg-[#0b1218]" />
      </div>
    </div>
  )
}

/** Android: slimmer, squarer bezel with a punch-hole camera. */
function AndroidPhone({ src, alt, eager }: { src: string; alt: string; eager: boolean }) {
  return (
    <div className="relative aspect-[0.48] h-full rounded-[9%/4.3%] bg-[#1c2733] p-[2.4%] shadow-[0_30px_50px_-20px_rgb(0_0_0/0.4),inset_0_0_0_1px_rgba(255,255,255,0.1)]">
      <span className="absolute top-[20%] -right-[1.2%] h-[8%] w-[1.2%] rounded-r bg-[#2a3743]" />
      <span className="absolute top-[31%] -right-[1.2%] h-[5%] w-[1.2%] rounded-r bg-[#2a3743]" />
      <div className="relative size-full overflow-hidden rounded-[7.5%/3.6%] bg-white">
        <LoadImg src={src} alt="" loading={eager ? 'eager' : 'lazy'} decoding="async" className="size-full object-cover object-top" />
        <span className="absolute left-1/2 top-[1.4%] size-[4.2%] -translate-x-1/2 rounded-full bg-[#0b1218] ring-2 ring-[#0b1218]/20" />
      </div>
      <span className="sr-only">{alt}</span>
    </div>
  )
}

function BrowserWindow({ src, alt, eager }: { src: string; alt: string; eager: boolean }) {
  return (
    <div className="overflow-hidden rounded-[2.2%/3.6%] border border-black/10 bg-white shadow-[0_40px_70px_-30px_rgb(0_0_0/0.45)] dark:border-white/10">
      <div className="flex h-4 items-center gap-1 bg-[#e8edf2] px-2 sm:h-5 dark:bg-[#1b2530]">
        <span className="size-[0.45rem] rounded-full bg-black/15 dark:bg-white/25" />
        <span className="size-[0.45rem] rounded-full bg-black/10 dark:bg-white/18" />
        <span className="size-[0.45rem] rounded-full bg-black/8 dark:bg-white/12" />
      </div>
      <LoadImg src={src} alt={alt} loading={eager ? 'eager' : 'lazy'} decoding="async" className="block aspect-[16/10] w-full object-cover object-top" />
    </div>
  )
}
