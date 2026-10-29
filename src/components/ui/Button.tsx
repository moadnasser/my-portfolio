import { forwardRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes } from 'react'

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

function buttonClasses(variant: ButtonVariant = 'primary', size: ButtonSize = 'md', extra = '') {
  return `${base} ${variants[variant]} ${sizes[size]} ${extra}`.trim()
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', className = '', type = 'button', ...rest },
  ref,
) {
  return <button ref={ref} type={type} className={buttonClasses(variant, size, className)} {...rest} />
})

interface ButtonLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  external?: boolean
}

export const ButtonLink = forwardRef<HTMLAnchorElement, ButtonLinkProps>(function ButtonLink(
  { variant = 'primary', size = 'md', className = '', external, ...rest },
  ref,
) {
  const safe = external ? { target: '_blank', rel: 'noopener noreferrer' } : {}
  return <a ref={ref} className={buttonClasses(variant, size, className)} {...safe} {...rest} />
})

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
}

/** Round icon-only control. `label` becomes the accessible name and tooltip. */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, className = '', type = 'button', children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      title={label}
      className={
        'glass themed inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-text-2 ' +
        'transition-[background-color,color,border-color,transform] duration-200 hover:border-accent/60 hover:text-text active:scale-95 ' +
        className
      }
      {...rest}
    >
      {children}
    </button>
  )
})
