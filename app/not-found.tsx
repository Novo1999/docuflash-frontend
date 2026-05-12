import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Page Not Found',
  robots: {
    index: false,
    follow: false,
  },
}

const NotFound = () => {
  return (
    <main className="min-h-screen bg-[var(--brand-50)] flex items-center justify-center p-4">
      <section className="max-w-[440px] text-center flex flex-col items-center gap-5">
        <p className="text-sm font-medium text-[var(--brand-400)] font-sans">404</p>
        <h1 className="text-3xl font-serif text-[var(--ink-900)]">Page not found</h1>
        <p className="text-[var(--ink-600)] font-sans">
          The page you are looking for may have moved, expired, or never existed.
        </p>
        <Link
          href="/"
          className="bg-[var(--ink-900)] text-[var(--brand-50)] rounded-xl font-medium px-8 h-12 inline-flex items-center justify-center transition-colors hover:bg-[var(--ink-800)] font-sans"
        >
          Back to Home
        </Link>
      </section>
    </main>
  )
}

export default NotFound
