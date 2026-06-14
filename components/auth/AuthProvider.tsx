'use client'

import { getMillisUntilRefresh } from '@/app/utils/auth'
import { bootstrapAuthAtom, refreshAtom, sessionAtom } from '@/components/auth/atoms/authAtom'
import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import AuthModal from './AuthModal'

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const session = useAtomValue(sessionAtom)
  const bootstrap = useSetAtom(bootstrapAuthAtom)
  const refresh = useSetAtom(refreshAtom)

  useEffect(() => {
    bootstrap()
  }, [bootstrap])

  useEffect(() => {
    const millis = getMillisUntilRefresh(session)
    if (millis === null) return

    const timer = setTimeout(() => {
      refresh()
    }, millis)

    return () => clearTimeout(timer)
  }, [session, refresh])

  return (
    <>
      {children}
      <AuthModal />
    </>
  )
}

export default AuthProvider
