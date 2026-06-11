'use client'

import { useAuth } from '@/components/auth/useAuth'
import type { AuthSession } from '@/types/auth'
import { Spinner } from '@heroui/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

const parseSessionFromHash = (hash: string): { session: AuthSession | null; error: string | null } => {
  const params = new URLSearchParams(hash.replace(/^#/, ''))

  const error = params.get('error')
  if (error) return { session: null, error }

  const accessToken = params.get('access_token')
  const refreshToken = params.get('refresh_token')
  if (!accessToken || !refreshToken) {
    return { session: null, error: 'Missing authentication tokens' }
  }

  const expiresAt = Number(params.get('expires_at')) || 0
  const nowSeconds = Math.floor(Date.now() / 1000)

  return {
    session: {
      accessToken,
      refreshToken,
      expiresAt,
      expiresIn: expiresAt > 0 ? Math.max(0, expiresAt - nowSeconds) : 0,
      tokenType: params.get('token_type') || 'bearer',
    },
    error: null,
  }
}

const AuthCallbackPage = () => {
  const router = useRouter()
  const { establishSession } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const handled = useRef(false)

  useEffect(() => {
    if (handled.current) return
    handled.current = true

    const run = async () => {
      const { session, error: parseError } = parseSessionFromHash(window.location.hash)

      if (!session) {
        setError(parseError ?? 'Authentication failed')
        return
      }

      window.history.replaceState(null, '', window.location.pathname)
      await establishSession(session)
      router.replace('/')
    }

    run()
  }, [establishSession, router])

  return (
    <main className="flex-1 flex items-center justify-center px-6 py-20 font-sans">
      {error ? (
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-lg font-medium text-[var(--ink-900)]">We couldn&apos;t sign you in</p>
          <p className="text-sm text-[var(--ink-600)] max-w-sm">{error}</p>
          <Link href="/" className="text-sm text-[var(--brand-400)] no-underline hover:underline">
            Back to home
          </Link>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <Spinner className="text-[var(--ink-900)]" />
          <p className="text-sm text-[var(--ink-600)]">Signing you in…</p>
        </div>
      )}
    </main>
  )
}

export default AuthCallbackPage
