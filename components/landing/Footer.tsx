'use cache'

import Link from 'next/link'
const Footer = async () => {
  return (
    <footer className="border-t border-line bg-[var(--brand-50)] px-6 py-8 flex items-center justify-center">
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-[var(--ink-600)] font-sans">
        <span>© {new Date().getFullYear()} Novodip. All rights reserved.</span>
        <Link href="/privacy" className="hover:text-[var(--ink-900)] hover:underline">
          Privacy Policy
        </Link>
        <Link href="/terms" className="hover:text-[var(--ink-900)] hover:underline">
          Terms of Use
        </Link>
        <Link href="/delete-account" className="hover:text-[var(--ink-900)] hover:underline">
          Delete account
        </Link>
      </div>
    </footer>
  )
}

export default Footer
