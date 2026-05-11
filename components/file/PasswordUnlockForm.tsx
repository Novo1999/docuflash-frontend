'use client'

import { Button, Input, cn } from '@heroui/react'

interface PasswordUnlockFormProps {
  password: string
  error: string | null
  isVerifying: boolean
  onPasswordChange: (value: string) => void
  onUnlock: () => void
}

const PasswordUnlockForm = ({ password, error, isVerifying, onPasswordChange, onUnlock }: PasswordUnlockFormProps) => {
  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex flex-row gap-2 w-full">
        <Input
          type="password"
          placeholder="Enter password to unlock file"
          value={password}
          onChange={(e) => {
            onPasswordChange(e.target.value)
          }}
          onKeyDown={(e) => e.key === 'Enter' && onUnlock()}
          className={cn(
            'bg-[var(--brand-50)]',
            'border-1',
            error ? 'border-red-400' : 'border-black/10',
            'rounded-xl',
            'px-4',
            'h-12',
            'group-data-[focus=true]:border-[var(--brand-400)]',
            'group-data-[focus=true]:ring-3',
            'group-data-[focus=true]:ring-[var(--brand-400)]/10',
            'text-md text-[var(--ink-900)] placeholder:text-[var(--ink-400)]',
          )}
        />
        <Button onPress={onUnlock} isPending={isVerifying} className="bg-[var(--ink-900)] text-[var(--brand-50)] rounded-xl font-medium px-6 h-12 shrink-0 font-sans">
          Unlock
        </Button>
      </div>
      {error && <p className="text-sm text-red-500 font-sans self-start">{error}</p>}
    </div>
  )
}

export default PasswordUnlockForm
