'use client'

import AvatarUploader from '@/components/auth/AvatarUploader'
import { useAuth } from '@/components/auth/useAuth'
import ThemeToggle from '@/components/shared/ThemeToggle'
import { Button, Spinner } from '@heroui/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { LuLogOut } from 'react-icons/lu'

const formatDate = (value: string) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
}

const ProfilePage = () => {
  const { status, user, isAuthenticated, openAuthModal, logout, updateProfile } = useAuth()
  const router = useRouter()
  const [expiryKey, setExpiryKey] = useState('7d')
  const [privacy, setPrivacy] = useState<'public' | 'protected'>('protected')
  const [savingSettings, setSavingSettings] = useState(false)

  useEffect(() => {
    if (!user) return
    if (user.defaultExpiry) setExpiryKey(user.defaultExpiry)
    setPrivacy(user.defaultPrivacy === 'public' ? 'public' : 'protected')
  }, [user])

  const handleSaveSettings = async () => {
    if (!user) return
    setSavingSettings(true)
    try {
      await updateProfile({ defaultExpiry: expiryKey, defaultPrivacy: privacy })
    } catch (error) {
      console.error(error)
    } finally {
      setSavingSettings(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

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
          <div className="rounded-xl border border-line bg-[var(--brand-alpha-4)] px-4 py-3">
            <dt className="text-xs text-[var(--ink-600)] uppercase tracking-wide">Sign-in method</dt>
            <dd className="text-sm text-[var(--ink-900)] mt-1 capitalize">{user.provider}</dd>
          </div>
          <div className="rounded-xl border border-line bg-[var(--brand-alpha-4)] px-4 py-3">
            <dt className="text-xs text-[var(--ink-600)] uppercase tracking-wide">Member since</dt>
            <dd className="text-sm text-[var(--ink-900)] mt-1">{formatDate(user.createdAt)}</dd>
          </div>
        </dl>

        <section className="rounded-3xl border border-line bg-[var(--brand-alpha-4)] p-6">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-[var(--ink-900)]">Upload defaults</p>
              <p className="text-sm text-[var(--ink-600)]">Save your preferred expiry and privacy for new shares.</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-[var(--ink-600)]">Appearance</span>
              <ThemeToggle />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-[var(--ink-900)] text-sm">
              <span>Default expiry</span>
              <select value={expiryKey} onChange={(event) => setExpiryKey(event.target.value)} className="rounded-2xl border border-line bg-white px-3 py-3 text-sm text-[var(--ink-900)] outline-none">
                <option value="1h">1 hour</option>
                <option value="6h">6 hours</option>
                <option value="24h">24 hours</option>
                <option value="3d">3 days</option>
                <option value="7d">7 days</option>
              </select>
            </label>

            <label className="flex flex-col gap-2 text-[var(--ink-900)] text-sm">
              <span>Default privacy</span>
              <select
                value={privacy}
                onChange={(event) => setPrivacy(event.target.value as 'public' | 'protected')}
                className="rounded-2xl border border-line bg-white px-3 py-3 text-sm text-[var(--ink-900)] outline-none"
              >
                <option value="protected">Protected</option>
                <option value="public">Public</option>
              </select>
            </label>
          </div>

          <div className="mt-6 flex justify-end">
            <Button onPress={handleSaveSettings} className="rounded-xl bg-[var(--ink-900)] text-[var(--brand-50)] px-6 py-3 text-sm hover:bg-[var(--ink-800)]" isPending={savingSettings}>
              Save settings
            </Button>
          </div>
        </section>

        <div>
          <Button onPress={handleLogout} variant="ghost" className="rounded-xl h-11 px-5 flex items-center gap-2 text-red-600 border border-red-500/30 hover:bg-red-500/10">
            <LuLogOut className="w-4 h-4" />
            Sign out
          </Button>
        </div>
      </div>
    </main>
  )
}

export default ProfilePage
