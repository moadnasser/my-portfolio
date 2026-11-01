import { createContext, useContext } from 'react'

export interface DemoContextValue {
  /** Mark a guided task as done. Safe to call repeatedly. */
  complete: (taskId: string) => void
  /** True when the demo renders full-screen on a phone instead of inside a frame. */
  fullscreen: boolean
}

export const DemoContext = createContext<DemoContextValue>({ complete: () => {}, fullscreen: false })

export function useDemo() {
  return useContext(DemoContext)
}
