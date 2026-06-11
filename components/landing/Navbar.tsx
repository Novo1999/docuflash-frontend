import docuflashLogo from '@/assets/docuflash.png'
import AuthButton from '@/components/auth/AuthButton'
import NavbarDrawer from '@/components/shared/NavbarDrawer'
import Image from 'next/image'
import Link from 'next/link'
import { LuShield } from 'react-icons/lu'
import PricingTooltip from './PricingTooltip'

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-10 bg-white border-b border-black/10 px-6 md:px-10 h-16 flex items-center justify-between font-sans">

      {/* Logo */}
      <Link href="/" className="flex items-center no-underline">
        <Image src={docuflashLogo} alt="Docuflash" className="h-10 w-auto" priority />
      </Link>

      {/* Nav Links — desktop only */}
      <div className="hidden md:flex items-center gap-8">
        <Link href="/#how-it-works" className="text-sm text-[var(--ink-600)] no-underline hover:text-[var(--ink-900)]">
          How it works
        </Link>
        <PricingTooltip />
      </div>

      {/* Right side — desktop badge + auth */}
      <div className="hidden md:flex items-center gap-4">
        <div className="flex items-center gap-1 bg-[var(--brand-alpha-12)] border border-[var(--brand-alpha-30)] px-3 py-1.5 rounded-full">
          <LuShield className="text-[var(--brand-400)] w-3 h-3" />
          <span className="text-xs font-medium text-[var(--brand-400)]">No sign-up required</span>
        </div>
        <AuthButton />
      </div>

      <NavbarDrawer />

    </nav>
  )
}

export default Navbar
