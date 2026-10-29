import type { Theme } from '../../theme/context'

export interface ScenePalette {
  accent: string
  accent2: string
  deep: string
  body: string
  wire: string
  light: boolean
}

/** Scene colours per theme. Mirrors the --accent tokens in src/styles/index.css (three.js needs plain hex). */
export const scenePalettes: Record<Theme, ScenePalette> = {
  dark: { accent: '#2aabee', accent2: '#6ccbfa', deep: '#0a6fa3', body: '#0b1620', wire: '#2aabee', light: false },
  light: { accent: '#0a7cbd', accent2: '#2aabee', deep: '#005f8f', body: '#dce8f0', wire: '#0a6fa3', light: true },
}
