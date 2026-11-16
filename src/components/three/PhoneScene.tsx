import { Canvas, useFrame, useThree } from '@react-three/fiber'
import type { MotionValue } from 'framer-motion'
import { useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import * as THREE from 'three'
import { TURN, clamp01, ease, loadScreen, mix, panelGeometry, roundedRect, studioEnvironment } from './shapes'
import { INTRO } from './timeline'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

/** Phone proportions in world units. The screen matches the 720×1564 app screenshots. */
const W = 1.5
const H = 3.12
const R = 0.27
const DEPTH = 0.12
const BEVEL = 0.035
const SW = 1.4
const SH = 3.02
const SR = 0.22
const FRONT = DEPTH / 2 + BEVEL
/** Sparse depth field behind the phone, generated once (seeded so renders stay pure). */
const DUST = 420
const dust = (() => {
  let seed = 4242
  const rand = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296)
  const arr = new Float32Array(DUST * 3)
  for (let i = 0; i < DUST; i++) {
    arr[i * 3] = (rand() - 0.5) * 16
    arr[i * 3 + 1] = (rand() - 0.5) * 9
    arr[i * 3 + 2] = -1.5 - rand() * 7
  }
  return arr
})()

interface RigProps {
  /** 0..1 scroll progress through the pinned section. */
  progress: MotionValue<number>
  screens: string[]
  /** Arabic layout: copy sits on the right, so the phone moves to the left. */
  rtl: boolean
  /** Light theme: darker dust so it shows on a white stage. */
  light: boolean
  /** Called once, when the first screen is lit and the phone is on canvas. */
  onReady?: () => void
  /** Element over the phone: dragging across it spins the phone, which then swings back to face front. */
  grab?: RefObject<HTMLElement | null>
}

