import { AUTH_SESSION_STORAGE_KEY } from '@/app/constants/auth'
import { getCurrentUser, loginUser, logoutUser, refreshAuthSession, registerUser } from '@/app/lib/api/auth'
import { isSessionExpired } from '@/app/utils/auth'
import type { AuthSession, AuthStatus, AuthUser, LoginPayload, RegisterPayload, RegisterResult } from '@/types/auth'
import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

export const sessionAtom = atomWithStorage<AuthSession | null>(AUTH_SESSION_STORAGE_KEY, null, undefined, { getOnInit: true })
export const userAtom = atom<AuthUser | null>(null)
export const authStatusAtom = atom<AuthStatus>('loading')
export const authModalOpenAtom = atom(false)

export const clearSessionAtom = atom(null, (_get, set) => {
  set(sessionAtom, null)
  set(userAtom, null)
  set(authStatusAtom, 'unauthenticated')
})

export const loginAtom = atom(null, async (_get, set, payload: LoginPayload) => {
  const { user, session } = await loginUser(payload)
  set(sessionAtom, session)
  set(userAtom, user)
  set(authStatusAtom, 'authenticated')
})

export const registerAtom = atom(null, async (_get, set, payload: RegisterPayload): Promise<RegisterResult> => {
  const result = await registerUser(payload)
  if (result.session) {
    set(sessionAtom, result.session)
    set(userAtom, result.user)
    set(authStatusAtom, 'authenticated')
  }
  return result
})

export const refreshAtom = atom(null, async (get, set): Promise<AuthSession | null> => {
  const session = get(sessionAtom)
  if (!session?.refreshToken) return null

  try {
    const { session: next } = await refreshAuthSession(session.refreshToken)
    set(sessionAtom, next)
    return next
  } catch {
    set(clearSessionAtom)
    return null
  }
})

export const establishSessionAtom = atom(null, async (_get, set, session: AuthSession) => {
  set(sessionAtom, session)
  try {
    const profile = await getCurrentUser()
    set(userAtom, profile)
    set(authStatusAtom, 'authenticated')
  } catch {
    set(clearSessionAtom)
  }
})

export const logoutAtom = atom(null, async (_get, set) => {
  try {
    await logoutUser()
  } catch {
    // Revoke locally even if the server call fails.
  }
  set(clearSessionAtom)
})

export const bootstrapAuthAtom = atom(null, async (get, set) => {
  const session = get(sessionAtom)
  if (!session) {
    set(authStatusAtom, 'unauthenticated')
    return
  }

  const active = isSessionExpired(session) ? await set(refreshAtom) : session
  if (!active) {
    set(authStatusAtom, 'unauthenticated')
    return
  }

  try {
    const profile = await getCurrentUser()
    set(userAtom, profile)
    set(authStatusAtom, 'authenticated')
  } catch {
    set(clearSessionAtom)
  }
})
