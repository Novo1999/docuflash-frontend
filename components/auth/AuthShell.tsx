import { Link } from '@heroui/react'
import { LuShield } from 'react-icons/lu'
import { Logo } from '../shared/Logo'
import { ThemeToggle } from '../shared/ThemeToggle'

interface AuthShellProps {
  title: string
  subtitle: string
  badgeText?: string
  children: React.ReactNode
  footer: React.ReactNode
}

export function AuthShell({ title, subtitle, badgeText, children, footer }: AuthShellProps) {
  return (
    <div className="min-h-screen bg-[var(--page)] flex flex-col font-sans">
      <header className="px-6 md:px-10 h-16 flex items-center justify-between border-b border-[var(--border-soft)] bg-[var(--surface)]/85 backdrop-blur-md">
        <Logo />
        <ThemeToggle />
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="grid w-full max-w-[1100px] grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-16 items-center">
          {/* Marketing column */}
          <aside className="hidden lg:flex flex-col gap-8 pr-4">
            {badgeText && (
              <span className="self-start inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--brand-alpha-12)] border border-[var(--brand-alpha-30)] text-[11px] font-medium tracking-wide text-[var(--brand-400)]">
                <LuShield className="w-3 h-3" />
                {badgeText}
              </span>
            )}
            <h1 className="text-5xl font-serif tracking-tight text-[var(--ink-900)] leading-[1.05]">
              The fastest way to share <em className="text-[var(--brand-400)] italic">a single document</em>.
            </h1>
            <p className="text-[15px] text-[var(--ink-600)] leading-relaxed max-w-[420px]">
              Docuflash gives you private, expiring links for any document — no clutter, no tracking. Sign in to unlock larger uploads, longer expiries, and a personal upload history.
            </p>
            <ul className="flex flex-col gap-3 text-sm text-[var(--ink-700)]">
              {[
                'Upload up to 100 MB per file',
                'Expiries up to 90 days',
                'Synced upload history across devices',
                'Password-protected sharing',
              ].map((line) => (
                <li key={line} className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-[var(--brand-alpha-12)] text-[var(--brand-400)] inline-flex items-center justify-center text-[10px] font-bold">
                    ✓
                  </span>
                  {line}
                </li>
              ))}
            </ul>
          </aside>

          {/* Form column */}
          <div className="w-full max-w-[440px] mx-auto lg:mx-0 flex flex-col gap-6">
            <div className="flex flex-col gap-2 text-center lg:text-left">
              <h2 className="text-3xl md:text-[34px] font-serif text-[var(--ink-900)] tracking-tight leading-tight">{title}</h2>
              <p className="text-sm text-[var(--ink-600)]">{subtitle}</p>
            </div>

            <div className="bg-[var(--surface)] border border-[var(--border-soft)] rounded-2xl p-6 md:p-7 shadow-[0_4px_40px_rgba(15,28,46,0.07)]">
              {children}
            </div>

            <p className="text-xs text-[var(--ink-600)] text-center lg:text-left">{footer}</p>
          </div>
        </div>
      </main>

      <footer className="px-6 md:px-10 py-5 border-t border-[var(--border-soft)] flex items-center justify-between text-xs text-[var(--ink-600)]">
        <span>© {new Date().getFullYear()} Docuflash Inc.</span>
        <div className="flex items-center gap-5">
          <Link href="/" className="hover:text-[var(--ink-900)] no-underline">Back to site</Link>
        </div>
      </footer>
    </div>
  )
}
