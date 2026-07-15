'use client'

import { resetPassword } from '@/app/lib/api/auth'
import { resetPasswordSchema, type ResetPasswordFormValues } from '@/app/zod/authSchema'
import { useAuth } from '@/components/auth/useAuth'
import type { AuthSession } from '@/types/auth'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, cn, FieldError, Input, Label, Spinner, TextField } from '@heroui/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { LuEye, LuEyeOff, LuLock } from 'react-icons/lu'

const inputClassName = (hasError: boolean) =>
  cn(
    'w-full bg-[var(--brand-alpha-4)] border rounded-xl px-4 h-12 text-[15px] text-[var(--ink-900)] font-sans',
    'placeholder:text-[var(--ink-600)]/60 focus-visible:border-[var(--brand-400)] focus-visible:ring-2 focus-visible:ring-[var(--brand-400)]/10 outline-none transition-colors',
    hasError ? 'border-red-400' : 'border-line',
  )

const parseRecoveryFromHash = (hash: string): { session: AuthSession | null; error: string | null } => {
  const params = new URLSearchParams(hash.replace(/^#/, ''))

  const error = params.get('error_description') ?? params.get('error')
  if (error) return { session: null, error }

  const accessToken = params.get('access_token')
  const refreshToken = params.get('refresh_token')
  if (!accessToken || !refreshToken) {
    return { session: null, error: 'This reset link is invalid or has expired. Request a new one and try again.' }
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

const ResetPasswordPage = () => {
  const router = useRouter()
  const { establishSession } = useAuth()
  const [recoverySession, setRecoverySession] = useState<AuthSession | null>(null)
  const [linkError, setLinkError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const handled = useRef(false)

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  useEffect(() => {
    if (handled.current) return
    handled.current = true

    const run = async () => {
      const { session, error } = parseRecoveryFromHash(window.location.hash)
      if (!session) {
        setLinkError(error ?? 'This reset link is invalid or has expired.')
        return
      }

      window.history.replaceState(null, '', window.location.pathname)
      setRecoverySession(session)
    }

    run()
  }, [])

  const onSubmit = async (values: ResetPasswordFormValues) => {
    if (!recoverySession) return
    try {
      const result = await resetPassword({
        accessToken: recoverySession.accessToken,
        refreshToken: recoverySession.refreshToken,
        password: values.password,
      })
      await establishSession(result.session)
      router.replace('/')
    } catch (error) {
      form.setError('root', { message: error instanceof Error ? error.message : 'Could not update your password' })
    }
  }

  if (linkError) {
    return (
      <main className="flex-1 flex items-center justify-center px-6 py-20 font-sans">
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-lg font-medium text-[var(--ink-900)]">We couldn&apos;t reset your password</p>
          <p className="text-sm text-[var(--ink-600)] max-w-sm">{linkError}</p>
          <Link href="/" className="text-sm text-[var(--brand-400)] no-underline hover:underline">
            Back to home
          </Link>
        </div>
      </main>
    )
  }

  if (!recoverySession) {
    return (
      <main className="flex-1 flex items-center justify-center px-6 py-20 font-sans">
        <div className="flex flex-col items-center gap-3">
          <Spinner className="text-[var(--ink-900)]" />
          <p className="text-sm text-[var(--ink-600)]">Checking your reset link…</p>
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1 flex items-center justify-center px-6 py-20 font-sans">
      <div className="bg-surface border border-line rounded-2xl p-6 max-w-md w-full">
        <h1 className="text-2xl font-serif text-[var(--ink-900)]">Choose a new password</h1>
        <p className="text-sm text-[var(--ink-600)] mt-1 mb-5">Enter a new password for your account.</p>

        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Controller
            name="password"
            control={form.control}
            render={({ field }) => (
              <TextField className="w-full" isInvalid={!!form.formState.errors.password} validationBehavior="aria">
                <Label className="text-[var(--ink-900)] flex items-center gap-1.5 text-sm font-medium">
                  <LuLock className="w-4 h-4" />
                  <span>New password</span>
                </Label>
                <div className="relative w-full mt-1.5">
                  <Input {...field} type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="At least 6 characters" className={cn(inputClassName(!!form.formState.errors.password), 'pr-12')} />
                  <button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((curr) => !curr)} className="absolute top-1/2 right-2 -translate-y-1/2 p-1.5 rounded-md text-[var(--ink-600)] hover:bg-ink-900/[0.06] transition-colors">
                    {showPassword ? <LuEyeOff className="w-4 h-4" /> : <LuEye className="w-4 h-4" />}
                  </button>
                </div>
                {form.formState.errors.password && <FieldError className="text-sm text-red-500">{form.formState.errors.password.message}</FieldError>}
              </TextField>
            )}
          />

          <Controller
            name="confirmPassword"
            control={form.control}
            render={({ field }) => (
              <TextField className="w-full" isInvalid={!!form.formState.errors.confirmPassword} validationBehavior="aria">
                <Label className="text-[var(--ink-900)] flex items-center gap-1.5 text-sm font-medium">
                  <LuLock className="w-4 h-4" />
                  <span>Confirm password</span>
                </Label>
                <div className="relative w-full mt-1.5">
                  <Input {...field} type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="Repeat your new password" className={inputClassName(!!form.formState.errors.confirmPassword)} />
                </div>
                {form.formState.errors.confirmPassword && <FieldError className="text-sm text-red-500">{form.formState.errors.confirmPassword.message}</FieldError>}
              </TextField>
            )}
          />

          {form.formState.errors.root && <p className="text-sm text-red-500 text-center">{form.formState.errors.root.message}</p>}

          <Button
            type="submit"
            fullWidth
            isDisabled={form.formState.isSubmitting}
            isPending={form.formState.isSubmitting}
            className="bg-[var(--ink-900)] text-[var(--brand-50)] rounded-xl text-base font-medium h-12 hover:bg-[var(--ink-800)] disabled:opacity-40"
          >
            {form.formState.isSubmitting ? <Spinner className="text-[var(--brand-50)]" /> : 'Update password'}
          </Button>
        </form>
      </div>
    </main>
  )
}

export default ResetPasswordPage
