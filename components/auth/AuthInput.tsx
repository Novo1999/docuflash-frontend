'use client'

import { forwardRef, useId, useState, type InputHTMLAttributes, type ReactNode } from 'react'
import { LuEye, LuEyeOff } from 'react-icons/lu'

interface AuthInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string
  description?: string
  errorMessage?: string
  type?: 'text' | 'email' | 'password'
  leadingIcon?: ReactNode
}

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(function AuthInput(
  { label, description, errorMessage, type = 'text', leadingIcon, id, className, ...rest },
  ref,
) {
  const [reveal, setReveal] = useState(false)
  const fallbackId = useId()
  const inputId = id ?? fallbackId
  const isPassword = type === 'password'
  const inputType = isPassword ? (reveal ? 'text' : 'password') : type
  const invalid = !!errorMessage

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-[var(--ink-900)] font-sans">
        {label}
      </label>
      <div className="relative">
        {leadingIcon && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--ink-600)] pointer-events-none">
            {leadingIcon}
          </span>
        )}
        <input
          {...rest}
          ref={ref}
          id={inputId}
          type={inputType}
          aria-invalid={invalid || undefined}
          aria-describedby={errorMessage ? `${inputId}-error` : description ? `${inputId}-desc` : undefined}
          className={[
            'w-full h-11 rounded-xl bg-[var(--brand-alpha-4)] border text-[15px] font-sans text-[var(--ink-900)]',
            'placeholder:text-[var(--ink-600)]/55 outline-none transition-colors',
            'focus-visible:border-[var(--brand-400)] focus-visible:ring-2 focus-visible:ring-[var(--brand-400)]/15',
            invalid ? 'border-red-400/70' : 'border-[var(--border-soft)]',
            leadingIcon ? 'pl-10 pr-3' : 'px-4',
            isPassword ? 'pr-11' : '',
            className ?? '',
          ]
            .filter(Boolean)
            .join(' ')}
        />
        {isPassword && (
          <button
            type="button"
            aria-label={reveal ? 'Hide password' : 'Show password'}
            onClick={() => setReveal((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-[var(--ink-600)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            {reveal ? <LuEyeOff className="w-4 h-4" /> : <LuEye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {description && !errorMessage && (
        <p id={`${inputId}-desc`} className="text-xs text-[var(--ink-600)] font-sans">
          {description}
        </p>
      )}
      {errorMessage && (
        <p id={`${inputId}-error`} className="text-xs text-red-500 font-sans" role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  )
})
