/** Soft teal lighting behind a surface. Purely decorative. */
export function Ambient({ className = '' }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      <div className="ambient -top-32 start-[8%] h-80 w-80 sm:h-[28rem] sm:w-[28rem]" style={{ background: 'var(--glow-a)' }} />
      <div className="ambient -bottom-24 end-[6%] h-72 w-72 sm:h-96 sm:w-96" style={{ background: 'var(--glow-b)' }} />
    </div>
  )
}
