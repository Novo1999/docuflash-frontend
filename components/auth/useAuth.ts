'use client'

import { authModalOpenAtom, authStatusAtom, establishSessionAtom, loginAtom, logoutAtom, registerAtom, userAtom } from '@/components/auth/atoms/authAtom'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useCallback } from 'react'

export const useAuth = () => {
  const user = useAtomValue(userAtom)
  const status = useAtomValue(authStatusAtom)
  const [isAuthModalOpen, setAuthModalOpen] = useAtom(authModalOpenAtom)

  const login = useSetAtom(loginAtom)
  const register = useSetAtom(registerAtom)
  const logout = useSetAtom(logoutAtom)
  const establishSession = useSetAtom(establishSessionAtom)

  const openAuthModal = useCallback(() => setAuthModalOpen(true), [setAuthModalOpen])
  const closeAuthModal = useCallback(() => setAuthModalOpen(false), [setAuthModalOpen])

  return {
    user,
    status,
    isAuthenticated: status === 'authenticated',
    login,
    register,
    logout,
    establishSession,
    isAuthModalOpen,
    openAuthModal,
    closeAuthModal,
  }
}
