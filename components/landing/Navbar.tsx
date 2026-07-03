import docuflashLogo from '@/assets/docuflash.png'
import AuthButton from '@/components/auth/AuthButton'
import NoSignUpRequired from '@/components/landing/NoSignUpRequired'
import NavbarDrawer from '@/components/shared/NavbarDrawer'
import ThemeToggle from '@/components/shared/ThemeToggle'
import Image from 'next/image'
import Link from 'next/link'
import { LuShield } from 'react-icons/lu'
import PricingTooltip from './PricingTooltip'

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-10 bg-surface border-b border-line px-6 md:px-10 h-16 flex items-center justify-between font-sans">
      {/* Logo — monochrome wordmark; inverted to white in dark mode */}
      <Link href="/" className="flex items-center no-underline">
        <Image src={docuflashLogo} alt="Docuflash" className="h-10 w-auto dark:brightness-0 dark:invert" priority />
      </Link>

      {/* Nav Links — desktop only */}
      <div className="hidden md:flex items-center gap-8">
        <Link href="/#how-it-works" className="text-sm text-[var(--ink-600)] no-underline hover:text-[var(--ink-900)]">
          How it works
        </Link>
        <Link href="/request/new" className="text-sm text-[var(--ink-600)] no-underline hover:text-[var(--ink-900)]">
          Request files
        </Link>
        <PricingTooltip />
      </div>

      {/* Right side — desktop badge + auth */}
      <div className="hidden md:flex items-center gap-4">
        <NoSignUpRequired />
        <ThemeToggle />
        <AuthButton />
      </div>

      <NavbarDrawer />
    </nav>
  )
}

export default Navbar
