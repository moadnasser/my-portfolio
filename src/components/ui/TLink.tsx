import { forwardRef, type MouseEvent } from 'react'
import { flushSync } from 'react-dom'
import { Link, useNavigate, type LinkProps } from 'react-router'

type Starter = { startViewTransition?: (update: () => void) => unknown }

/**
 * A router link that changes page inside a view transition, so elements sharing a
 * `view-transition-name` (a project's device shot on a card and on its page) morph into each
 * other and the rest cross-fades. Falls back to a normal navigation where the API is missing,
 * under reduced motion, and for modified clicks (new tab, etc.).
 */
export const TLink = forwardRef<HTMLAnchorElement, LinkProps>(function TLink({ to, onClick, replace, ...rest }, ref) {
  const navigate = useNavigate()
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e)
    const start = (document as Starter).startViewTransition
    if (e.defaultPrevented || !start || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    e.preventDefault()
    start.call(document, () => flushSync(() => navigate(to, { replace })))
  }
  return <Link ref={ref} to={to} replace={replace} onClick={handle} {...rest} />
})
