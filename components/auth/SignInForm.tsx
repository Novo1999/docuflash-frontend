'use client'

import { signInSchema, type SignInValues } from '@/app/zod/authSchemas'
import { Button, Checkbox, Link } from '@heroui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { LuArrowRight, LuLock, LuMail } from 'react-icons/lu'
import { AuthInput } from './AuthInput'
import { SocialButtons } from './SocialButtons'

export function SignInForm() {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '', remember: true },
  })

  const [submitError, setSubmitError] = useState<string | null>(null)

  const onSubmit = async (data: SignInValues) => {
    setSubmitError(null)
    try {
      // TODO: replace with auth call once backend is wired
      await new Promise((resolve) => setTimeout(resolve, 600))
      console.log('sign-in', data)
    } catch (err) {
      console.error(err)
      setSubmitError('We could not sign you in. Check your details and try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
      <SocialButtons onSelect={(p) => console.log('oauth', p)} />

      <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.16em] text-[var(--ink-600)] font-sans">
        <span className="flex-1 h-px bg-[var(--border-soft)]" />
        Or sign in with email
        <span className="flex-1 h-px bg-[var(--border-soft)]" />
      </div>

      <AuthInput
        label="Email"
        placeholder="you@company.com"
        type="email"
        autoComplete="email"
        leadingIcon={<LuMail className="w-4 h-4" />}
        errorMessage={errors.email?.message}
        {...register('email')}
      />

      <AuthInput
        label="Password"
        placeholder="Enter your password"
        type="password"
        autoComplete="current-password"
        leadingIcon={<LuLock className="w-4 h-4" />}
        errorMessage={errors.password?.message}
        {...register('password')}
      />

      <div className="flex items-center justify-between">
        <Controller
          name="remember"
          control={control}
          render={({ field }) => (
            <label className="flex items-center gap-2 text-sm text-[var(--ink-700)] cursor-pointer select-none">
              <Checkbox isSelected={!!field.value} onChange={field.onChange} />
              Remember me
            </label>
          )}
        />
        <Link href="/forgot-password" className="text-sm text-[var(--brand-400)] hover:underline no-underline">
          Forgot password?
        </Link>
      </div>

      {submitError && <p className="text-xs text-red-500 text-center">{submitError}</p>}

      <Button
        type="submit"
        fullWidth
        isPending={isSubmitting}
        className="bg-[var(--ink-900)] text-[var(--page)] rounded-xl text-sm font-medium h-11 hover:opacity-90 transition-opacity font-sans"
      >
        Sign in
        <LuArrowRight className="w-4 h-4" />
      </Button>
    </form>
  )
}
