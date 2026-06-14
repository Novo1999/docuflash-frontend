'use client'

import AvatarUploader from '@/components/auth/AvatarUploader'
import { useAuth } from '@/components/auth/useAuth'
import { Button, Spinner } from '@heroui/react'
import Link from 'next/link'
import { LuLogOut } from 'react-icons/lu'

const formatDate = (value: string) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
}

const ProfilePage = () => {
  const { status, user, isAuthenticated, openAuthModal, logout } = useAuth()

  if (status === 'loading') {
    return (
      <main className="flex-1 flex items-center justify-center px-6 py-20">
        <Spinner className="text-[var(--ink-900)]" />
      </main>
    )
  }

  if (!isAuthenticated || !user) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center gap-4 px-6 py-20 text-center font-sans">
        <p className="text-xl font-serif text-[var(--ink-900)]">You&apos;re not signed in</p>
        <p className="text-sm text-[var(--ink-600)] max-w-sm">Sign in to view your profile and manage your uploads.</p>
        <div className="flex items-center gap-3">
          <Button onPress={openAuthModal} className="bg-[var(--ink-900)] text-[var(--brand-50)] rounded-full font-medium h-10 px-6 text-sm hover:bg-[var(--ink-800)]">
            Sign in
          </Button>
          <Link href="/" className="text-sm text-[var(--ink-600)] no-underline hover:text-[var(--ink-900)]">
            Back to home
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1 px-6 py-12 md:py-16 font-sans">
      <div className="max-w-2xl mx-auto flex flex-col gap-8">
        <div className="flex items-center gap-4">
          <AvatarUploader />
          <div className="min-w-0">
            <h1 className="text-2xl font-serif text-[var(--ink-900)] truncate">{user.displayName || 'Your account'}</h1>
            <p className="text-sm text-[var(--ink-600)] truncate">{user.email}</p>
          </div>
        </div>

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-black/10 bg-[var(--brand-alpha-4)] px-4 py-3">
            <dt className="text-xs text-[var(--ink-600)] uppercase tracking-wide">Sign-in method</dt>
            <dd className="text-sm text-[var(--ink-900)] mt-1 capitalize">{user.provider}</dd>
          </div>
          <div className="rounded-xl border border-black/10 bg-[var(--brand-alpha-4)] px-4 py-3">
            <dt className="text-xs text-[var(--ink-600)] uppercase tracking-wide">Member since</dt>
            <dd className="text-sm text-[var(--ink-900)] mt-1">{formatDate(user.createdAt)}</dd>
          </div>
        </dl>

        <div>
          <Button onPress={() => logout()} variant="ghost" className="rounded-xl h-11 px-5 flex items-center gap-2 text-red-600 border border-red-200 hover:bg-red-50">
            <LuLogOut className="w-4 h-4" />
            Sign out
          </Button>
        </div>
      </div>
    </main>
  )
}

export default ProfilePage
