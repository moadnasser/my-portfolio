import { forwardRef, type HTMLAttributes } from 'react'

export type TileTone = 'canvas' | 'parchment' | 'ink'

interface TileProps extends HTMLAttributes<HTMLElement> {
  tone?: TileTone
  /** Standard vertical breathing room. Turn off for tiles that manage their own edges. */
  pad?: boolean
}

/**
 * Full-bleed, square-cornered section. Tiles stack with no gap and no border: the change of
 * tone is the divider. An ink tile scopes the dark tokens to itself, so it stays graphite
 * in the light theme and everything inside (text, links, dark: utilities) follows.
 */
export const Tile = forwardRef<HTMLElement, TileProps>(function Tile({ tone = 'canvas', pad = true, className = '', ...rest }, ref) {
  return <section ref={ref} data-tone={tone} data-theme={tone === 'ink' ? 'dark' : undefined} className={`tile themed ${pad ? 'tile-pad' : ''} ${className}`} {...rest} />
})
