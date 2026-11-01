import { motion, useReducedMotion } from 'framer-motion'
import { Flag, Plane, Ship, Warehouse } from 'lucide-react'
import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useTheme } from '../../theme/context'
import type { CountryId, Method } from './data'

/**
 * Live shipment map, modelled on the real app's track-live screen (flutter_map):
 * completed leg solid, remaining leg dashed, a pulsing ship or plane on the route
 * and endpoint markers. The base is an offline dot map so the demo makes no
 * third-party requests. The dot map uses a Mercator projection, calibrated below.
 */
const W = 230
const EQUATOR_Y = 78.2
const R = 36.6

function project([lat, lon]: [number, number]) {
  return { x: ((lon + 180) / 360) * W, y: EQUATOR_Y - R * Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360)) }
}

const TRIPOLI: [number, number] = [32.9, 13.2]
const RED_SEA_TO_TRIPOLI: [number, number][] = [
  [12.6, 45.2],
  [20, 38.6],
  [27.5, 33.9],
  [30.1, 32.5],
  [33.2, 26],
  [33.4, 18],
  TRIPOLI,
]

/** Approximate shipping lanes (sea) and departure points. */
const seaRoutes: Record<CountryId, [number, number][]> = {
  china: [[23.1, 113.3], [16, 112], [6, 106], [1.3, 103.8], [5.6, 95], [5.8, 80], [12.6, 52], ...RED_SEA_TO_TRIPOLI],
  uae: [[25.2, 55.3], [26.4, 56.6], [22.5, 60], [14.5, 53], ...RED_SEA_TO_TRIPOLI],
  turkey: [[41, 29], [40.2, 26.4], [37.2, 25], [34.6, 20.5], TRIPOLI],
}
const origins: Record<CountryId, [number, number]> = { china: [23.1, 113.3], uae: [25.2, 55.3], turkey: [41, 29] }

function routePath(country: CountryId, method: Method) {
  if (method === 'sea') {
    const pts = seaRoutes[country].map(project)
    return pts.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ')
  }
  // Air: a gentle arc between the two airports.
  const a = project(origins[country])
  const b = project(TRIPOLI)
  const mx = (a.x + b.x) / 2
  const my = (a.y + b.y) / 2 - Math.hypot(b.x - a.x, b.y - a.y) * 0.22
  return `M${a.x.toFixed(2)} ${a.y.toFixed(2)} Q${mx.toFixed(2)} ${my.toFixed(2)} ${b.x.toFixed(2)} ${b.y.toFixed(2)}`
}

interface LiveMapProps {
  country: CountryId
  method: Method
  /** 0 = at origin, 1 = arrived in Tripoli. */
  progress: number
  statusLabel: string
  originLabel: string
  destinationLabel: string
  compact?: boolean
}

