import type { CSSProperties } from 'react'
import type { ProjectScreens } from '../../data/types'
import { LoadImg } from './LoadImg'

export type PlateShape = 'wide' | 'tall'
export type PlateTone = 'neutral' | 'blue' | 'ink'

interface PlateProps {
  screens: ProjectScreens
  alt: string
  shape?: PlateShape
  tone?: PlateTone
  /** Shared name so the plate morphs between a list row and the project page. */
  transitionName?: string
  eager?: boolean
  className?: string
}

/**
 * Where each screenshot sits on the plate, as percentages of the plate's width.
 * `a` is the supporting shot (drawn first, further back), `b` the leading one.
 */
const layouts = {
  phones: {
    wide: { a: 'left-[22%] top-[17%] w-[23%]', b: 'left-[54%] top-[8%] w-[24%]' },
    tall: { a: 'left-[9%] top-[15%] w-[39%]', b: 'left-[53%] top-[7%] w-[40%]' },
  },
  web: {
    wide: { a: 'left-[6%] top-[11%] w-[72%]', b: 'left-[76%] top-[20%] w-[17%]' },
    tall: { a: 'left-[9%] top-[9%] w-[118%]', b: 'left-[54%] top-[36%] w-[36%]' },
  },
} as const

const shapes: Record<PlateShape, string> = { wide: 'aspect-[16/10]', tall: 'aspect-[4/5]' }
const move = 'transition-transform duration-[900ms] ease-out-expo will-change-transform'

/**
 * The portfolio's imagery: real screenshots resting on a tinted ground, with no device frames.
 * Phone apps show two screens side by side; web apps a desktop view with its mobile view over it.
 * When a parent carries the `group` class, the two shots drift apart slightly on hover.
 * The composition is fixed left-to-right so it reads the same in Arabic.
 */
export function Plate({ screens, alt, shape = 'wide', tone = 'neutral', transitionName, eager, className = '' }: PlateProps) {
  const pos = layouts[screens.kind][shape]
  const loading = eager ? 'eager' : 'lazy'
  const named: CSSProperties | undefined = transitionName ? { viewTransitionName: transitionName } : undefined
  const phone = 'shot shot-phone absolute aspect-[9/19.5] object-cover object-top'
  return (
    <div dir="ltr" data-tone={tone === 'neutral' ? undefined : tone} data-theme={tone === 'neutral' ? undefined : 'dark'} className={`plate themed ${shapes[shape]} ${className}`} style={named}>
      {screens.kind === 'phones' ? (
        <>
          <LoadImg src={screens.back} alt="" loading={loading} decoding="async" className={`${phone} ${pos.a} ${move} group-hover:-translate-y-[3%]`} />
          <LoadImg src={screens.front} alt={alt} loading={loading} decoding="async" className={`${phone} ${pos.b} ${move} group-hover:translate-y-[3%]`} />
        </>
      ) : (
        <>
          <LoadImg src={screens.desktop} alt={alt} loading={loading} decoding="async" className={`shot absolute aspect-[16/10] object-cover object-top ${pos.a} ${move} group-hover:-translate-x-[1.5%]`} />
          <LoadImg src={screens.phone} alt="" loading={loading} decoding="async" className={`${phone} ${pos.b} ${move} group-hover:-translate-y-[4%]`} />
        </>
      )}
    </div>
  )
}
