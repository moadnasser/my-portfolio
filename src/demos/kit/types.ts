import type { ComponentType } from 'react'
import type { Localized } from '../../data/types'

/** One "try this" step shown in the demo side panel. Ticks itself when the demo calls `complete(id)`. */
export interface DemoTask {
  id: string
  label: Localized
}

export interface DemoDefinition {
  /** Phone apps render inside a phone frame on large screens; web apps inside a browser window. */
  frame: 'phone' | 'browser'
  /** Text shown in the browser frame's address pill. Never a real, clickable URL. */
  windowLabel?: string
  tasks: DemoTask[]
  /** Short line under the title in the demo panel. */
  intro: Localized
  App: ComponentType
}
