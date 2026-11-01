import { Play } from 'lucide-react'
import { Link } from 'react-router'
import { demoPath, preloadDemo } from '../../demos/registry'
import { useLanguage } from '../../i18n/context'
import { buttonClasses, type ButtonSize, type ButtonVariant } from './buttonClasses'

interface DemoLinkProps {
  projectId: string
  title: string
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
  label?: string
}

/** "Try live demo" link. Warms the demo chunk on hover or focus so it opens instantly. */
export function DemoLink({ projectId, title, variant = 'primary', size = 'md', className = '', label }: DemoLinkProps) {
  const { t } = useLanguage()
  const warm = () => preloadDemo(projectId)
  return (
    <Link
      to={demoPath(projectId)}
      onMouseEnter={warm}
      onFocus={warm}
      onTouchStart={warm}
      aria-label={t('demo.tryFor', { title })}
      className={buttonClasses(variant, size, className)}
    >
      <span className="relative grid size-5 place-items-center">
        <span className="absolute inset-0 rounded-full bg-current opacity-20 motion-safe:animate-ping" aria-hidden="true" />
        <Play className="relative size-3.5 fill-current" aria-hidden="true" />
      </span>
      {label ?? t('demo.try')}
    </Link>
  )
}
