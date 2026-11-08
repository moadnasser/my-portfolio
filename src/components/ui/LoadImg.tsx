import { useCallback, useState, type ImgHTMLAttributes, type SyntheticEvent } from 'react'

/**
 * An <img> that shows a shimmering skeleton until the file has downloaded, then fades in.
 * Images without intrinsic size while loading (w-auto / h-auto) need an aspect class
 * scoped to `[&:not([data-loaded])]:` so the skeleton has room to show.
 */
export function LoadImg({ className = '', onLoad, onError, ...props }: ImgHTMLAttributes<HTMLImageElement>) {
  const [loaded, setLoaded] = useState(false)
  // Cached images can finish before React attaches onLoad.
  const ref = useCallback((el: HTMLImageElement | null) => {
    if (el?.complete && el.naturalWidth > 0) setLoaded(true)
  }, [])
  const done = (e: SyntheticEvent<HTMLImageElement>) => {
    setLoaded(true)
    onLoad?.(e)
  }
  return (
    <img
      ref={ref}
      {...props}
      onLoad={done}
      onError={(e) => {
        setLoaded(true)
        onError?.(e)
      }}
      data-loaded={loaded || undefined}
      className={`load-img ${className}`}
    />
  )
}
