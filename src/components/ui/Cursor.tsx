import { useReducedMotion } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { useCanHover } from '../../hooks/useCanHover'

type State = 'default' | 'link' | 'view' | 'drag' | 'magnetic' | 'hidden'

/** Time constants, in seconds, for the ring catching the pointer and for its stretch relaxing. */
const FOLLOW = 0.016
const RELAX = 0.06
/** Pointer speed (px/s) at which the ring reaches its full stretch. */
const FULL_SPEED = 2600

/**
 * Custom cursor for mouse and trackpad. A dot sits exactly on the pointer; a ring follows within
 * a frame or two, stretching along the direction of travel and rounding off when the pointer rests.
 *
 * What is under the pointer picks the state:
 * - links and buttons: the ring grows and tints;
 * - `data-cursor="view"` / `"drag"` with `data-cursor-label`: a solid disc carrying the label;
 * - `data-cursor="magnetic"`: the ring snaps onto the element and frames it;
 * - `data-cursor-off`: controls inside a labelled area fall back to the link state;
 * - text fields and the modal search: the custom cursor steps aside for the native one.
 *
 * Nothing here re-renders React: position is written straight to the DOM from one
 * requestAnimationFrame loop that only runs while something is still moving, and states are a
 * data attribute styled in CSS. Under reduced motion the ring sits on the dot and never stretches.
 */
export function Cursor() {
  const fine = useCanHover()
  const reduce = useReducedMotion()
  const root = useRef<HTMLDivElement>(null)
  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)
  const stretch = useRef<HTMLDivElement>(null)
  const label = useRef<HTMLSpanElement>(null)
  const mag = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = root.current
    const dotEl = dot.current
    const ringEl = ring.current
    const stretchEl = stretch.current
    const labelEl = label.current
    const magEl = mag.current
    if (!fine || !el || !dotEl || !ringEl || !stretchEl || !labelEl || !magEl) return

    const html = document.documentElement
    html.classList.add('has-cursor')

    let px = 0
    let py = 0
    let rx = 0
    let ry = 0
    let sx = 1
    let sy = 1
    let angle = 0
    let raf = 0
    let last = 0
    let seen = false
    let state: State = 'default'
    let target: EventTarget | null = null
    let magnet: Element | null = null

    const frame = (now: number) => {
      raf = 0
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000))
      last = now
      let tx = px
      let ty = py
      if (state === 'magnetic' && magnet) {
        // The framed element may itself be moving (see Magnetic), so its live box is read each frame.
        const r = magnet.getBoundingClientRect()
        tx = r.left + r.width / 2
        ty = r.top + r.height / 2
      }
      const k = reduce ? 1 : 1 - Math.exp(-dt / FOLLOW)
      const dx = (tx - rx) * k
      const dy = (ty - ry) * k
      rx += dx
      ry += dy

      let wantX = 1
      let wantY = 1
      if (!reduce && (state === 'default' || state === 'link')) {
        const speed = Math.hypot(dx, dy) / dt
        const amount = Math.min(speed / FULL_SPEED, 1)
        wantX = 1 + amount * 0.2
        wantY = 1 - amount * 0.15
        if (speed > 60) angle = Math.atan2(dy, dx)
      }
      const e = 1 - Math.exp(-dt / RELAX)
      sx += (wantX - sx) * e
      sy += (wantY - sy) * e

      ringEl.style.transform = `translate3d(${rx}px,${ry}px,0)`
      stretchEl.style.transform = `rotate(${angle}rad) scale(${sx},${sy})`

      const settling = Math.abs(tx - rx) > 0.1 || Math.abs(ty - ry) > 0.1 || Math.abs(sx - 1) > 0.002
      if ((settling || state === 'magnetic') && !document.hidden) raf = requestAnimationFrame(frame)
    }
    const kick = () => {
      if (raf) return
      last = performance.now()
      raf = requestAnimationFrame(frame)
    }

    const resolve = (node: EventTarget | null) => {
      const at = node instanceof Element ? node : null
      let next: State = 'default'
      let text = ''
      let frameOn: Element | null = null
      if (at) {
        const host = at.closest<HTMLElement>('[data-cursor]')
        if (at.closest('dialog, input, textarea, select')) next = 'hidden'
        else if (at.closest('[data-cursor-off]')) next = 'link'
        else if (host?.dataset.cursor === 'magnetic') {
          next = 'magnetic'
          frameOn = host
        } else if (host?.dataset.cursor === 'view' || host?.dataset.cursor === 'drag') {
          next = host.dataset.cursor
          text = host.dataset.cursorLabel ?? ''
        } else if (at.closest('a, button, [role="button"], label, summary')) next = 'link'
      }
      if (frameOn && frameOn !== magnet) {
        // Sized once on entry; after that only transforms change.
        const r = frameOn.getBoundingClientRect()
        magEl.style.width = `${r.width + 10}px`
        magEl.style.height = `${r.height + 10}px`
        magEl.style.borderRadius = `calc(${getComputedStyle(frameOn).borderRadius} + 5px)`
      }
      magnet = frameOn
      if (text && labelEl.textContent !== text) labelEl.textContent = text
      if (next !== state) {
        state = next
        el.dataset.state = next
      }
    }

    const move = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      px = e.clientX
      py = e.clientY
      // The dot is the pointer: written here, not on the next frame.
      dotEl.style.transform = `translate3d(${px}px,${py}px,0)`
      if (!seen) {
        seen = true
        rx = px
        ry = py
        el.dataset.on = ''
      }
      if (e.target !== target) {
        target = e.target
        resolve(target)
      }
      kick()
    }
    const down = () => (el.dataset.press = '')
    const up = () => delete el.dataset.press
    const leave = () => {
      seen = false
      target = null
      delete el.dataset.on
    }
    const visible = () => !document.hidden && seen && kick()

    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerdown', down, { passive: true })
    window.addEventListener('pointerup', up, { passive: true })
    window.addEventListener('pointercancel', up, { passive: true })
    html.addEventListener('pointerleave', leave)
    window.addEventListener('blur', leave)
    document.addEventListener('visibilitychange', visible)
    return () => {
      cancelAnimationFrame(raf)
      html.classList.remove('has-cursor')
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerdown', down)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
      html.removeEventListener('pointerleave', leave)
      window.removeEventListener('blur', leave)
      document.removeEventListener('visibilitychange', visible)
    }
  }, [fine, reduce])

  if (!fine) return null
  return (
    <div ref={root} className="cur" data-state="default" aria-hidden="true">
      <div ref={ring} className="cur-ring">
        <div ref={stretch} className="cur-stretch">
          <div className="cur-shape" />
        </div>
        <div ref={mag} className="cur-mag" />
        <span ref={label} className="cur-label" />
      </div>
      <div ref={dot} className="cur-dot" />
    </div>
  )
}
