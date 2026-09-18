'use client'

import { buildApiUrl } from '@/app/lib/api/client'
import { Button, Spinner } from '@heroui/react'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

type PageState = 'checking' | 'ready' | 'deleting' | 'deleted' | 'invalid'

const parseVerifiedAccessToken = (hash: string): { accessToken: string | null; error: string | null } => {
  const params = new URLSearchParams(hash.replace(/^#/, ''))
  const error = params.get('error_description') ?? params.get('error')
  if (error) return { accessToken: null, error }

  const accessToken = params.get('access_token')
  if (!accessToken) return { accessToken: null, error: 'This verification link is invalid or has expired. Request a new deletion email and try again.' }

  return { accessToken, error: null }
}

export default function ConfirmAccountDeletionPage() {
  const [state, setState] = useState<PageState>('checking')
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const handled = useRef(false)

  useEffect(() => {
    if (handled.current) return
    handled.current = true

    const parsed = parseVerifiedAccessToken(window.location.hash)
    window.history.replaceState(null, '', window.location.pathname)

    if (!parsed.accessToken) {
      setError(parsed.error ?? 'This verification link is invalid or has expired.')
      setState('invalid')
      return
    }

    setAccessToken(parsed.accessToken)
    setState('ready')
  }, [])

  const deleteAccount = async () => {
    if (!accessToken || !confirmed) return

    setState('deleting')
    setError(null)

    try {
      const response = await fetch(buildApiUrl('/api/auth/me'), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      const result: { success?: boolean; msg?: string } = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.msg || 'Could not delete the account. Please try again.')
      }

      setState('deleted')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not delete the account. Please try again.')
      setState('ready')
    }
  }

  if (state === 'checking') {
    return (
      <main className="flex-1 flex items-center justify-center px-6 py-20 font-sans">
        <div className="flex flex-col items-center gap-3 text-[var(--ink-600)]">
          <Spinner className="text-[var(--ink-900)]" />
          <p>Checking your verification link…</p>
        </div>
      </main>
    )
  }

  if (state === 'invalid') {
    return (
      <main className="flex-1 flex items-center justify-center px-6 py-20 font-sans">
        <div className="max-w-md space-y-4 rounded-2xl border border-line bg-surface p-6 text-center">
          <h1 className="text-2xl font-serif text-[var(--ink-900)]">We couldn&apos;t verify this request</h1>
          <p className="text-sm leading-6 text-[var(--ink-600)]">{error}</p>
          <Link href="/delete-account" className="text-sm text-[var(--brand-400)] hover:underline">Request a new verification email</Link>
        </div>
      </main>
    )
  }

  if (state === 'deleted') {
    return (
      <main className="flex-1 flex items-center justify-center px-6 py-20 font-sans">
        <div className="max-w-md space-y-4 rounded-2xl border border-line bg-surface p-6 text-center">
          <h1 className="text-2xl font-serif text-[var(--ink-900)]">Your account has been deleted</h1>
          <p className="text-sm leading-6 text-[var(--ink-600)]">Your account and associated data are being removed. This cannot be undone.</p>
          <Link href="/" className="text-sm text-[var(--brand-400)] hover:underline">Back to Docuflash</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1 flex items-center justify-center px-6 py-20 font-sans">
      <div className="max-w-md space-y-5 rounded-2xl border border-line bg-surface p-6">
        <h1 className="text-3xl font-serif text-[var(--ink-900)]">Confirm account deletion</h1>
        <p className="text-sm leading-6 text-[var(--ink-600)]">Your email has been verified. Deleting your account permanently removes its profile information, documents, file metadata, share links, folders, file requests, notes, avatar, and authentication identity. This cannot be undone.</p>

        <label className="flex items-start gap-3 text-sm leading-6 text-[var(--ink-900)]">
          <input checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} type="checkbox" className="mt-1 h-4 w-4 accent-[var(--ink-900)]" />
          <span>I understand that this permanently deletes my Docuflash account and associated data.</span>
        </label>

        {error ? <p aria-live="polite" className="text-sm text-red-500">{error}</p> : null}

        <Button type="button" fullWidth onPress={deleteAccount} isDisabled={!confirmed || state === 'deleting'} isPending={state === 'deleting'} className="h-12 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 disabled:opacity-40">
          Delete account permanently
        </Button>
      </div>
    </main>
  )
}
