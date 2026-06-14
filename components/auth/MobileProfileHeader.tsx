'use client'

import { useAuth } from '@/components/auth/useAuth'
import { useRouter } from 'next/navigation'

const getInitials = (name: string | null, email: string) => {
  const source = name?.trim() || email
  const parts = source.split(/[\s@.]+/).filter(Boolean)
  return (parts[0]?.[0] ?? '?').concat(parts[1]?.[0] ?? '').toUpperCase()
}

const MobileProfileHeader = ({ onNavigate }: { onNavigate?: () => void }) => {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

  if (!isAuthenticated || !user) return null

  const handlePress = () => {
    onNavigate?.()
    router.push('/me')
  }

  return (
    <button
      type="button"
      onClick={handlePress}
      aria-label="Open your profile"
      className="w-full flex items-center gap-3 px-6 py-4 border-y border-black/[0.06] hover:bg-black/5 transition-colors text-left font-sans"
    >
      <span className="w-11 h-11 rounded-full bg-[var(--ink-900)] text-[var(--brand-50)] text-sm font-medium flex items-center justify-center overflow-hidden shrink-0">
        {user.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.avatarUrl} alt={user.displayName || user.email} className="w-11 h-11 object-cover" />
        ) : (
          getInitials(user.displayName, user.email)
        )}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-medium text-[var(--ink-900)] truncate">{user.displayName || 'Your account'}</span>
        <span className="block text-xs text-[var(--ink-600)] truncate">{user.email}</span>
      </span>
    </button>
  )
}

export default MobileProfileHeader