export function LiveMap({ country, method, progress, statusLabel, originLabel, destinationLabel, compact }: LiveMapProps) {
  const { theme } = useTheme()
  const reduce = useReducedMotion()
  const d = useMemo(() => routePath(country, method), [country, method])
  const pathRef = useRef<SVGPathElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const [pos, setPos] = useState(() => project(origins[country]))
  const [aspect, setAspect] = useState(compact ? 0.5 : 1.4)

  // Match the frame to the element's shape so the whole route always fits, on any screen.
  useLayoutEffect(() => {
    const el = svgRef.current
    if (!el) return
    const measure = () => el.clientWidth && setAspect(el.clientHeight / el.clientWidth)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useLayoutEffect(() => {
    const p = pathRef.current
    if (!p) return
    const pt = p.getPointAtLength(p.getTotalLength() * Math.min(1, Math.max(0, progress)))
    setPos({ x: pt.x, y: pt.y })
  }, [progress, d])

  // Frame the route with some breathing room.
  const a = project(origins[country])
  const b = project(TRIPOLI)
  const xs = [a.x, b.x, ...(method === 'sea' ? seaRoutes[country].map((p) => project(p).x) : [])]
  const ys = [a.y, b.y, ...(method === 'sea' ? seaRoutes[country].map((p) => project(p).y) : [])]
  const pad = compact ? 6 : 9
  const minX = Math.min(...xs) - pad
  const maxX = Math.max(...xs) + pad
  const minY = Math.min(...ys) - pad * 1.4
  const maxY = Math.max(...ys) + pad
  const routeW = maxX - minX
  const routeH = maxY - minY
  const vbW = Math.max(routeW, routeH / aspect)
  const vbH = vbW * aspect
  const vbX = (minX + maxX) / 2 - vbW / 2
  const vbY = (minY + maxY) / 2 - vbH / 2
  const unit = Math.min(vbW, vbH * 1.6) / (compact ? 100 : 78) // scale markers to the framed area
  const Vehicle = method === 'air' ? Plane : Ship

  return (
    <svg ref={svgRef} viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`} className="block size-full" preserveAspectRatio="xMidYMid meet" role="img" aria-label={`${originLabel} → ${destinationLabel}: ${statusLabel}`}>
      <rect x={vbX} y={vbY} width={vbW} height={vbH} fill="var(--surface-2)" />
      <image href="/demos/uab/world-dots.svg" x={0} y={0} width={W} height={126} style={{ filter: theme === 'dark' ? 'invert(1)' : undefined, opacity: theme === 'dark' ? 0.28 : 0.22 }} />
      {/* Contrast halo, remaining (dashed) and completed (solid) legs */}
      <path ref={pathRef} d={d} fill="none" stroke="var(--surface)" strokeOpacity={0.8} strokeWidth={unit * 1.6} strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} fill="none" stroke="var(--app-primary)" strokeOpacity={0.6} strokeWidth={unit * 0.7} strokeDasharray={`${unit * 2.2} ${unit * 1.5}`} strokeLinecap="round" />
      <motion.path d={d} fill="none" stroke="var(--app-primary)" strokeWidth={unit * 1.05} strokeLinecap="round" strokeLinejoin="round" pathLength={1} initial={false} animate={{ strokeDasharray: `${progress} 1` }} transition={{ duration: reduce ? 0 : 0.9, ease: 'easeOut' }} />

      <Endpoint x={a.x} y={a.y} unit={unit} label={originLabel} icon="origin" />
      <Endpoint x={b.x} y={b.y} unit={unit} label={destinationLabel} icon="destination" />

      <motion.g initial={false} animate={{ x: pos.x, y: pos.y }} transition={{ duration: reduce ? 0 : 0.9, ease: 'easeOut' }}>
        {!reduce && progress < 1 && (
          <circle r={unit * 4} fill="var(--app-primary)" opacity={0.25}>
            <animate attributeName="r" values={`${unit * 2.6};${unit * 5.2};${unit * 2.6}`} dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.35;0;0.35" dur="2s" repeatCount="indefinite" />
          </circle>
        )}
        <circle r={unit * 2.8} fill="var(--app-primary)" stroke="white" strokeWidth={unit * 0.5} />
        <Vehicle x={-unit * 1.6} y={-unit * 1.6} width={unit * 3.2} height={unit * 3.2} color="white" strokeWidth={2.4} />
        {!compact && (
          <g transform={`translate(0 ${-unit * 6.2})`}>
            <rect x={-unit * 9} y={-unit * 2.4} width={unit * 18} height={unit * 4.2} rx={unit * 2.1} fill="var(--surface)" stroke="var(--border)" strokeWidth={unit * 0.15} />
            <text textAnchor="middle" dominantBaseline="middle" y={-unit * 0.25} fontSize={unit * 2.1} fontWeight={600} fill="var(--text)">
              {statusLabel}
            </text>
          </g>
        )}
      </motion.g>
    </svg>
  )
}

function Endpoint({ x, y, unit, label, icon }: { x: number; y: number; unit: number; label: string; icon: 'origin' | 'destination' }) {
  const Icon = icon === 'origin' ? Warehouse : Flag
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={unit * 2.4} fill="var(--surface)" stroke="var(--app-primary)" strokeWidth={unit * 0.5} />
      <Icon x={-unit * 1.3} y={-unit * 1.3} width={unit * 2.6} height={unit * 2.6} color="var(--app-primary)" strokeWidth={2.2} />
      <text y={unit * 5.4} textAnchor="middle" fontSize={unit * 2.2} fontWeight={600} fill="var(--text)" stroke="var(--surface-2)" strokeWidth={unit * 0.6} paintOrder="stroke">
        {label}
      </text>
    </g>
  )
}
