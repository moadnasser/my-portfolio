import { Play } from 'lucide-react'
import { demoPath, preloadDemo } from '../../demos/registry'
import { useLanguage } from '../../i18n/context'
import { TLink } from './TLink'
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
    <TLink
      to={demoPath(projectId)}
      onMouseEnter={warm}
      onFocus={warm}
      onTouchStart={warm}
      aria-label={t('demo.tryFor', { title })}
      className={buttonClasses(variant, size, className)}
    >
      <Play className="size-3.5 fill-current" aria-hidden="true" />
      {label ?? t('demo.try')}
    </TLink>
  )
}
