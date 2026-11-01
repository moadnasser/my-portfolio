import { forwardRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes } from 'react'
import { buttonClasses, type ButtonSize, type ButtonVariant } from './buttonClasses'

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
