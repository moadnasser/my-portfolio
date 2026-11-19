import { motion } from 'framer-motion'
import { EASE } from '../../lib/motion'

export interface Step {
  id: string
  title: string
  body: string
}

/**
 * Copy for a pinned walkthrough: the steps share one grid cell and trade places as `step`
 * changes, with a counter and a segmented rail underneath. Hidden steps are removed from the
 * accessibility tree so a screen reader hears only the current one.
 */
export function StepCopy({ steps, step, label }: { steps: Step[]; step: number; label: string }) {
  return (
    <>
      <div className="grid" aria-live="polite">
        {steps.map((s, i) => (
          <motion.div
            key={s.id}
            aria-hidden={i !== step}
            initial={false}
            animate={{ opacity: i === step ? 1 : 0, y: i === step ? 0 : i < step ? -26 : 26 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="[grid-area:1/1]"
          >
            <h3 className="t-display text-balance text-text max-lg:!text-[1.5rem]">{s.title}</h3>
            <p className="t-lead mt-4 text-pretty text-text-2 max-lg:mt-2 max-lg:!text-[1rem]">{s.body}</p>
          </motion.div>
        ))}
      </div>
      <div className="mt-6 flex items-center justify-center gap-4 lg:mt-9 lg:justify-start" role="img" aria-label={label}>
        <span className="t-code tabular-nums text-text">
          0{step + 1} <span className="text-text-2">/ 0{steps.length}</span>
        </span>
        <span className="flex gap-1.5">
          {steps.map((s, i) => (
            <span key={s.id} className={`h-0.5 w-9 transition-colors duration-500 ${i <= step ? 'bg-accent' : 'bg-chip'}`} />
          ))}
        </span>
      </div>
    </>
  )
}
