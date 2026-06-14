'use client'

import { useAuth } from '@/components/auth/useAuth'
import { Button, Popover, cn } from '@heroui/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LuFolderOpen, LuLogOut, LuUser } from 'react-icons/lu'

const getInitials = (name: string | null, email: string) => {
  const source = name?.trim() || email
  const parts = source.split(/[\s@.]+/).filter(Boolean)
  return (parts[0]?.[0] ?? '?').concat(parts[1]?.[0] ?? '').toUpperCase()
}

const AuthButton = ({ isMobile = false, onNavigate }: { isMobile?: boolean; onNavigate?: () => void }) => {
  const { status, user, isAuthenticated, openAuthModal, logout } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    onNavigate?.()
    router.push('/')
  }

  if (status === 'loading') {
    return <div className={cn('h-9 rounded-full bg-black/5 animate-pulse', isMobile ? 'w-full' : 'w-20')} aria-hidden />
  }

  if (!isAuthenticated || !user) {
    return (
      <Button
        onPress={openAuthModal}
        className={cn(
          'bg-[var(--ink-900)] text-[var(--brand-50)] rounded-full font-medium font-sans h-9 px-5 text-sm hover:bg-[var(--ink-800)]',
          isMobile && 'w-full h-11',
        )}
      >
        Sign in
      </Button>
    )
  }

  const initials = getInitials(user.displayName, user.email)

  const menu = (
    <div className="flex flex-col gap-1 min-w-52">
      <div className="px-3 py-2 border-b border-black/[0.06]">
        <p className="text-sm font-medium text-[var(--ink-900)] truncate">{user.displayName || 'Your account'}</p>
        <p className="text-xs text-[var(--ink-600)] truncate">{user.email}</p>
      </div>
      <Link href="/me" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[var(--ink-700)] no-underline hover:bg-black/5 hover:text-[var(--ink-900)]">
        <LuUser className="w-4 h-4" />
        Profile
      </Link>
      <Link href="/me/uploads" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[var(--ink-700)] no-underline hover:bg-black/5 hover:text-[var(--ink-900)]">
        <LuFolderOpen className="w-4 h-4" />
        My Uploads
      </Link>
      <button
        type="button"
        onClick={handleLogout}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 text-left"
      >
        <LuLogOut className="w-4 h-4" />
        Sign out
      </button>
    </div>
  )

  if (isMobile) {
    return (
      <div className="flex flex-col gap-1">
        <Link
          href="/me/uploads"
          onClick={onNavigate}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-[var(--ink-700)] no-underline hover:bg-black/5 hover:text-[var(--ink-900)]"
        >
          <LuFolderOpen className="w-4 h-4" />
          My Uploads
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 text-left"
        >
          <LuLogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    )
  }

  return (
    <Popover>
      <Popover.Trigger>
        <button
          type="button"
          aria-label="Account menu"
          className="w-9 h-9 rounded-full bg-[var(--ink-900)] text-[var(--brand-50)] text-sm font-medium flex items-center justify-center hover:bg-[var(--ink-800)] transition-colors"
        >
          {user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatarUrl} alt={user.displayName || user.email} className="w-9 h-9 rounded-full object-cover" />
          ) : (
            initials
          )}
        </button>
      </Popover.Trigger>
      <Popover.Content placement="bottom end" offset={10} className="bg-white border border-black/10 rounded-xl shadow-xl z-50">
        <Popover.Dialog className="p-1 font-sans">{menu}</Popover.Dialog>
      </Popover.Content>
    </Popover>
  )
}

export default AuthButton
