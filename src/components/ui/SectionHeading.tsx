import { Reveal } from './Reveal'

interface SectionHeadingProps {
  id?: string
  eyebrow: string
  title: string
  subtitle?: string
}

/** Centred tile heading: accent eyebrow, display title, one muted lead line. */
export function SectionHeading({ id, eyebrow, title, subtitle }: SectionHeadingProps) {
  return (
    <Reveal className="mx-auto flex max-w-3xl flex-col items-center text-center">
      <p className="t-eyebrow">{eyebrow}</p>
      <h2 id={id} className="t-display mt-3 text-balance text-text">
        {title}
      </h2>
      {subtitle && <p className="t-lead mt-5 max-w-2xl text-pretty text-text-2">{subtitle}</p>}
    </Reveal>
  )
}
