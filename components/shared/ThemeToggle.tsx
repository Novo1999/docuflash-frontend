'use client'

import { useTheme } from 'next-themes'
import { useSyncExternalStore } from 'react'
import { LuMonitor, LuMoon, LuSun } from 'react-icons/lu'

interface ThemeToggleProps {
  className?: string
}

const OPTIONS = [
  { value: 'light', label: 'Light', Icon: LuSun },
  { value: 'system', label: 'System', Icon: LuMonitor },
  { value: 'dark', label: 'Dark', Icon: LuMoon },
] as const

const subscribe = () => () => {}
const getSnapshot = () => true
const getServerSnapshot = () => false

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()
  const mounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  if (!mounted) {
    return (
      <div
        className={['inline-flex h-9 w-[100px] rounded-full bg-black/[0.04] border border-black/[0.06]', className]
          .filter(Boolean)
          .join(' ')}
        aria-hidden
      />
    )
  }

  const current = theme ?? 'system'

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className={[
        'inline-flex items-center p-0.5 rounded-full bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.08]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {OPTIONS.map(({ value, label, Icon }) => {
        const selected = current === value
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={label}
            title={label}
            onClick={() => setTheme(value)}
            className={[
              'flex items-center justify-center w-7 h-7 rounded-full transition-all',
              selected
                ? 'bg-white dark:bg-[var(--surface)] text-[var(--ink-900)] shadow-[0_1px_3px_rgba(15,28,46,0.12)]'
                : 'text-[var(--ink-600)] hover:text-[var(--ink-900)]',
            ].join(' ')}
          >
            <Icon className="w-3.5 h-3.5" />
          </button>
        )
      })}
    </div>
  )
}
