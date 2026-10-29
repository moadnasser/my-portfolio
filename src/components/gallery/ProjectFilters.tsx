import { motion, useReducedMotion } from 'framer-motion'
import type { ProjectCategory } from '../../data/types'
import { useLanguage } from '../../i18n/context'
import { EASE } from '../../lib/motion'

export type FilterValue = 'all' | ProjectCategory

interface ProjectFiltersProps {
  options: FilterValue[]
  value: FilterValue
  onChange: (value: FilterValue) => void
  align?: 'center' | 'start'
}

export function ProjectFilters({ options, value, onChange, align = 'center' }: ProjectFiltersProps) {
  const { t } = useLanguage()
  const reduce = useReducedMotion()
  return (
    <div role="group" aria-label={t('work.category')} className={`no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:flex-wrap sm:px-0 ${align === 'center' ? 'sm:justify-center' : ''}`}>
      {options.map((opt) => {
        const active = opt === value
        return (
          <button
            key={opt}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(opt)}
            className={`themed relative shrink-0 cursor-pointer rounded-full border px-4 py-2.5 text-sm font-semibold transition-colors duration-200 ${
              active ? 'border-transparent text-on-accent' : 'glass text-text-2 hover:border-accent/60 hover:text-text'
            }`}
          >
            {active && (
              <motion.span
                layoutId="filter-pill"
                transition={reduce ? { duration: 0 } : { duration: 0.35, ease: EASE }}
                className="absolute inset-0 -z-10 rounded-full"
                style={{ backgroundColor: 'var(--accent)' }}
                aria-hidden="true"
              />
            )}
            {t(`work.filters.${opt}`)}
          </button>
        )
      })}
    </div>
  )
}
