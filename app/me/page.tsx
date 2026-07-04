'use client'

import { formatMemberSince } from '@/app/utils/timeUtil'
import AvatarUploader from '@/components/auth/AvatarUploader'
import { useAuth } from '@/components/auth/useAuth'
import ThemeToggle from '@/components/shared/ThemeToggle'
import { Button, Description, Label, ListBox, Modal, Select, Spinner } from '@heroui/react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { FiAlertTriangle } from 'react-icons/fi'
import { LuLogOut } from 'react-icons/lu'

const ProfilePage = () => {
  const { status, user, isAuthenticated, openAuthModal, logout, updateProfile } = useAuth()
  const router = useRouter()
  const [expiryKey, setExpiryKey] = useState('7d')
  const [privacy, setPrivacy] = useState<'public' | 'protected'>('protected')
  const [savingSettings, setSavingSettings] = useState(false)
  const [isSignOutModalOpen, setSignOutModalOpen] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const pathname = usePathname()

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

  const handleLogoutClick = () => {
    setSignOutModalOpen(true)
  }

  const handleConfirmLogout = async () => {
    setIsSigningOut(true)
    try {
      await logout()
      router.push('/')
    } finally {
      setIsSigningOut(false)
      setSignOutModalOpen(false)
    }
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
            <dd className="text-sm text-[var(--ink-900)] mt-1">{formatMemberSince(user.createdAt)}</dd>
          </div>
        </dl>

        <section key={pathname} className="rounded-3xl border border-line bg-[var(--brand-alpha-4)] p-6">
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
            <div className="flex flex-col gap-2 text-[var(--ink-900)] text-sm">
              <span>Default expiry</span>
              <Select value={expiryKey} onChange={(key) => setExpiryKey(key as string)}>
                <Label className="sr-only">Default expiry</Label>
                <Select.Trigger className="rounded-2xl border border-line bg-[var(--brand-alpha-4)] px-3 py-3 text-sm text-[var(--ink-900)] outline-none text-left">
                  <Select.Value className="text-[var(--ink-900)]" />
                  <Select.Indicator />
                </Select.Trigger>
                <Description className="sr-only">Choose default expiry for new shares</Description>
                <Select.Popover>
                  <ListBox>
                    <ListBox.Item id="1h">
                      <Label>1 hour</Label>
                    </ListBox.Item>
                    <ListBox.Item id="6h">
                      <Label>6 hours</Label>
                    </ListBox.Item>
                    <ListBox.Item id="24h">
                      <Label>24 hours</Label>
                    </ListBox.Item>
                    <ListBox.Item id="3d">
                      <Label>3 days</Label>
                    </ListBox.Item>
                    <ListBox.Item id="7d">
                      <Label>7 days</Label>
                    </ListBox.Item>
                  </ListBox>
                </Select.Popover>
              </Select>
            </div>

            <div className="flex flex-col gap-2 text-[var(--ink-900)] text-sm">
              <span>Default privacy</span>
              <Select value={privacy} onChange={(key) => setPrivacy(key as 'public' | 'protected')}>
                <Label className="sr-only">Default privacy</Label>
                <Select.Trigger className="rounded-2xl border border-line bg-[var(--brand-alpha-4)] px-3 py-3 text-sm text-[var(--ink-900)] outline-none text-left">
                  <Select.Value className="text-[var(--ink-900)]" />
                  <Select.Indicator />
                </Select.Trigger>
                <Description className="sr-only">Who can access new shares by default</Description>
                <Select.Popover>
                  <ListBox>
                    <ListBox.Item id="protected">
                      <Label>Protected</Label>
                    </ListBox.Item>
                    <ListBox.Item id="public">
                      <Label>Public</Label>
                    </ListBox.Item>
                  </ListBox>
                </Select.Popover>
              </Select>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button onPress={handleSaveSettings} className="rounded-xl bg-[var(--ink-900)] text-[var(--brand-50)] px-6 py-3 text-sm hover:bg-[var(--ink-800)]" isPending={savingSettings}>
              Save settings
            </Button>
          </div>
        </section>

        <div>
          <Button onPress={handleLogoutClick} variant="ghost" className="rounded-xl h-11 px-5 flex items-center gap-2 text-red-600 border border-red-500/30 hover:bg-red-500/10">
            <LuLogOut className="w-4 h-4" />
            Sign out
          </Button>
        </div>
      </div>

      <Modal.Backdrop isOpen={isSignOutModalOpen} onOpenChange={setSignOutModalOpen}>
        <Modal.Container>
          <Modal.Dialog className="sm:max-w-[360px]">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Icon className="bg-red-500/15 text-red-500">
                <FiAlertTriangle className="size-5" />
              </Modal.Icon>
              <Modal.Heading>Sign out</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <p className="text-sm text-[var(--ink-600)] font-sans">Are you sure you want to sign out of your account? You can sign back in anytime.</p>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="ghost" onPress={() => setSignOutModalOpen(false)} className="flex-1 text-[var(--ink-600)] font-sans" isDisabled={isSigningOut}>
                Cancel
              </Button>
              <Button onPress={handleConfirmLogout} className="flex-1 bg-red-500 text-white hover:bg-red-600 font-sans font-medium" isPending={isSigningOut}>
                Sign out
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </main>
  )
}

export default ProfilePage
