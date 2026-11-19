import type { ReactNode } from 'react'
import { Reveal } from './Reveal'
import { RiseText } from './RiseText'

interface SectionHeadingProps {
  id?: string
  eyebrow: string
  title: string
  subtitle?: string
  /** Sits opposite the title on wide screens (a link, a counter, controls). */
  aside?: ReactNode
}

/**
 * Editorial section opener: the label hangs in the margin column, the title runs wide beside it,
 * and the supporting line sits under the title on a shorter measure.
 */
export function SectionHeading({ id, eyebrow, title, subtitle, aside }: SectionHeadingProps) {
  return (
    <div className="grid grid-cols-1 gap-x-10 gap-y-5 lg:grid-cols-12">
      <Reveal className="lg:col-span-3 lg:pt-3">
        <p className="t-eyebrow">{eyebrow}</p>
      </Reveal>
      <div className="lg:col-span-9">
        <h2 id={id} className="t-display max-w-[18ch] text-balance text-text">
          <RiseText text={title} />
        </h2>
        {(subtitle || aside) && (
          <Reveal delay={0.12} className="mt-6 flex flex-wrap items-end justify-between gap-x-10 gap-y-5">
            {subtitle && <p className="t-lead max-w-[46ch] text-pretty text-text-2">{subtitle}</p>}
            {aside}
          </Reveal>
        )}
      </div>
    </div>
  )
}
