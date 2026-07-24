'use client'

import { cn, FieldError, Input, Label, TextField } from '@heroui/react'
import type { Ref } from 'react'
import { LuEye, LuEyeOff, LuGlobe, LuLock } from 'react-icons/lu'

const ACCESS_TYPE_OPTIONS = [
  { val: 'public', label: 'Public', desc: 'Anyone with the link', Icon: LuGlobe },
  { val: 'protected', label: 'Protected', desc: 'Password-locked', Icon: LuLock },
] as const

export type AccessTypeValue = (typeof ACCESS_TYPE_OPTIONS)[number]['val']

interface AccessTypeFieldProps {
  value: AccessTypeValue
  onChange: (value: AccessTypeValue) => void
  password: string
  onPasswordChange: (value: string) => void
  showPassword: boolean
  onToggleShowPassword: () => void
  /** Noun the copy refers to, e.g. "this file", "this folder", "this link". */
  subject: string
  question: string
  isDisabled?: boolean
  /** Access types that cannot be selected right now (e.g. a slot already taken by an active request). */
  disabledValues?: AccessTypeValue[]
  passwordError?: string
  passwordRef?: Ref<HTMLInputElement>
}

const AccessTypeField = ({ value, onChange, password, onPasswordChange, showPassword, onToggleShowPassword, subject, question, isDisabled = false, disabledValues = [], passwordError, passwordRef }: AccessTypeFieldProps) => {
  return (
    <>
      <div className="flex flex-col gap-2">
        <span className="text-left text-sm font-medium text-[var(--ink-900)] font-sans">{question}</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-1 rounded-xl bg-[var(--brand-alpha-4)] border border-line">
          {ACCESS_TYPE_OPTIONS.map(({ val, label, desc, Icon }) => {
            const selected = value === val
            const optionDisabled = isDisabled || disabledValues.includes(val)
            return (
              <button
                key={val}
                type="button"
                disabled={optionDisabled}
                onClick={() => onChange(val)}
                className={cn(
                  'flex items-start gap-2.5 px-3 py-3 rounded-lg text-left transition-all',
                  selected ? 'bg-surface shadow-[0_1px_3px_rgba(15,28,46,0.08)] border border-line' : 'border border-transparent hover:bg-ink-900/[0.04]',
                  optionDisabled && 'cursor-not-allowed opacity-50',
                )}
              >
                <div
                  className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors',
                    selected ? 'bg-[var(--brand-alpha-12)] text-[var(--brand-400)]' : 'bg-ink-900/[0.06] text-[var(--ink-600)]',
                  )}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className={cn('text-sm font-medium font-sans', selected ? 'text-[var(--ink-900)]' : 'text-[var(--ink-800)]')}>{label}</span>
                  <span className="text-[11px] text-[var(--ink-600)] font-sans leading-tight">{desc}</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {value === 'protected' && (
        <TextField className="w-full" isInvalid={!!passwordError} validationBehavior="aria" isDisabled={isDisabled}>
          <Label className="text-left text-[var(--ink-900)] flex items-center gap-1.5 font-sans text-sm font-medium">
            <LuLock className="w-4 h-4" />
            <span>Password</span>
          </Label>
          <div className="relative w-full mt-1.5">
            <Input
              ref={passwordRef}
              value={password}
              onChange={(event) => onPasswordChange(event.target.value)}
              type={showPassword ? 'text' : 'password'}
              placeholder={`Set a password for ${subject}`}
              className={cn(
                'w-full bg-[var(--brand-alpha-4)] border rounded-xl px-4 h-12 pr-12 text-[15px] text-[var(--ink-900)] font-sans',
                'placeholder:text-[var(--ink-600)]/60 focus-visible:border-[var(--brand-400)] focus-visible:ring-2 focus-visible:ring-[var(--brand-400)]/10 outline-none transition-colors',
                passwordError ? 'border-red-400' : 'border-line',
              )}
            />
            <button
              type="button"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              onClick={onToggleShowPassword}
              disabled={isDisabled}
              className="absolute top-1/2 right-2 -translate-y-1/2 p-1.5 rounded-md text-[var(--ink-600)] hover:bg-ink-900/[0.06] transition-colors disabled:cursor-not-allowed"
            >
              {showPassword ? <LuEyeOff className="w-4 h-4" /> : <LuEye className="w-4 h-4" />}
            </button>
          </div>
          {passwordError && <FieldError className="text-sm text-red-500 font-sans">{passwordError}</FieldError>}
        </TextField>
      )}
    </>
  )
}

export default AccessTypeField
