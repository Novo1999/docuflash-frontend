import { NavbarDrawer } from '@/components/shared/NavbarDrawer'
import { Link } from '@heroui/react'
import { Logo } from '../shared/Logo'
import { ThemeToggle } from '../shared/ThemeToggle'
import { PricingTooltip } from './PricingTooltip'

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-30 bg-[var(--surface)]/85 backdrop-blur-md border-b border-[var(--border-soft)] px-6 md:px-10 h-16 flex items-center justify-between font-sans">
      <Logo />

      <div className="hidden md:flex items-center gap-8">
        <Link
          href="#how-it-works"
          className="text-sm text-[var(--ink-600)] no-underline hover:text-[var(--ink-900)] transition-colors"
        >
          How it works
        </Link>
        <PricingTooltip />
      </div>

      <div className="hidden md:flex items-center gap-3">
        <ThemeToggle />
        <span className="w-px h-5 bg-[var(--border-soft)]" />
        <Link href="/sign-in" className="text-sm text-[var(--ink-600)] no-underline hover:text-[var(--ink-900)] transition-colors">
          Sign in
        </Link>
        <Link
          href="/sign-up"
          className="bg-[var(--ink-900)] text-[var(--page)] rounded-full px-4 h-9 inline-flex items-center text-sm font-medium hover:opacity-90 no-underline transition-opacity"
        >
          Get started
        </Link>
      </div>

      <NavbarDrawer />
    </nav>
  )
}
