import { motion, useReducedMotion } from 'framer-motion'
import type { ProjectCategory } from '../../data/types'
import { useLanguage } from '../../i18n/context'
import { EASE } from '../../lib/motion'

export type FilterValue = 'all' | ProjectCategory

interface ProjectFiltersProps {
  options: FilterValue[]
  value: FilterValue
  onChange: (value: FilterValue) => void
  /** Number of projects behind each option, shown as a small figure beside it. */
  counts?: Partial<Record<FilterValue, number>>
}

/** Category switch set as a row of words; a blue rule slides under the active one. */
export function ProjectFilters({ options, value, onChange, counts }: ProjectFiltersProps) {
  const { t } = useLanguage()
  const reduce = useReducedMotion()
  return (
    <div role="group" aria-label={t('work.category')} className="no-scrollbar -mx-5 flex gap-7 overflow-x-auto px-5 sm:mx-0 sm:px-0">
      {options.map((opt) => {
        const active = opt === value
        return (
          <button
            key={opt}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(opt)}
            className={`t-title relative shrink-0 cursor-pointer pb-2 transition-colors duration-300 ${active ? 'text-text' : 'text-text-2 hover:text-text'}`}
          >
            {t(`work.filters.${opt}`)}
            {counts?.[opt] !== undefined && <sup className="latin t-code ms-1 text-text-2">{counts[opt]}</sup>}
            {active && (
              <motion.span layoutId="filter-rule" transition={reduce ? { duration: 0 } : { duration: 0.5, ease: EASE }} className="absolute inset-x-0 bottom-0 h-0.5 bg-accent" aria-hidden="true" />
            )}
          </button>
        )
      })}
    </div>
  )
}
