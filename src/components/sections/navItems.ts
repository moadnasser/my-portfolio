/** Primary navigation. `id` matches the section's element id on the home page. */
export const navItems = [
  { id: 'work', key: 'nav.work', to: '/projects' },
  { id: 'playground', key: 'nav.playground', to: '/#playground' },
  { id: 'services', key: 'nav.services', to: '/#services' },
  { id: 'about', key: 'nav.about', to: '/#about' },
  { id: 'contact', key: 'nav.contact', to: '/#contact' },
] as const

export type NavId = (typeof navItems)[number]['id']
