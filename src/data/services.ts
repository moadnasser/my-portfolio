import { Boxes, Globe, Smartphone, Server, type LucideIcon } from 'lucide-react'

export interface Service {
  id: 'product' | 'web' | 'mobile' | 'backend'
  icon: LucideIcon
}

/** Titles and descriptions live in the locale files under `services.items.<id>`. */
export const services: Service[] = [
  { id: 'product', icon: Boxes },
  { id: 'web', icon: Globe },
  { id: 'mobile', icon: Smartphone },
  { id: 'backend', icon: Server },
]
