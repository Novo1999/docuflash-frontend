'use client'

import { requestAccountDeletion } from '@/app/lib/api/auth'
import { accountDeletionRequestSchema, type AccountDeletionRequestFormValues } from '@/app/zod/authSchema'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, FieldError, Input, Label, TextField } from '@heroui/react'
import { Controller, useForm } from 'react-hook-form'

const inputClassName = (hasError: boolean) => [
  'w-full rounded-xl border bg-[var(--brand-alpha-4)] px-4 h-12 text-[15px] text-[var(--ink-900)] font-sans',
  'placeholder:text-[var(--ink-600)]/60 focus-visible:border-[var(--brand-400)] focus-visible:ring-2 focus-visible:ring-[var(--brand-400)]/10 outline-none transition-colors',
  hasError ? 'border-red-400' : 'border-line',
].join(' ')

export default function AccountDeletionRequestForm() {
  const form = useForm<AccountDeletionRequestFormValues>({
    resolver: zodResolver(accountDeletionRequestSchema),
    defaultValues: { email: '' },
  })

  const onSubmit = async (values: AccountDeletionRequestFormValues) => {
    try {
      await requestAccountDeletion(values)
      form.reset()
      form.clearErrors()
      form.setError('root', { type: 'success', message: 'If an account exists for that email, a verification link is on its way.' })
    } catch (error) {
      form.setError('root', { message: error instanceof Error ? error.message : 'Could not send the verification email. Please try again.' })
    }
  }

  const rootMessage = form.formState.errors.root
  const isSuccess = rootMessage?.type === 'success'

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <Controller
        name="email"
        control={form.control}
        render={({ field }) => (
          <TextField className="w-full" isInvalid={!!form.formState.errors.email} validationBehavior="aria">
            <Label className="text-sm font-medium text-[var(--ink-900)]">Account email address</Label>
            <Input {...field} type="email" autoComplete="email" inputMode="email" placeholder="you@example.com" className={inputClassName(!!form.formState.errors.email)} />
            {form.formState.errors.email ? <FieldError className="mt-1 text-sm text-red-500">{form.formState.errors.email.message}</FieldError> : null}
          </TextField>
        )}
      />

      {rootMessage ? <p aria-live="polite" className={`text-sm leading-6 ${isSuccess ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-500'}`}>{rootMessage.message}</p> : null}

      <Button type="submit" fullWidth isDisabled={form.formState.isSubmitting} isPending={form.formState.isSubmitting} className="h-12 rounded-xl bg-[var(--ink-900)] text-[var(--brand-50)] font-medium hover:bg-[var(--ink-800)] disabled:opacity-40">
        Send verification email
      </Button>
    </form>
  )
}
