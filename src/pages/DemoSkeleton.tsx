/** Phone-shaped placeholder: status bar, header, a hero card and list rows. */
export function DemoSkeleton() {
  return (
    <div aria-hidden="true" className="flex aspect-[393/852] h-[min(88dvh,52rem)] max-w-full flex-col gap-4 overflow-hidden rounded-[2.6rem] border border-border bg-surface p-5 pt-6 shadow-[0_40px_80px_-40px_rgb(var(--shadow-color)/0.5)] max-sm:h-full max-sm:w-full max-sm:rounded-none max-sm:border-0">
      <div className="flex items-center justify-between">
        <span className="skeleton h-3 w-12 rounded-full" />
        <span className="skeleton h-3 w-16 rounded-full" />
      </div>
      <div className="mt-2 flex items-center gap-3">
        <span className="skeleton size-11 rounded-full" />
        <div className="flex flex-1 flex-col gap-2">
          <span className="skeleton h-3.5 w-1/2 rounded-full" />
          <span className="skeleton h-3 w-1/3 rounded-full" />
        </div>
      </div>
      <span className="skeleton h-36 w-full rounded-3xl" />
      <div className="grid grid-cols-3 gap-3">
        <span className="skeleton h-16 rounded-2xl" />
        <span className="skeleton h-16 rounded-2xl" />
        <span className="skeleton h-16 rounded-2xl" />
      </div>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="skeleton size-10 rounded-xl" />
          <div className="flex flex-1 flex-col gap-2">
            <span className="skeleton h-3 w-3/4 rounded-full" />
            <span className="skeleton h-2.5 w-1/2 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}
