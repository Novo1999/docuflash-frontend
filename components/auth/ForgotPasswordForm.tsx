'use client'

import { forgotPassword } from '@/app/lib/api/auth'
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '@/app/zod/authSchema'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, cn, FieldError, Input, Label, Spinner, TextField } from '@heroui/react'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { LuMail } from 'react-icons/lu'

const inputClassName = (hasError: boolean) =>
  cn(
    'w-full bg-[var(--brand-alpha-4)] border rounded-xl px-4 h-12 text-[15px] text-[var(--ink-900)] font-sans',
    'placeholder:text-[var(--ink-600)]/60 focus-visible:border-[var(--brand-400)] focus-visible:ring-2 focus-visible:ring-[var(--brand-400)]/10 outline-none transition-colors',
    hasError ? 'border-red-400' : 'border-line',
  )

type ForgotPasswordFormProps = {
  onBackToSignIn: () => void
}

const ForgotPasswordForm = ({ onBackToSignIn }: ForgotPasswordFormProps) => {
  const [sentToEmail, setSentToEmail] = useState<string | null>(null)

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  })

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    try {
      await forgotPassword({ email: values.email })
      setSentToEmail(values.email)
    } catch (error) {
      form.setError('root', { message: error instanceof Error ? error.message : 'Could not send the reset email' })
    }
  }

  if (sentToEmail) {
    return (
      <div className="flex flex-col gap-3 items-center text-center py-4">
        <div className="w-12 h-12 rounded-full bg-[var(--brand-alpha-12)] flex items-center justify-center">
          <LuMail className="w-6 h-6 text-[var(--brand-400)]" />
        </div>
        <p className="text-base text-[var(--ink-900)] font-medium">Check your inbox</p>
        <p className="text-sm text-[var(--ink-600)]">
          If an account exists for <span className="font-medium text-[var(--ink-900)]">{sentToEmail}</span>, we sent a link to reset your password.
        </p>
        <Button onPress={onBackToSignIn} className="bg-[var(--ink-900)] text-[var(--brand-50)] rounded-xl font-medium px-6 h-11 mt-1">
          Back to sign in
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Controller
        name="email"
        control={form.control}
        render={({ field }) => (
          <TextField className="w-full" isInvalid={!!form.formState.errors.email} validationBehavior="aria">
            <Label className="text-[var(--ink-900)] flex items-center gap-1.5 text-sm font-medium">
              <LuMail className="w-4 h-4" />
              <span>Email</span>
            </Label>
            <div className="relative w-full mt-1.5">
              <Input {...field} type="email" autoComplete="email" placeholder="you@example.com" className={inputClassName(!!form.formState.errors.email)} />
            </div>
            {form.formState.errors.email && <FieldError className="text-sm text-red-500">{form.formState.errors.email.message}</FieldError>}
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
        {form.formState.isSubmitting ? <Spinner className="text-[var(--brand-50)]" /> : 'Send reset link'}
      </Button>

      <button type="button" onClick={onBackToSignIn} className="text-sm text-[var(--ink-600)] hover:text-[var(--ink-900)] transition-colors text-center">
        Back to sign in
      </button>
    </form>
  )
}

export default ForgotPasswordForm
