import { useState } from 'react'

function detect(): boolean {
  if (typeof document === 'undefined') return false
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'))
  } catch {
    return false
  }
}

/** Whether this browser can create a WebGL context. Detected once on first render. */
export function useWebGL() {
  const [supported] = useState(detect)
  return supported
}
