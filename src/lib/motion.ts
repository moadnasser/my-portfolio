/** Shared easing for entrance and layout transitions (ease-out-expo). */
export const EASE = [0.16, 1, 0.3, 1] as const
/** Slow-in, slow-out curve for curtains, wipes and other full-surface moves. */
export const CINE = [0.76, 0, 0.24, 1] as const

/** Durations in seconds, shared so related moves stay in step. */
export const DUR = {
  /** Label rolls, icon swaps. */
  swap: 0.35,
  /** Navigation pill following a hover or focus. */
  preview: 0.35,
  /** Navigation pill settling on the active section. */
  settle: 0.6,
  /** Theme reveal, in milliseconds (Web Animations API). */
  themeMs: 650,
} as const
/** Shortest time the "sending" state stays on screen, so the spinner never flashes. */
export const MIN_SENDING_MS = 600
/** How long the "sent" state holds before the button returns to idle. */
export const SENT_HOLD_MS = 4000
