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
  dark: { accent: '#2dd4bf', accent2: '#5eead4', deep: '#0f766e', body: '#0b1418', wire: '#2dd4bf', light: false },
  light: { accent: '#0b7f73', accent2: '#14b8a6', deep: '#065f56', body: '#dfe8ea', wire: '#065f56', light: true },
}
