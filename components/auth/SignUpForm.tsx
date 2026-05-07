'use client'

import { signUpSchema, type SignUpValues } from '@/app/zod/authSchemas'
import { Button, Checkbox, Link } from '@heroui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { LuArrowRight, LuLock, LuMail, LuUser } from 'react-icons/lu'
import { AuthInput } from './AuthInput'
import { SocialButtons } from './SocialButtons'

const STRENGTH_LABELS = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'] as const
const STRENGTH_COLORS = ['bg-red-500', 'bg-red-500', 'bg-amber-500', 'bg-emerald-500', 'bg-emerald-500'] as const

function scorePassword(value: string): number {
  if (!value) return 0
  let score = 0
  if (value.length >= 8) score++
  if (value.length >= 12) score++
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score++
  if (/[0-9]/.test(value)) score++
  if (/[^A-Za-z0-9]/.test(value)) score++
  return Math.min(score, 4)
}

export function SignUpForm() {
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '', terms: false },
  })

  const [submitError, setSubmitError] = useState<string | null>(null)

  const password = watch('password')
  const strength = useMemo(() => scorePassword(password || ''), [password])

  const onSubmit = async (data: SignUpValues) => {
    setSubmitError(null)
    try {
      await new Promise((resolve) => setTimeout(resolve, 600))
      console.log('sign-up', data)
    } catch (err) {
      console.error(err)
      setSubmitError('Could not create your account. Please try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
      <SocialButtons onSelect={(p) => console.log('oauth', p)} />

      <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.16em] text-[var(--ink-600)] font-sans">
        <span className="flex-1 h-px bg-[var(--border-soft)]" />
        Or sign up with email
        <span className="flex-1 h-px bg-[var(--border-soft)]" />
      </div>

      <AuthInput
        label="Full name"
        placeholder="Ada Lovelace"
        type="text"
        autoComplete="name"
        leadingIcon={<LuUser className="w-4 h-4" />}
        errorMessage={errors.name?.message}
        {...register('name')}
      />

      <AuthInput
        label="Work email"
        placeholder="you@company.com"
        type="email"
        autoComplete="email"
        leadingIcon={<LuMail className="w-4 h-4" />}
        errorMessage={errors.email?.message}
        {...register('email')}
      />

      <div className="flex flex-col gap-2">
        <AuthInput
          label="Password"
          placeholder="Create a strong password"
          type="password"
          autoComplete="new-password"
          leadingIcon={<LuLock className="w-4 h-4" />}
          errorMessage={errors.password?.message}
          description="At least 8 characters, with one uppercase letter and one number."
          {...register('password')}
        />
        {password && (
          <div className="flex items-center gap-2">
            <div className="flex-1 grid grid-cols-4 gap-1">
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className={[
                    'h-1 rounded-full transition-colors',
                    i < strength ? STRENGTH_COLORS[strength] : 'bg-[var(--border-soft)]',
                  ].join(' ')}
                />
              ))}
            </div>
            <span className="text-[11px] text-[var(--ink-600)] font-sans w-16 text-right tabular-nums">
              {STRENGTH_LABELS[strength]}
            </span>
          </div>
        )}
      </div>

      <AuthInput
        label="Confirm password"
        placeholder="Re-enter your password"
        type="password"
        autoComplete="new-password"
        leadingIcon={<LuLock className="w-4 h-4" />}
        errorMessage={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />

      <Controller
        name="terms"
        control={control}
        render={({ field }) => (
          <div className="flex flex-col gap-1">
            <label className="flex items-start gap-2.5 text-sm text-[var(--ink-700)] cursor-pointer select-none">
              <Checkbox isSelected={!!field.value} onChange={field.onChange} className="mt-0.5" />
              <span>
                I agree to the{' '}
                <Link href="/terms" className="text-[var(--brand-400)] hover:underline no-underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-[var(--brand-400)] hover:underline no-underline">
                  Privacy Policy
                </Link>
                .
              </span>
            </label>
            {errors.terms && <span className="text-xs text-red-500 ml-7">{errors.terms.message}</span>}
          </div>
        )}
      />

      {submitError && <p className="text-xs text-red-500 text-center">{submitError}</p>}

      <Button
        type="submit"
        fullWidth
        isPending={isSubmitting}
        className="bg-[var(--ink-900)] text-[var(--page)] rounded-xl text-sm font-medium h-11 hover:opacity-90 transition-opacity font-sans"
      >
        Create account
        <LuArrowRight className="w-4 h-4" />
      </Button>
    </form>
  )
}
