import type { Metadata } from 'next'
import Link from 'next/link'
import AccountDeletionRequestForm from './AccountDeletionRequestForm'

export const metadata: Metadata = {
  title: 'Delete your account',
  description: 'Request deletion of your Docuflash account and associated data.',
}

export default function DeleteAccountPage() {
  return (
    <main className="flex-1 px-6 py-12 sm:py-20 font-sans">
      <div className="mx-auto max-w-xl space-y-7 rounded-2xl border border-line bg-surface p-6 sm:p-8">
        <header className="space-y-3">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-[var(--brand-400)]">Docuflash account deletion</p>
          <h1 className="text-4xl font-serif text-[var(--ink-900)]">Delete your account</h1>
          <p className="leading-7 text-[var(--ink-600)]">Request deletion even if you no longer have the app installed. We will email a verification link to the account address before any deletion occurs.</p>
        </header>

        <AccountDeletionRequestForm />

        <div className="space-y-2 border-t border-line pt-5 text-sm leading-6 text-[var(--ink-600)]">
          <p>After you confirm through the emailed link, we delete your account, profile information, documents, file metadata, share links, folders, file requests, notes, avatar, and authentication identity within 14 days. This cannot be undone.</p>
          <p>For details, read our <Link href="/privacy" className="text-[var(--brand-400)] hover:underline">Privacy Policy</Link> or contact <a href="mailto:novorony52@gmail.com" className="text-[var(--brand-400)] hover:underline">novorony52@gmail.com</a>.</p>
        </div>
      </div>
    </main>
  )
}
