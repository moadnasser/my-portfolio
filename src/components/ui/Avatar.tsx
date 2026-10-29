import { profile } from '../../data/profile'
import { useLanguage, useLocalized } from '../../i18n/context'

interface AvatarProps {
  size?: number
  className?: string
}

/** Circular portrait with a Telegram-blue signal ring. Falls back to a monogram until a photo is supplied. */
export function Avatar({ size = 96, className = '' }: AvatarProps) {
  const { t } = useLanguage()
  const localize = useLocalized()
  const initials = 'MA'
  return (
    <div
      className={`relative shrink-0 rounded-full p-[2px] ${className}`}
      style={{ width: size, height: size, backgroundImage: 'conic-gradient(from 200deg, var(--accent), var(--accent-2), var(--accent-deep), var(--accent))' }}
    >
      <div className="themed flex h-full w-full items-center justify-center overflow-hidden rounded-full border-[3px] border-bg bg-surface-2">
        {profile.photo ? (
          <img src={profile.photo} alt={t('hero.photoAlt')} width={size} height={size} className="h-full w-full object-cover" decoding="async" fetchPriority="high" />
        ) : (
          <span role="img" aria-label={localize(profile.name)} className="latin font-display text-signal select-none font-bold tracking-tight" style={{ fontSize: size * 0.34 }}>
            {initials}
          </span>
        )}
      </div>
    </div>
  )
}
