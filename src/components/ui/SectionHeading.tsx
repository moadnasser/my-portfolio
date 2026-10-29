import { Reveal } from './Reveal'

interface SectionHeadingProps {
  id?: string
  /** Two-digit section index shown as a technical label, e.g. "01". */
  index: string
  eyebrow: string
  title: string
  subtitle?: string
}

export function SectionHeading({ id, index, eyebrow, title, subtitle }: SectionHeadingProps) {
  return (
    <Reveal className="flex flex-col gap-5">
      <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-text-2">
        <span className="latin font-display text-accent">{index}</span>
        <span className="h-px w-8 bg-border" aria-hidden="true" />
        <span>{eyebrow}</span>
      </div>
      <div className="grid gap-5 lg:grid-cols-12 lg:items-end">
        <h2 id={id} className="font-display text-balance text-4xl font-bold leading-[1.02] tracking-[-0.03em] text-text sm:text-5xl lg:col-span-8 lg:text-6xl">
          {title}
        </h2>
        {subtitle && <p className="max-w-md text-pretty text-base leading-relaxed text-text-2 lg:col-span-4 lg:text-lg">{subtitle}</p>}
      </div>
    </Reveal>
  )
}
