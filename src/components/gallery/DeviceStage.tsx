import type { CSSProperties } from 'react'
import type { ProjectScreens } from '../../data/types'
import { AndroidPhone, BrowserWindow, IPhone } from '../ui/DeviceShowcase'

interface StageProps {
  screens: ProjectScreens
  alt: string
  /** Shared name so the shot morphs between a card and the project page. */
  transitionName?: string
  eager?: boolean
}

const named = (name?: string): CSSProperties | undefined => (name ? { viewTransitionName: name } : undefined)

/** Card version: the devices stand on the card and are cropped by its bottom edge. Fixed LTR composition. */
export function CardStage({ screens, alt, transitionName, eager }: StageProps) {
  return (
    <div className="relative mt-auto h-56 overflow-hidden sm:h-80 lg:h-[23rem]" dir="ltr" style={named(transitionName)}>
      {screens.kind === 'web' ? (
        <>
          <div className="absolute left-[6%] top-2 w-[74%] sm:left-[8%]">
            <BrowserWindow src={screens.desktop} alt={alt} eager={eager} />
          </div>
          <div className="absolute right-[7%] top-8 h-[125%] sm:top-12">
            <IPhone src={screens.phone} alt="" eager={eager} />
          </div>
        </>
      ) : (
        <>
          <div className="absolute left-1/2 top-10 h-[150%] -translate-x-[108%]">
            <AndroidPhone src={screens.back} alt="" eager={eager} />
          </div>
          <div className="absolute left-1/2 top-2 h-[150%] translate-x-[2%]">
            <IPhone src={screens.front} alt={alt} eager={eager} />
          </div>
        </>
      )}
    </div>
  )
}

/** Page version: the whole composition, uncropped. */
export function FullStage({ screens, alt, transitionName, eager }: StageProps) {
  return (
    <div dir="ltr" className="flex justify-center px-5" style={named(transitionName)}>
      {screens.kind === 'phones' ? (
        <div className="flex h-[min(66svh,40rem,96vw)] items-end justify-center gap-3 sm:gap-6">
          <div className="h-[88%]">
            <AndroidPhone src={screens.back} alt="" eager={eager} />
          </div>
          <div className="h-full">
            <IPhone src={screens.front} alt={alt} eager={eager} />
          </div>
        </div>
      ) : (
        <div className="relative w-[min(92vw,60rem)] pb-[4%] pe-[7%]">
          <BrowserWindow src={screens.desktop} alt={alt} eager={eager} />
          <div className="absolute bottom-0 right-0 z-10 h-[74%]">
            <IPhone src={screens.phone} alt="" eager={eager} />
          </div>
        </div>
      )}
    </div>
  )
}
