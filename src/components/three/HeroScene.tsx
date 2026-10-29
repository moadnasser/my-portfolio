import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Float, MeshDistortMaterial } from '@react-three/drei'
import { useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import * as THREE from 'three'
import { useTheme } from '../../theme/context'
import { scenePalettes, type ScenePalette } from './palette'

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
      <pointsMaterial map={sprite} alphaMap={sprite} color={color} size={0.07} sizeAttenuation transparent opacity={0.85} depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  )
}

function SignalCore({ palette, animate }: { palette: ScenePalette; animate: boolean }) {
  const group = useRef<THREE.Group>(null)
  const wire = useRef<THREE.Mesh>(null)
  const ringA = useRef<THREE.Mesh>(null)
  const ringB = useRef<THREE.Mesh>(null)
  const { viewport, size } = useThree()
  const target = useMemo(() => new THREE.Vector3(), [])

  useFrame((state, dt) => {
    const g = group.current
    if (!g) return
    // Wide screens: object sits on the end side behind the CTAs. Narrow: smaller, in the upper half above the copy.
    const wide = size.width >= 1024
    const rtl = document.documentElement.getAttribute('dir') === 'rtl'
    const side = rtl ? -1 : 1
    target.set(wide ? side * viewport.width * 0.26 : 0, wide ? 0.1 : viewport.height * 0.26, 0)
    g.position.lerp(target, 0.06)
    const scale = wide ? 0.78 : 0.42
    g.scale.setScalar(THREE.MathUtils.lerp(g.scale.x || scale, scale, 0.08))

    if (!animate) return
    // Pointer parallax (pointer is tracked over the whole hero via eventSource).
    const px = state.pointer.x
    const py = state.pointer.y
    g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, px * 0.35, 0.04)
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, -py * 0.25, 0.04)

    if (wire.current) {
      wire.current.rotation.y -= dt * 0.12
      wire.current.rotation.z += dt * 0.05
    }
    if (ringA.current) ringA.current.rotation.z += dt * 0.25
    if (ringB.current) ringB.current.rotation.z -= dt * 0.18
  })

  return (
    <group ref={group}>
      <Float speed={animate ? 1.4 : 0} rotationIntensity={animate ? 0.35 : 0} floatIntensity={animate ? 0.9 : 0}>
        {/* Liquid core */}
        <mesh>
          <sphereGeometry args={[1.18, 96, 96]} />
          <MeshDistortMaterial
            color={palette.body}
            distort={animate ? 0.38 : 0}
            speed={animate ? 1.6 : 0}
            metalness={palette.light ? 0.3 : 0.7}
            roughness={palette.light ? 0.45 : 0.25}
            emissive={palette.deep}
            emissiveIntensity={palette.light ? 0.04 : 0.14}
            transparent
            opacity={palette.light ? 0.82 : 1}
          />
        </mesh>

        {/* Wireframe shell */}
        <mesh ref={wire}>
          <icosahedronGeometry args={[1.85, 1]} />
          <meshBasicMaterial color={palette.wire} wireframe transparent opacity={palette.light ? 0.3 : 0.42} />
        </mesh>

        {/* Orbit rings */}
        <mesh ref={ringA} rotation={[Math.PI / 2.3, 0.4, 0]}>
          <torusGeometry args={[2.45, 0.012, 12, 160]} />
          <meshBasicMaterial color={palette.accent2} transparent opacity={0.75} />
        </mesh>
        <mesh ref={ringB} rotation={[Math.PI / 1.7, -0.6, 0.3]}>
          <torusGeometry args={[2.9, 0.008, 12, 160]} />
          <meshBasicMaterial color={palette.accent} transparent opacity={0.4} />
        </mesh>

        {/* Signal beads on the inner ring */}
        <mesh position={[2.45, 0, 0]} rotation={[Math.PI / 2.3, 0.4, 0]}>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshBasicMaterial color={palette.accent2} />
        </mesh>
      </Float>
    </group>
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
        <hemisphereLight args={[palette.light ? '#ffffff' : '#9fe8dc', palette.light ? '#9fb4b8' : '#06110f', palette.light ? 1.2 : 0.7]} />
        <pointLight position={[4, 3, 4]} intensity={palette.light ? 30 : 55} color={palette.accent2} />
        <pointLight position={[-4, -2, 3]} intensity={palette.light ? 14 : 22} color="#ffffff" />
        <directionalLight position={[-2, 5, 3]} intensity={palette.light ? 1.6 : 0.8} color="#ffffff" />
        <SignalCore palette={palette} animate={animate} />
        <Particles color={palette.accent} animate={animate} />
      </Canvas>
    </div>
  )
}
