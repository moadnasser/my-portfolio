export interface Localized {
  en: string
  ar: string
}

export type ProjectCategory = 'web' | 'mobile' | 'backend' | 'uiux' | 'other'

/** Controls how the cover is framed in the gallery grid. */
export type CoverOrientation = 'landscape' | 'portrait' | 'square'

export interface Project {
  id: string
  title: Localized
  description: Localized
  /** Longer copy shown in the detail viewer. Falls back to `description` when omitted. */
  details?: Localized
  category: ProjectCategory
  technologies: string[]
  coverImage: string
  coverOrientation: CoverOrientation
  galleryImages: string[]
  liveUrl?: string
  sourceUrl?: string
  year?: number
  featured: boolean
  visibility: 'public' | 'hidden'
}

export interface SocialLink {
  id: 'github' | 'linkedin' | 'dribbble' | 'x' | 'instagram' | 'behance'
  label: string
  url: string
}

export interface Profile {
  name: Localized
  role: Localized
  email: string
  /** Path under /public to the CV file. Set to null until a CV is supplied; the button hides itself. */
  cvFile: string | null
  /** Path under /public to a square portrait. Null renders a monogram fallback. */
  photo: string | null
  /** Full international number without spaces, e.g. "+218910000000". Null hides the WhatsApp CTA. */
  whatsapp: string | null
  socials: SocialLink[]
}