function Phone({ progress, screens, rtl, light: lightTheme, onReady, grab }: RigProps) {
  const hand = useRef<THREE.Group>(null)
  const drag = useRef({ active: false, x: 0, angle: 0, velocity: 0 })

  useEffect(() => {
    const el = grab?.current
    if (!el) return
    const d = drag.current
    const down = (e: PointerEvent) => {
      d.active = true
      d.x = e.clientX
      d.velocity = 0
      el.setPointerCapture(e.pointerId)
    }
    const move = (e: PointerEvent) => {
      if (!d.active) return
      const dx = (e.clientX - d.x) * 0.012
      d.x = e.clientX
      d.angle += dx
      d.velocity = dx
    }
    const up = () => {
      d.active = false
    }
    el.addEventListener('pointerdown', down)
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerup', up)
    el.addEventListener('pointercancel', up)
    return () => {
      el.removeEventListener('pointerdown', down)
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerup', up)
      el.removeEventListener('pointercancel', up)
    }
  }, [grab])
  const announced = useRef(false)
  const ready = useRef(onReady)
  useEffect(() => {
    ready.current = onReady
  })
  const rig = useRef<THREE.Group>(null)
  const spin = useRef<THREE.Group>(null)
  const dustRef = useRef<THREE.Points>(null)
  const shown = useRef(0)
  const settled = useRef(false)
  const gl = useThree((state) => state.gl)
  const screenMat = useRef<THREE.MeshBasicMaterial>(null)
  const textures = useRef<THREE.Texture[]>([])

  const env = useMemo(() => studioEnvironment(gl, RoomEnvironment), [gl])

  const body = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(roundedRect(W, H, R), { depth: DEPTH, bevelEnabled: true, bevelThickness: BEVEL, bevelSize: BEVEL, bevelSegments: 5, curveSegments: 20 })
    g.translate(0, 0, -DEPTH / 2)
    return g
  }, [])
  const screenGeo = useMemo(() => panelGeometry(SW, SH, SR), [])
  const islandGeo = useMemo(() => new THREE.ShapeGeometry(roundedRect(0.44, 0.13, 0.065), 12), [])
  const plateGeo = useMemo(() => new THREE.ExtrudeGeometry(roundedRect(0.7, 0.72, 0.2), { depth: 0.03, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.012, bevelSegments: 3, curveSegments: 14 }), [])
  const lensGeo = useMemo(() => new THREE.CylinderGeometry(0.125, 0.125, 0.05, 36).rotateX(Math.PI / 2), [])

  const light = (t: THREE.Texture) => {
    const m = screenMat.current
    if (!m) return
    m.map = t
    m.color.set('#ffffff')
    m.needsUpdate = true
    if (!announced.current) {
      announced.current = true
      ready.current?.()
    }
  }

  useEffect(() => {
    const aniso = gl.capabilities.getMaxAnisotropy()
    const loaded: THREE.Texture[] = []
    textures.current = loaded
    // The first screen is all the opening needs; the rest download once it is on the phone.
    loaded[0] = loadScreen(screens[0], SW / SH, aniso, (t) => {
      if (shown.current === 0) light(t)
      screens.slice(1).forEach((src, i) => {
        loaded[i + 1] = loadScreen(src, SW / SH, aniso, () => {})
      })
    })
    return () => loaded.forEach((t) => t.dispose())
  }, [screens, gl])

  useFrame((state, dt) => {
    const g = rig.current
    const s = spin.current
    if (!g || !s) return
    const p = progress.get()
    const intro = ease(clamp01(p / INTRO))
    const n = screens.length
    const step = Math.min(n - 1, Math.floor(clamp01((p - INTRO) / (1 - INTRO)) * n))
    const portrait = state.viewport.aspect < 1
    const side = rtl ? -1 : 1

    // Opening pose: lying back, rising from below. Resting pose: upright beside the copy, turned towards it.
    const x = portrait ? 0 : mix(0, side * state.viewport.width * 0.21, intro)
    const y = mix(-state.viewport.height * 0.46, portrait ? state.viewport.height * 0.19 : 0, intro) + Math.sin(state.clock.elapsedTime * 0.8) * 0.035
    const scale = portrait ? mix(0.82, 0.56, intro) : mix(1.12, 1.1, intro)
    const tilt = mix(0, portrait ? 0 : -side * 0.36, intro)
    const rx = mix(-1.02, 0, intro) - state.pointer.y * 0.05
    const ry = tilt + step * TURN + state.pointer.x * 0.1

    // First frame snaps into place; after that everything eases, so fast scrolling still glides.
    const k = settled.current ? 1 - Math.exp(-dt * 5.5) : 1
    const kSpin = settled.current ? 1 - Math.exp(-dt * 3.4) : 1
    settled.current = true
    g.position.x += (x - g.position.x) * k
    g.position.y += (y - g.position.y) * k
    g.scale.setScalar(g.scale.x + (scale - g.scale.x) * k)
    g.rotation.x += (rx - g.rotation.x) * k
    s.rotation.y += (ry - s.rotation.y) * kSpin

    // Each step is one full turn: swap the screenshot while the back of the phone faces the camera.
    const facing = Math.min(n - 1, Math.max(0, Math.round((s.rotation.y - tilt) / TURN)))
    const next = textures.current[facing]
    if (facing !== shown.current && next?.image) {
      shown.current = facing
      light(next)
    }
    // A released drag keeps its momentum, then settles on the nearest front-facing turn.
    const d = drag.current
    if (!d.active) {
      d.angle += d.velocity
      d.velocity *= Math.exp(-dt * 4)
      if (Math.abs(d.velocity) < 0.004) d.angle += (Math.round(d.angle / TURN) * TURN - d.angle) * (1 - Math.exp(-dt * 4))
    }
    if (hand.current) hand.current.rotation.y = d.angle

    if (dustRef.current) dustRef.current.rotation.y = state.pointer.x * 0.03 + p * 0.25
  })

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 6, 6]} intensity={2.2} />
      <pointLight position={[-5, 1, -3]} intensity={60} color="#2aabee" />
      <pointLight position={[5, -3, -2]} intensity={30} color="#0088cc" />

      <points ref={dustRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[dust, 3]} />
        </bufferGeometry>
        <pointsMaterial color={lightTheme ? '#0a7cbd' : '#6ccbfa'} size={0.03} sizeAttenuation transparent opacity={lightTheme ? 0.4 : 0.55} depthWrite={false} />
      </points>

      <group ref={rig} position={[0, -3, 0]} rotation={[-1.02, 0, 0]}>
        <group ref={spin}>
          <group ref={hand}>
          <mesh geometry={body}>
            <meshStandardMaterial color="#27333f" metalness={0.92} roughness={0.3} envMap={env} envMapIntensity={0.55} />
          </mesh>
          {/* Glass front, then the lit screen and its camera island. */}
          <mesh geometry={screenGeo} position={[0, 0, FRONT + 0.002]}>
            <meshBasicMaterial ref={screenMat} color="#0b1218" toneMapped={false} />
          </mesh>
          <mesh geometry={islandGeo} position={[0, SH / 2 - 0.17, FRONT + 0.004]}>
            <meshBasicMaterial color="#05080b" toneMapped={false} />
          </mesh>
          {/* Back: camera plate with three lenses. */}
          <group rotation={[0, Math.PI, 0]} position={[0, 0, -FRONT]}>
            <mesh geometry={plateGeo} position={[-W / 2 + 0.5, H / 2 - 0.52, 0]}>
              <meshStandardMaterial color="#1c2630" metalness={0.9} roughness={0.38} envMap={env} envMapIntensity={0.55} />
            </mesh>
            {[
              [-0.16, 0.16],
              [-0.16, -0.16],
              [0.16, 0],
            ].map(([lx, ly]) => (
              <mesh key={`${lx}${ly}`} geometry={lensGeo} position={[-W / 2 + 0.5 + lx, H / 2 - 0.52 + ly, 0.055]}>
                <meshStandardMaterial color="#060b11" metalness={1} roughness={0.08} envMap={env} envMapIntensity={0.8} />
              </mesh>
            ))}
          </group>
          </group>
        </group>
      </group>
    </>
  )
}

interface PhoneSceneProps extends RigProps {
  /** Element whose pointer movement drives the parallax. */
  eventSource: RefObject<HTMLElement | null>
}

/** A real 3D phone showing the app's screens. Scroll position drives its pose and which screen is lit. */
export default function PhoneScene({ eventSource, ...rig }: PhoneSceneProps) {
  const [visible, setVisible] = useState(true)
  const wrap = useRef<HTMLDivElement>(null)

  // Stop rendering once the pinned stage has scrolled away.
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
        <Phone {...rig} />
      </Canvas>
    </div>
  )
}
