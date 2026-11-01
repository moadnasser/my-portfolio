import type { DemoDefinition } from './kit/types'

/**
 * Projects that ship an interactive demo. Each loader is a separate chunk, so the
 * demos cost nothing until a visitor opens one.
 */
const loaders: Record<string, () => Promise<{ default: DemoDefinition }>> = {
  'uab-shipping': () => import('./uab-shipping'),
  travelyuk: () => import('./travelyuk'),
  meezan: () => import('./meezan'),
  'lati-report-studio': () => import('./lati-report-studio'),
}

export function hasDemo(projectId: string) {
  return projectId in loaders
}

export function demoPath(projectId: string) {
  return `/projects/${projectId}/demo`
}

const cache = new Map<string, Promise<DemoDefinition>>()

/** Stable promise per demo so React's `use()` can suspend on it. */
export function loadDemo(projectId: string) {
  let p = cache.get(projectId)
  if (!p) {
    p = loaders[projectId]().then((m) => m.default)
    cache.set(projectId, p)
  }
  return p
}

/** Warm the chunk on hover / focus of a "Try live demo" link. */
export function preloadDemo(projectId: string) {
  if (hasDemo(projectId)) void loadDemo(projectId)
}
