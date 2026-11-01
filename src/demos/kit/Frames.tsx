import { Signal, Wifi, BatteryFull } from 'lucide-react'
import { useLanguage } from '../../i18n/context'
import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'

/** Logical iPhone 15 screen size. The app always lays out at this size, like on a real device. */
const SCREEN = { w: 393, h: 852 }
const BEZEL = 12

/**
 * Phone shell for large screens. The device renders at true size and the whole thing is
 * scaled to fit the stage, so the app inside is never squeezed narrower than a real phone.
 */
export function PhoneFrame({ children }: { children: ReactNode }) {
  const { dir } = useLanguage()
  const stageRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.9)
  const outer = { w: SCREEN.w + BEZEL * 2, h: SCREEN.h + BEZEL * 2 }

  useLayoutEffect(() => {
    const el = stageRef.current
    if (!el) return
    // Height drives the size; the viewport width only caps it on narrow tablets.
    const fit = () => setScale(Math.min(1.06, el.clientHeight / outer.h, (window.innerWidth - 48) / outer.w))
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    return () => ro.disconnect()
  }, [outer.h, outer.w])

  return (
    <div ref={stageRef} className="grid h-full w-full place-items-center">
      <div style={{ width: outer.w * scale, height: outer.h * scale }} className="relative">
        <div
          dir="ltr"
          style={{ width: outer.w, height: outer.h, transform: `scale(${scale})`, padding: BEZEL }}
          className="absolute top-0 left-0 origin-top-left rounded-[3.6rem] bg-[#0b1218] shadow-[0_50px_100px_-30px_rgb(var(--shadow-color)/0.6),inset_0_0_0_1.5px_rgba(255,255,255,0.09)] ring-1 ring-black/40"
        >
          {/* Side buttons */}
          <span className="absolute -left-[3px] top-[150px] h-8 w-[3px] rounded-l bg-[#1b2530]" aria-hidden="true" />
          <span className="absolute -left-[3px] top-[200px] h-14 w-[3px] rounded-l bg-[#1b2530]" aria-hidden="true" />
          <span className="absolute -right-[3px] top-[220px] h-20 w-[3px] rounded-r bg-[#1b2530]" aria-hidden="true" />
          <div className="relative flex h-full flex-col overflow-hidden rounded-[2.9rem] bg-bg [container-type:size] [--safe-bottom:20px]" dir={dir}>
            <div className="pointer-events-none absolute inset-x-0 top-0 z-50 flex h-[54px] items-center justify-between px-8 pt-1 text-[15px] font-semibold text-text" dir="ltr" aria-hidden="true">
              <span className="latin w-16 text-center">9:41</span>
              <span className="absolute left-1/2 top-[11px] h-[34px] w-[124px] -translate-x-1/2 rounded-full bg-[#0b1218]" />
              <span className="flex w-16 items-center justify-center gap-1.5">
                <Signal className="size-4" />
                <Wifi className="size-4" />
                <BatteryFull className="size-5" />
              </span>
            </div>
            <div className="flex min-h-0 flex-1 flex-col pt-[54px]">{children}</div>
            <div className="pointer-events-none absolute inset-x-0 bottom-2 z-50 mx-auto h-[5px] w-36 rounded-full bg-text/70" aria-hidden="true" />
          </div>
        </div>
      </div>
    </div>
  )
}

/** Browser window chrome for the web demos. The label is plain text, never a link. */
export function BrowserFrame({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex h-full max-h-[860px] w-full flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_40px_90px_-40px_rgb(var(--shadow-color)/0.5)]">
      <div className="flex h-11 shrink-0 items-center gap-3 border-b border-border bg-surface-2 px-4" aria-hidden="true">
        <span className="flex gap-1.5">
          <span className="size-3 rounded-full bg-text-2/35" />
          <span className="size-3 rounded-full bg-text-2/25" />
          <span className="size-3 rounded-full bg-text-2/15" />
        </span>
        <span className="latin mx-auto flex h-7 min-w-0 max-w-sm flex-1 items-center justify-center truncate rounded-lg bg-bg px-3 text-xs text-text-2">
          {label}
        </span>
        <span className="w-12" />
      </div>
      <div className="relative flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  )
}
