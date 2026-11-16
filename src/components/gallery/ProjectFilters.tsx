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
            className={`themed relative shrink-0 cursor-pointer rounded-full border px-[18px] py-2 text-[15px] transition-[color,background-color,transform] duration-200 active:scale-95 ${
              active ? 'border-transparent text-on-accent' : 'border-transparent bg-chip text-text hover:bg-accent/15'
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
