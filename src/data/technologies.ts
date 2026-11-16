/** The working stack: what the portfolio projects use, plus skills Moad listed himself (Python, Django). */
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
  { id: 'python', label: 'Python' },
  { id: 'django', label: 'Django' },
  { id: 'php', label: 'PHP' },
  { id: 'mysql', label: 'MySQL' },
  { id: 'sqlite', label: 'SQLite' },
  { id: 'vite', label: 'Vite' },
  { id: 'git', label: 'Git' },
]
