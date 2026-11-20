import { Canvas, useFrame, useThree } from '@react-three/fiber'
import type { MotionValue } from 'framer-motion'
import { useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import * as THREE from 'three'
import { TURN, clamp01, ease, loadScreen, mix, panelGeometry, roundedRect, studioEnvironment } from './shapes'
import { INTRO } from './timeline'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

/**
 * Phone proportions in world units, after the iPhone Pro Max (about 78 × 163.4 × 8.75 mm): a
 * flat metal band with a tight edge radius, a black glass face with a thin even bezel and a small
 * island, and a display that matches the 720×1564 app screenshots. The back follows the 18 Pro
 * Max: a raised camera plateau across the full width with three lenses in a triangle, flash and
 * sensor at the far end, and a glass panel below that all but matches the metal around it.
 */
const W = 1.5
const H = 3.142
const R = 0.275
const DEPTH = 0.132
const BEVEL = 0.022
const FRONT = DEPTH / 2 + BEVEL
/** Glass sits just inside the band; the display sits inside the glass. */
const GLASS_INSET = 0.034
const BEZEL = 0.05
const SW = W - BEZEL * 2
const SH = H - BEZEL * 2
const SR = R - BEZEL
/** Side buttons as [x side, y centre, length]: action, volume up, volume down on one side; power on the other. */
const BUTTONS: [number, number, number][] = [
  [-1, 0.93, 0.13],
  [-1, 0.63, 0.24],
  [-1, 0.33, 0.24],
  [1, 0.5, 0.4],
]
/** Camera plateau: size, and the lenses on it relative to its centre. */
const PLATEAU = { w: W - 0.1, h: 0.9, r: 0.27, depth: 0.05 }
const LENSES: [number, number][] = [
  [-0.44, 0.2],
  [-0.44, -0.2],
  [-0.1, 0],
]
const TITANIUM = { color: '#8b929a', metalness: 1, roughness: 0.34 } as const
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
    const g = new THREE.ExtrudeGeometry(roundedRect(W, H, R), { depth: DEPTH, bevelEnabled: true, bevelThickness: BEVEL, bevelSize: BEVEL, bevelSegments: 4, curveSegments: 24 })
    g.translate(0, 0, -DEPTH / 2)
    return g
  }, [])
  const glassGeo = useMemo(() => new THREE.ShapeGeometry(roundedRect(W - GLASS_INSET, H - GLASS_INSET, R - GLASS_INSET / 2), 24), [])
  const screenGeo = useMemo(() => panelGeometry(SW, SH, SR), [])
  const islandGeo = useMemo(() => new THREE.ShapeGeometry(roundedRect(0.34, 0.108, 0.054), 12), [])
  const dotGeo = useMemo(() => new THREE.CircleGeometry(1, 24), [])
  const buttonGeo = useMemo(() => new THREE.BoxGeometry(1, 1, 1), [])
  const plateGeo = useMemo(() => new THREE.ExtrudeGeometry(roundedRect(PLATEAU.w, PLATEAU.h, PLATEAU.r), { depth: PLATEAU.depth, bevelEnabled: true, bevelThickness: 0.016, bevelSize: 0.016, bevelSegments: 4, curveSegments: 20 }), [])
  const insetGeo = useMemo(() => new THREE.ShapeGeometry(roundedRect(W - 0.2, H * 0.6, 0.22), 20), [])
  const ringGeo = useMemo(() => new THREE.CylinderGeometry(0.168, 0.168, 0.07, 44).rotateX(Math.PI / 2), [])
  const lensGeo = useMemo(() => new THREE.CylinderGeometry(0.124, 0.124, 0.076, 44).rotateX(Math.PI / 2), [])

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
          {/* Titanium band. */}
          <mesh geometry={body}>
            <meshStandardMaterial {...TITANIUM} envMap={env} envMapIntensity={0.85} />
          </mesh>
          {BUTTONS.map(([side, y, length]) => (
            <mesh key={`${side}${y}`} geometry={buttonGeo} position={[side * (W / 2 + BEVEL + 0.004), y, 0]} scale={[0.022, length, 0.052]}>
              <meshStandardMaterial {...TITANIUM} envMap={env} envMapIntensity={0.85} />
            </mesh>
          ))}

          {/* Front: black glass edge to edge, the lit display inside it, then the island with its lens. */}
          <mesh geometry={glassGeo} position={[0, 0, FRONT + 0.001]}>
            <meshBasicMaterial color="#020406" toneMapped={false} />
          </mesh>
          <mesh geometry={screenGeo} position={[0, 0, FRONT + 0.003]}>
            <meshBasicMaterial ref={screenMat} color="#0b1218" toneMapped={false} />
          </mesh>
          <mesh geometry={islandGeo} position={[0, SH / 2 - 0.15, FRONT + 0.005]}>
            <meshBasicMaterial color="#010203" toneMapped={false} />
          </mesh>
          <mesh geometry={dotGeo} position={[0.1, SH / 2 - 0.15, FRONT + 0.006]} scale={0.026}>
            <meshBasicMaterial color="#0c1826" toneMapped={false} />
          </mesh>

          {/* Back: metal shell, the glass panel that nearly matches it, and the camera plateau across the top. */}
          <group rotation={[0, Math.PI, 0]} position={[0, 0, -FRONT]}>
            <mesh geometry={glassGeo} position={[0, 0, 0.001]}>
              <meshStandardMaterial color="#5d666f" metalness={0.9} roughness={0.42} envMap={env} envMapIntensity={0.6} />
            </mesh>
            <mesh geometry={insetGeo} position={[0, -H * 0.145, 0.003]}>
              <meshStandardMaterial color="#555e68" metalness={0.5} roughness={0.22} envMap={env} envMapIntensity={0.75} />
            </mesh>
            <group position={[0, H / 2 - 0.05 - PLATEAU.h / 2, 0]}>
              <mesh geometry={plateGeo}>
                <meshStandardMaterial color="#59626c" metalness={0.9} roughness={0.4} envMap={env} envMapIntensity={0.65} />
              </mesh>
              {LENSES.map(([lx, ly]) => (
                <group key={`${lx}${ly}`} position={[lx, ly, PLATEAU.depth + 0.04]}>
                  <mesh geometry={ringGeo}>
                    <meshStandardMaterial {...TITANIUM} envMap={env} envMapIntensity={0.9} />
                  </mesh>
                  <mesh geometry={lensGeo} position={[0, 0, 0.004]}>
                    <meshStandardMaterial color="#04070b" metalness={1} roughness={0.06} envMap={env} envMapIntensity={1} />
                  </mesh>
                  <mesh geometry={dotGeo} position={[0, 0, 0.044]} scale={0.05}>
                    <meshBasicMaterial color="#10233a" toneMapped={false} />
                  </mesh>
                </group>
              ))}
              {/* Far end of the plateau: flash, microphone, depth sensor. */}
              <mesh geometry={dotGeo} position={[0.5, 0.2, PLATEAU.depth + 0.018]} scale={0.058}>
                <meshBasicMaterial color="#e6edf3" toneMapped={false} />
              </mesh>
              <mesh geometry={dotGeo} position={[0.5, 0, PLATEAU.depth + 0.018]} scale={0.014}>
                <meshBasicMaterial color="#05080c" toneMapped={false} />
              </mesh>
              <mesh geometry={dotGeo} position={[0.5, -0.2, PLATEAU.depth + 0.018]} scale={0.05}>
                <meshBasicMaterial color="#05080c" toneMapped={false} />
              </mesh>
            </group>
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
