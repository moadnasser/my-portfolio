import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Float, useTexture } from '@react-three/drei'
import { Suspense, useEffect, useMemo, useRef, useState, type RefObject } from 'react'
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
      <pointsMaterial map={sprite} alphaMap={sprite} color={color} size={0.032} sizeAttenuation transparent opacity={0.75} depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  )
}


const EARTH_TEXTURES = {
  map: '/textures/earth/color.webp',
  normalMap: '/textures/earth/normal.webp',
  specularMap: '/textures/earth/specular.webp',
  emissiveMap: '/textures/earth/lights.webp',
  cloudMap: '/textures/earth/clouds.webp',
}
// Start fetching as soon as this chunk loads, before the Earth component mounts.
useTexture.preload(Object.values(EARTH_TEXTURES))

const EARTH_RADIUS = 1.25
const EARTH_TILT = 0.41 // 23.4°

const atmosphereShader = {
  vertexShader: /* glsl */ `
    varying vec3 vNormal;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform vec3 glowColor;
    uniform float strength;
    varying vec3 vNormal;
    void main() {
      float rim = pow(0.66 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0);
      gl_FragColor = vec4(glowColor, 1.0) * rim * strength;
    }
  `,
}

/** Textured Earth with clouds and a rim-lit atmosphere. Textures suspend; the wireframe shell renders meanwhile. */
function Earth({ palette, animate }: { palette: ScenePalette; animate: boolean }) {
  const surface = useRef<THREE.Mesh>(null)
  const clouds = useRef<THREE.Mesh>(null)
  const maps = useTexture(EARTH_TEXTURES)

  // Colour textures are sRGB; data textures (normal / specular) stay linear.
  useEffect(() => {
    for (const t of [maps.map, maps.emissiveMap, maps.cloudMap]) {
      t.colorSpace = THREE.SRGBColorSpace
      t.anisotropy = 8
      t.needsUpdate = true
    }
  }, [maps])

  const atmosphereUniforms = useMemo(
    () => ({ glowColor: { value: new THREE.Color(palette.accent) }, strength: { value: palette.light ? 0.55 : 1.1 } }),
    [palette],
  )

  useFrame((_, dt) => {
    if (!animate) return
    if (surface.current) surface.current.rotation.y += dt * 0.06
    if (clouds.current) clouds.current.rotation.y += dt * 0.08
  })

  return (
    <group rotation={[0, 0, EARTH_TILT]}>
      <mesh ref={surface}>
        <sphereGeometry args={[EARTH_RADIUS, 96, 96]} />
        <meshPhongMaterial
          map={maps.map}
          normalMap={maps.normalMap}
          normalScale={new THREE.Vector2(0.8, 0.8)}
          specularMap={maps.specularMap}
          specular={new THREE.Color(palette.light ? '#8fb6d6' : '#3d6f9c')}
          shininess={18}
          emissiveMap={maps.emissiveMap}
          emissive={new THREE.Color('#9fd8f5')}
          emissiveIntensity={palette.light ? 0 : 1.15}
        />
      </mesh>
      <mesh ref={clouds}>
        <sphereGeometry args={[EARTH_RADIUS * 1.012, 64, 64]} />
        <meshLambertMaterial map={maps.cloudMap} transparent opacity={palette.light ? 0.85 : 0.7} depthWrite={false} />
      </mesh>
      <mesh>
        <sphereGeometry args={[EARTH_RADIUS * 1.09, 64, 64]} />
        <shaderMaterial
          args={[{ ...atmosphereShader, uniforms: atmosphereUniforms, side: THREE.BackSide, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false }]}
        />
      </mesh>
    </group>
  )
}

/** Plain dark globe shown for the few hundred ms while textures download. */
function EarthFallback({ palette }: { palette: ScenePalette }) {
  return (
    <mesh>
      <sphereGeometry args={[EARTH_RADIUS, 48, 48]} />
      <meshStandardMaterial color={palette.body} roughness={0.6} metalness={0.2} />
    </mesh>
  )
}

function SignalCore({ palette, animate }: { palette: ScenePalette; animate: boolean }) {
  const group = useRef<THREE.Group>(null)
  const wire = useRef<THREE.Mesh>(null)
  const ringA = useRef<THREE.Mesh>(null)
  const ringB = useRef<THREE.Mesh>(null)
  const { viewport, size } = useThree()
  const target = useMemo(() => new THREE.Vector3(), [])
  const placed = useRef(false)

  useFrame((state, dt) => {
    const g = group.current
    if (!g) return
    // Wide screens: object sits on the end side behind the CTAs. Narrow: smaller, in the upper half above the copy.
    const wide = size.width >= 1024
    const rtl = document.documentElement.getAttribute('dir') === 'rtl'
    const side = rtl ? -1 : 1
    target.set(wide ? side * viewport.width * 0.315 : 0, wide ? 0.1 : viewport.height * 0.26, 0)
    const scale = wide ? 0.68 : 0.42
    if (!placed.current) {
      // First frame: land exactly on target so nothing slides in from the centre.
      g.position.copy(target)
      g.scale.setScalar(scale)
      placed.current = true
    } else {
      g.position.lerp(target, 0.08)
      g.scale.setScalar(THREE.MathUtils.lerp(g.scale.x, scale, 0.1))
    }

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
        {/* Planet */}
        <Suspense fallback={<EarthFallback palette={palette} />}>
          <Earth palette={palette} animate={animate} />
        </Suspense>

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
        <hemisphereLight args={[palette.light ? '#ffffff' : '#9fd8f5', palette.light ? '#9fb0bd' : '#061018', palette.light ? 0.9 : 0.28]} />
        <directionalLight position={[5, 2.5, 4]} intensity={palette.light ? 2.6 : 2.3} color="#ffffff" />
        <pointLight position={[-4, -2, 3]} intensity={palette.light ? 6 : 10} color={palette.accent2} />
        <SignalCore palette={palette} animate={animate} />
        <Particles color={palette.accent} animate={animate} />
      </Canvas>
    </div>
  )
}
