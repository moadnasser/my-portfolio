export type ButtonVariant = 'primary' | 'secondary' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

const base =
  'inline-flex cursor-pointer items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap select-none ' +
  'transition-[transform,box-shadow,background-color,border-color,color] duration-200 ease-out ' +
  'active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none motion-reduce:hover:translate-y-0'

const variants: Record<ButtonVariant, string> = {
  primary: 'btn-primary shadow-[0_12px_30px_-14px_var(--ring)] hover:shadow-[0_18px_36px_-14px_var(--ring)] hover:-translate-y-0.5',
  secondary: 'glass text-text hover:border-accent/60 hover:-translate-y-0.5',
  ghost: 'bg-transparent text-text-2 hover:text-text hover:bg-surface-2',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-6 text-sm',
  lg: 'h-13 px-7 text-base',
}

export function buttonClasses(variant: ButtonVariant = 'primary', size: ButtonSize = 'md', extra = '') {
  return `${base} ${variants[variant]} ${sizes[size]} ${extra}`.trim()
}
