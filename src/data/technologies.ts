/** Technologies that actually appear in the portfolio projects. Rendered as a monochrome text strip. */
export interface Technology {
  id: string
  label: string
}

export const technologies: Technology[] = [
  { id: 'flutter', label: 'Flutter' },
  { id: 'dart', label: 'Dart' },
  { id: 'react', label: 'React' },
  { id: 'typescript', label: 'TypeScript' },
  { id: 'nextjs', label: 'Next.js' },
  { id: 'tailwind', label: 'Tailwind CSS' },
  { id: 'firebase', label: 'Firebase' },
  { id: 'php', label: 'PHP' },
  { id: 'mysql', label: 'MySQL' },
  { id: 'sqlite', label: 'SQLite' },
  { id: 'vite', label: 'Vite' },
  { id: 'git', label: 'Git' },
]
