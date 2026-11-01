import { motion, useMotionValue, useReducedMotion, useSpring, useTransform, type MotionValue } from 'framer-motion'
import { Code2, MapPin, Play } from 'lucide-react'
import { useEffect, type ReactNode, type RefObject } from 'react'
import { useCanHover } from '../../hooks/useCanHover'
import { useLanguage } from '../../i18n/context'
import { EASE } from '../../lib/motion'

/** Cut-out size, so the image reserves its space before it loads (no layout shift). */
const W = 760
const H = 1220

/**
 * Hero portrait in an arch window. The head breaks out above the arch for depth, signal
 * ripples spread behind it, and the facts sit in one glass bar instead of over the photo.
 * Layers follow the pointer at different depths on desktop; static on touch and reduced motion.
 */
export function HeroPortrait({ trackRef }: { trackRef: RefObject<HTMLElement | null> }) {
  const { t } = useLanguage()
  const reduce = useReducedMotion()
  const canHover = useCanHover()
  const live = canHover && !reduce

  const px = useMotionValue(0)
  const py = useMotionValue(0)
  const sx = useSpring(px, { stiffness: 60, damping: 18, mass: 0.7 })
  const sy = useSpring(py, { stiffness: 60, damping: 18, mass: 0.7 })

  useEffect(() => {
    const el = trackRef.current
    if (!el || !live) return
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      px.set(((e.clientX - r.left) / r.width) * 2 - 1)
      py.set(((e.clientY - r.top) / r.height) * 2 - 1)
    }
    const leave = () => {
      px.set(0)
      py.set(0)
    }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    return () => {
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerleave', leave)
    }
  }, [trackRef, live, px, py])

  const rise = (delay: number, y = 28) => ({
    initial: reduce ? false : { opacity: 0, y },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 1, delay, ease: EASE },
  })

  return (
    <div className="relative mx-auto w-full select-none" style={{ aspectRatio: '4 / 5' }}>
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-[-14%] rounded-full opacity-80 blur-3xl" style={{ background: 'radial-gradient(closest-side, var(--glow-a), transparent 75%)' }} aria-hidden="true" />

      {/* Halo outline arch behind: the blue arch covers its sides and bottom, only the top arc shows */}
      <Depth x={sx} y={sy} depth={8} className="absolute inset-x-[8%] top-[13%] bottom-[12%]">
        <motion.div {...rise(0.1, 18)} className="size-full border border-accent/35" style={{ borderRadius: '50% 50% 2rem 2rem / 44.8% 44.8% 2rem 2rem' }} aria-hidden="true" />
      </Depth>

      {/* The arch window */}
      <Depth x={sx} y={sy} depth={8} className="absolute inset-x-[8%] top-[18%] bottom-0">
        <motion.div {...rise(0.15)} className="relative size-full overflow-hidden shadow-[0_50px_100px_-40px_rgb(var(--shadow-color)/0.7)]" style={{ borderRadius: '50% 50% 2rem 2rem / 41% 41% 2rem 2rem' }} aria-hidden="true">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,var(--accent-2)_0%,var(--accent)_48%,var(--accent-deep)_100%)] dark:bg-[linear-gradient(180deg,#1b6f9c_0%,#0d4f75_45%,#082e47_100%)]" />
          {/* Signal ripples behind the head */}
          <div className="absolute start-1/2 top-[22%] size-[140%] -translate-x-1/2 -translate-y-1/2 rtl:translate-x-1/2">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="absolute inset-0 rounded-full border border-white/25 motion-safe:animate-[ripple_6s_ease-out_infinite]"
                style={{ animationDelay: `${i * 2}s`, transform: reduce ? `scale(${0.4 + i * 0.25})` : undefined, opacity: reduce ? 0.5 : undefined }}
              />
            ))}
          </div>
          <div className="absolute inset-0 bg-[radial-gradient(60%_45%_at_50%_18%,rgba(255,255,255,0.35),transparent_70%)]" />
          {/* Slow light sweep */}
          <div className="absolute inset-y-0 -start-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/15 to-transparent motion-safe:animate-[sweep_9s_ease-in-out_infinite]" />
          {/* Fine dot texture */}
          <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(rgba(255,255,255,0.55)_1px,transparent_1px)] [background-size:16px_16px] [mask-image:linear-gradient(to_bottom,transparent,#000_40%,transparent)]" />
        </motion.div>
      </Depth>

      {/* Portrait: head rises above the arch; glow on the wrapper, fade mask on the image */}
      <Depth x={sx} y={sy} depth={-6} className="absolute inset-x-[8%] top-0 bottom-0 flex items-end justify-center [clip-path:inset(-20%_-30%_0_-30%_round_0_0_2rem_2rem)]">
        <motion.div {...rise(0.3, 40)} className="h-[104%] translate-y-[3%] [filter:drop-shadow(0_30px_34px_rgb(var(--shadow-color)/0.4))_drop-shadow(0_0_18px_color-mix(in_oklab,var(--accent-2)_30%,transparent))]">
          <img
            src="/portrait.webp"
            width={W}
            height={H}
            alt={t('hero.photoAlt')}
            fetchPriority="high"
            decoding="async"
            draggable={false}
            className="h-full w-auto max-w-none object-contain object-bottom"
            style={{ maskImage: 'linear-gradient(to bottom, #000 82%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, #000 82%, transparent 100%)' }}
          />
        </motion.div>
      </Depth>

      {/* Facts bar */}
      <Depth x={sx} y={sy} depth={14} className="absolute inset-x-[2%] bottom-[5%] z-10 flex justify-center">
        <motion.div {...rise(0.8, 16)} className="glass themed flex max-w-full items-center gap-1 rounded-full p-1.5 text-[13px] font-semibold text-text shadow-[0_24px_50px_-20px_rgb(var(--shadow-color)/0.6)] sm:text-sm">
          <Fact className="hidden sm:inline-flex">
            <Code2 className="size-4 text-accent" aria-hidden="true" />
            <span className="latin">Flutter · React</span>
          </Fact>
          <span className="hidden h-5 w-px bg-border sm:block" aria-hidden="true" />
          <Fact>
            <MapPin className="size-4 text-accent" aria-hidden="true" />
            {t('hero.location')}
          </Fact>
          <a href="#playground" className="inline-flex h-9 items-center gap-1.5 rounded-full bg-accent px-3 whitespace-nowrap text-on-accent transition-transform duration-200 hover:-translate-y-px active:scale-[0.97]">
            <Play className="size-3 fill-current" aria-hidden="true" />
            {t('hero.demosChip')}
          </a>
        </motion.div>
      </Depth>
    </div>
  )
}

function Fact({ children, className = 'inline-flex' }: { children: ReactNode; className?: string }) {
  return <span className={`${className} h-9 items-center gap-1.5 px-2.5 whitespace-nowrap sm:px-3`}>{children}</span>
}

/** Shifts with the pointer by `depth` px; negative depth moves against it. */
function Depth({ x, y, depth, className, children }: { x: MotionValue<number>; y: MotionValue<number>; depth: number; className: string; children: ReactNode }) {
  const tx = useTransform(x, (v) => v * depth)
  const ty = useTransform(y, (v) => v * depth * 0.6)
  return (
    <motion.div className={className} style={{ x: tx, y: ty }}>
      {children}
    </motion.div>
  )
}
