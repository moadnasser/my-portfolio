export type ButtonVariant = 'primary' | 'secondary' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

/**
 * One button grammar: full pills in the accent colour. No shadows, no hover lift;
 * the press state is a quick scale to 0.95 everywhere.
 */
const base =
  'inline-flex cursor-pointer items-center justify-center gap-2 rounded-full font-normal whitespace-nowrap select-none ' +
  'transition-[transform,background-color,border-color,color] duration-200 ease-out ' +
  'active:scale-95 disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none'

const variants: Record<ButtonVariant, string> = {
  primary: 'btn-primary',
  secondary: 'border border-accent text-accent hover:bg-accent/10',
  ghost: 'bg-transparent text-text-2 hover:text-text hover:bg-chip',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-[22px] text-[17px]',
  lg: 'h-[3.25rem] px-7 text-lg',
}

export function buttonClasses(variant: ButtonVariant = 'primary', size: ButtonSize = 'md', extra = '') {
  return `${base} ${variants[variant]} ${sizes[size]} ${extra}`.trim()
}
