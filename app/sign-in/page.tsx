import { AuthShell } from '@/components/auth/AuthShell'
import { SignInForm } from '@/components/auth/SignInForm'
import { Link } from '@heroui/react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign in',
}

export default function SignInPage() {
  return (
    <AuthShell
      badgeText="Welcome back"
      title="Sign in to Docuflash"
      subtitle="Pick up where you left off — your upload history syncs across devices."
      footer={
        <>
          New to Docuflash?{' '}
          <Link href="/sign-up" className="text-[var(--brand-400)] hover:underline no-underline font-medium">
            Create an account
          </Link>
        </>
      }
    >
      <SignInForm />
    </AuthShell>
  )
}
