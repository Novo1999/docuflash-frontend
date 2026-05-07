import { Link } from '@heroui/react'
import { Logo } from '../shared/Logo'

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border-soft)] bg-[var(--page)] mt-12">
      <div className="max-w-[920px] mx-auto px-6 py-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
        <div className="flex flex-col gap-3 items-center md:items-start">
          <Logo size="sm" href="/" />
          <p className="text-xs text-[var(--ink-600)] font-sans max-w-[280px] text-center md:text-left">
            The fastest way to send a document. No accounts, no friction, no tracking.
          </p>
        </div>

        <div className="flex flex-col items-center md:items-end gap-3">
          <div className="flex items-center gap-5 text-sm font-sans">
            <Link href="#how-it-works" className="text-[var(--ink-600)] hover:text-[var(--ink-900)] no-underline">
              How it works
            </Link>
            <Link href="/sign-in" className="text-[var(--ink-600)] hover:text-[var(--ink-900)] no-underline">
              Sign in
            </Link>
            <Link href="/sign-up" className="text-[var(--ink-600)] hover:text-[var(--ink-900)] no-underline">
              Sign up
            </Link>
          </div>
          <span className="text-xs text-[var(--ink-600)] font-sans">
            © {new Date().getFullYear()} Docuflash Inc. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  )
}
