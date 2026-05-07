import { Link } from '@heroui/react'

interface LogoProps {
  size?: 'sm' | 'md'
  href?: string | null
}

export function Logo({ size = 'md', href = '/' }: LogoProps) {
  const dim = size === 'sm' ? 'w-7 h-7' : 'w-8 h-8'
  const text = size === 'sm' ? 'text-[15px]' : 'text-[17px]'

  const inner = (
    <>
      <div
        className={`${dim} relative rounded-lg bg-[var(--ink-900)] flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]`}
      >
        <span className="font-serif italic text-[var(--brand-400)] text-base leading-none translate-y-[-1px]">D</span>
        <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-[var(--brand-400)] ring-2 ring-white" />
      </div>
      <span className={`${text} font-medium text-[var(--ink-900)] tracking-tight`}>Docuflash</span>
    </>
  )

  if (href === null) {
    return <div className="flex items-center gap-2">{inner}</div>
  }

  return (
    <Link href={href} className="flex items-center gap-2 no-underline">
      {inner}
    </Link>
  )
}
