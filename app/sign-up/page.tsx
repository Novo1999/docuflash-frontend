import { AuthShell } from '@/components/auth/AuthShell'
import { SignUpForm } from '@/components/auth/SignUpForm'
import { Link } from '@heroui/react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Create account',
}

export default function SignUpPage() {
  return (
    <AuthShell
      badgeText="Free forever"
      title="Create your Docuflash account"
      subtitle="Larger uploads. Longer expiries. No credit card needed."
      footer={
        <>
          Already have an account?{' '}
          <Link href="/sign-in" className="text-[var(--brand-400)] hover:underline no-underline font-medium">
            Sign in
          </Link>
        </>
      }
    >
      <SignUpForm />
    </AuthShell>
  )
}
