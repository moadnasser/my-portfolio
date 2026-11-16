import { LoadImg } from './LoadImg'

/* Device frames drawn in CSS around real screenshots. Sizes are relative, so a frame scales with its parent. */

/** Screens are ~9:19.5; frame proportions follow. */
export function IPhone({ src, alt, eager = false }: { src: string; alt: string; eager?: boolean }) {
  return (
    <div className="relative aspect-[0.49] h-full rounded-[13%/6%] bg-[#0b1218] p-[3.2%] product-shadow">
      <span className="absolute top-[18%] -left-[1.4%] h-[6%] w-[1.4%] rounded-l bg-[#1b2530]" />
      <span className="absolute top-[27%] -left-[1.4%] h-[10%] w-[1.4%] rounded-l bg-[#1b2530]" />
      <span className="absolute top-[24%] -right-[1.4%] h-[13%] w-[1.4%] rounded-r bg-[#1b2530]" />
      <div className="relative size-full overflow-hidden rounded-[10.5%/4.9%] bg-white">
        <LoadImg src={src} alt={alt} loading={eager ? 'eager' : 'lazy'} decoding="async" className="size-full object-cover object-top" />
        <span className="absolute left-1/2 top-[1.6%] h-[3.2%] w-[30%] -translate-x-1/2 rounded-full bg-[#0b1218]" />
      </div>
    </div>
  )
}

/** Android: slimmer, squarer bezel with a punch-hole camera. */
export function AndroidPhone({ src, alt, eager = false }: { src: string; alt: string; eager?: boolean }) {
  return (
    <div className="relative aspect-[0.48] h-full rounded-[9%/4.3%] bg-[#1c2733] p-[2.4%] product-shadow">
      <span className="absolute top-[20%] -right-[1.2%] h-[8%] w-[1.2%] rounded-r bg-[#2a3743]" />
      <span className="absolute top-[31%] -right-[1.2%] h-[5%] w-[1.2%] rounded-r bg-[#2a3743]" />
      <div className="relative size-full overflow-hidden rounded-[7.5%/3.6%] bg-white">
        <LoadImg src={src} alt="" loading={eager ? 'eager' : 'lazy'} decoding="async" className="size-full object-cover object-top" />
        <span className="absolute left-1/2 top-[1.4%] size-[4.2%] -translate-x-1/2 rounded-full bg-[#0b1218] ring-2 ring-[#0b1218]/20" />
      </div>
      <span className="sr-only">{alt}</span>
    </div>
  )
}

export function BrowserWindow({ src, alt, eager = false }: { src: string; alt: string; eager?: boolean }) {
  return (
    <div className="overflow-hidden rounded-[2.2%/3.6%] border border-black/10 bg-white product-shadow dark:border-white/10">
      <div className="flex h-4 items-center gap-1 bg-[#e8edf2] px-2 sm:h-5 dark:bg-[#1b2530]">
        <span className="size-[0.45rem] rounded-full bg-black/15 dark:bg-white/25" />
        <span className="size-[0.45rem] rounded-full bg-black/10 dark:bg-white/18" />
        <span className="size-[0.45rem] rounded-full bg-black/8 dark:bg-white/12" />
      </div>
      <LoadImg src={src} alt={alt} loading={eager ? 'eager' : 'lazy'} decoding="async" className="block aspect-[16/10] w-full object-cover object-top" />
    </div>
  )
}
