export type ButtonVariant = 'primary' | 'secondary' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

const sizes: Record<ButtonSize, string> = { sm: 'btn-sm', md: '', lg: 'btn-lg' }

/**
 * One button grammar (see `.btn` in the stylesheet): square-shouldered blocks whose ground is
 * replaced on hover by a fill rising from below. No shadows; the press state is a quick scale.
 */
export function buttonClasses(variant: ButtonVariant = 'primary', size: ButtonSize = 'md', extra = '') {
  return `btn btn-${variant} ${sizes[size]} ${extra}`.replace(/\s+/g, ' ').trim()
}
