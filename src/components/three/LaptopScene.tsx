import { Canvas, useFrame, useThree } from '@react-three/fiber'
import type { MotionValue } from 'framer-motion'
import { useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { clamp01, ease, loadScreen, mix, panelGeometry, roundedRect, studioEnvironment } from './shapes'
import { INTRO } from './timeline'

/** Laptop proportions in world units. The display matches the 1158×814 demo captures. */
const W = 3.7
const D = 2.56
const T = 0.075
const LID_T = 0.05
const SW = 3.42
const SH = SW / (1158 / 814)
const CLOSED = Math.PI / 2 - 0.02
const OPEN = -0.2

interface RigProps {
  /** 0..1 scroll progress through the pinned section. */
  progress: MotionValue<number>
  screens: string[]
  /** Arabic layout: copy sits on the right, so the laptop moves to the left. */
  rtl: boolean
}

function Laptop({ progress, screens, rtl }: RigProps) {
  const rig = useRef<THREE.Group>(null)
  const lid = useRef<THREE.Group>(null)
  const screenMat = useRef<THREE.MeshBasicMaterial>(null)
  const textures = useRef<THREE.Texture[]>([])
  const shown = useRef(0)
  const level = useRef(0)
  const settled = useRef(false)
  const gl = useThree((state) => state.gl)
  const env = useMemo(() => studioEnvironment(gl, RoomEnvironment), [gl])

  const base = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(roundedRect(W, D, 0.16), { depth: T, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.012, bevelSegments: 3, curveSegments: 16 })
    g.rotateX(-Math.PI / 2)
    return g
  }, [])
  const lidGeo = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(roundedRect(W, D, 0.16), { depth: LID_T, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.01, bevelSegments: 3, curveSegments: 16 })
    // Hinge along the bottom edge; the display side faces +z.
    g.translate(0, D / 2, -LID_T)
    return g
  }, [])
  const screenGeo = useMemo(() => panelGeometry(SW, SH, 0.06).translate(0, D / 2, 0.012), [])
  const deckGeo = useMemo(() => new THREE.ShapeGeometry(roundedRect(W * 0.86, D * 0.42, 0.06), 8).rotateX(-Math.PI / 2), [])
  const glassGeo = useMemo(() => new THREE.ShapeGeometry(roundedRect(W - 0.06, D - 0.06, 0.14), 12).translate(0, D / 2, 0.006), [])
  const padGeo = useMemo(() => new THREE.ShapeGeometry(roundedRect(W * 0.3, D * 0.28, 0.05), 8).rotateX(-Math.PI / 2), [])

  useEffect(() => {
    const aniso = gl.capabilities.getMaxAnisotropy()
    const loaded = screens.map((src, i) =>
      loadScreen(src, SW / SH, aniso, (t) => {
        const m = screenMat.current
        if (i === shown.current && m) {
          m.map = t
          m.needsUpdate = true
        }
      }),
    )
    textures.current = loaded
    return () => loaded.forEach((t) => t.dispose())
  }, [screens, gl])

  useFrame((state, dt) => {
    const g = rig.current
    const l = lid.current
    const m = screenMat.current
    if (!g || !l || !m) return
    const p = progress.get()
    const intro = ease(clamp01(p / INTRO))
    const n = screens.length
    const step = Math.min(n - 1, Math.floor(clamp01((p - INTRO) / (1 - INTRO)) * n))
    const portrait = state.viewport.aspect < 1
    const side = rtl ? -1 : 1

    const x = portrait ? 0 : side * state.viewport.width * 0.2
    const y = (portrait ? state.viewport.height * 0.1 : -0.95) + Math.sin(state.clock.elapsedTime * 0.7) * 0.03
    const scale = portrait ? state.viewport.width / (W * 1.18) : Math.min(0.98, (state.viewport.width * 0.4) / W)
    const ry = (portrait ? 0 : -side * 0.42) + state.pointer.x * 0.08 + (step - (n - 1) / 2) * side * 0.05
    const rx = mix(0.5, 0.2, intro) - state.pointer.y * 0.04
    // The lid lifts during the opening move, like opening the machine to start work.
    const hinge = mix(CLOSED, OPEN, intro)

    const k = settled.current ? 1 - Math.exp(-dt * 5.5) : 1
    settled.current = true
    g.position.x += (x - g.position.x) * k
    g.position.y += (y - g.position.y) * k
    g.scale.setScalar(g.scale.x + (scale - g.scale.x) * k)
    g.rotation.x += (rx - g.rotation.x) * k
    g.rotation.y += (ry - g.rotation.y) * k
    l.rotation.x += (hinge - l.rotation.x) * k

    // Screen change: dip to black, swap, come back up.
    const target = step === shown.current ? 1 : 0
    level.current += (target - level.current) * (1 - Math.exp(-dt * 12))
    const next = textures.current[step]
    if (step !== shown.current && level.current < 0.06 && next?.image) {
      shown.current = step
      m.map = next
      m.needsUpdate = true
    }
    m.color.setScalar(m.map ? level.current * intro : 0)
  })

  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 6, 6]} intensity={2} />
      <pointLight position={[-5, 2, -3]} intensity={50} color="#2aabee" />

      <group ref={rig} rotation={[0.5, 0, 0]}>
        <mesh geometry={base}>
          <meshStandardMaterial color="#aab4be" metalness={0.9} roughness={0.34} envMap={env} envMapIntensity={0.7} />
        </mesh>
        <mesh geometry={deckGeo} position={[0, T + 0.014, -D * 0.2]}>
          <meshStandardMaterial color="#10161d" metalness={0.3} roughness={0.7} />
        </mesh>
        <mesh geometry={padGeo} position={[0, T + 0.014, D * 0.27]}>
          <meshStandardMaterial color="#98a3ad" metalness={0.85} roughness={0.42} envMap={env} envMapIntensity={0.6} />
        </mesh>
        <group ref={lid} position={[0, T + 0.02, -D / 2]} rotation={[CLOSED, 0, 0]}>
          <mesh geometry={lidGeo}>
            <meshStandardMaterial color="#aab4be" metalness={0.9} roughness={0.34} envMap={env} envMapIntensity={0.7} />
          </mesh>
          {/* Black glass, then the lit display inside it. */}
          <mesh geometry={glassGeo}>
            <meshBasicMaterial color="#05080b" toneMapped={false} />
          </mesh>
          <mesh geometry={screenGeo}>
            <meshBasicMaterial ref={screenMat} color="#000000" toneMapped={false} />
          </mesh>
        </group>
      </group>
    </>
  )
}

interface LaptopSceneProps extends RigProps {
  eventSource: RefObject<HTMLElement | null>
}

/** A 3D laptop that opens as its section arrives, then shows the web app's screens step by step. */
export default function LaptopScene({ eventSource, ...rig }: LaptopSceneProps) {
  const [visible, setVisible] = useState(false)
  const wrap = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = wrap.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.01 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={wrap} className="absolute inset-0" aria-hidden="true">
      <Canvas
        dpr={[1, 2]}
        frameloop={visible ? 'always' : 'never'}
        eventSource={eventSource as RefObject<HTMLElement>}
        eventPrefix="client"
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance', toneMapping: THREE.ACESFilmicToneMapping }}
        camera={{ position: [0, 0, 9], fov: 30 }}
        style={{ pointerEvents: 'none' }}
      >
        <Laptop {...rig} />
      </Canvas>
    </div>
  )
}
