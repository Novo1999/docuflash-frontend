import { AUTH_SESSION_STORAGE_KEY, TOKEN_REFRESH_LEEWAY_SECONDS } from '@/app/constants/auth'
import type { AuthSession } from '@/types/auth'

function getStoredAccessToken(): string | null {
  if (typeof window === 'undefined') return null

  try {
    const raw = localStorage.getItem(AUTH_SESSION_STORAGE_KEY)
    const session = raw ? (JSON.parse(raw) as AuthSession | null) : null
    return session?.accessToken ?? null
  } catch {
    return null
  }
}

function isSessionExpired(session: AuthSession | null, leewaySeconds = TOKEN_REFRESH_LEEWAY_SECONDS): boolean {
  if (!session?.expiresAt || session.expiresAt <= 0) return false

  const nowSeconds = Math.floor(Date.now() / 1000)
  return session.expiresAt - leewaySeconds <= nowSeconds
}

function getMillisUntilRefresh(session: AuthSession | null, leewaySeconds = TOKEN_REFRESH_LEEWAY_SECONDS): number | null {
  if (!session?.expiresAt || session.expiresAt <= 0) return null

  const refreshAtSeconds = session.expiresAt - leewaySeconds
  const nowSeconds = Date.now() / 1000
  return Math.max(0, Math.round((refreshAtSeconds - nowSeconds) * 1000))
}

export { getMillisUntilRefresh, getStoredAccessToken, isSessionExpired }
