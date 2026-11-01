import { Canvas, useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import * as THREE from 'three'
import { useTheme } from '../../theme/context'
import { scenePalettes } from './palette'

const PARTICLES = 1800 // mobile-safe baseline

/** Deterministic halo positions, generated once at module load (seeded LCG keeps renders pure). */
const particlePositions = (() => {
  let seed = 1337
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296
    return seed / 4294967296
  }
  const arr = new Float32Array(PARTICLES * 3)
  for (let i = 0; i < PARTICLES; i++) {
    // Shell between radius 2.6 and 6.5, flattened toward the equator for a disc-like halo.
    const r = 2.6 + rand() ** 0.6 * 3.9
    const theta = rand() * Math.PI * 2
    const phi = Math.acos(2 * rand() - 1)
    arr[i * 3] = r * Math.sin(phi) * Math.cos(theta)
    arr[i * 3 + 1] = r * Math.cos(phi) * 0.55
    arr[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta)
  }
  return arr
})()

/** Soft round sprite so particles read as glowing dots rather than squares. */
let spriteCache: THREE.Texture | null = null
function particleSprite() {
  if (spriteCache) return spriteCache
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const ctx = c.getContext('2d')!
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.35, 'rgba(255,255,255,0.8)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 64, 64)
  spriteCache = new THREE.CanvasTexture(c)
  return spriteCache
}

function Particles({ color, animate }: { color: string; animate: boolean }) {
  const ref = useRef<THREE.Points>(null)
  const positions = particlePositions
  const sprite = useMemo(() => particleSprite(), [])

  useFrame((_, dt) => {
    if (!animate || !ref.current) return
    ref.current.rotation.y += dt * 0.03
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial map={sprite} alphaMap={sprite} color={color} size={0.032} sizeAttenuation transparent opacity={0.75} depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  )
}


interface HeroSceneProps {
  /** Element whose pointer movement drives the parallax (the hero section). */
  eventSource: RefObject<HTMLElement | null>
  /** False under reduced motion: renders a single still frame. */
  animate: boolean
}

export default function HeroScene({ eventSource, animate }: HeroSceneProps) {
  const { theme } = useTheme()
  const palette = scenePalettes[theme]
  const [visible, setVisible] = useState(true)
  const wrap = useRef<HTMLDivElement>(null)

  // Pause rendering while the hero is scrolled out of view.
  useEffect(() => {
    const el = wrap.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.02 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const frameloop = animate && visible ? 'always' : 'demand'

  return (
    <div ref={wrap} className="absolute inset-0" aria-hidden="true">
      <Canvas
        dpr={[1, 1.6]}
        frameloop={frameloop}
        eventSource={eventSource as RefObject<HTMLElement>}
        eventPrefix="client"
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance', toneMapping: THREE.ACESFilmicToneMapping }}
        camera={{ position: [0, 0, 7], fov: 40 }}
        style={{ pointerEvents: 'none' }}
      >
        <Particles color={palette.accent} animate={animate} />
      </Canvas>
    </div>
  )
}
