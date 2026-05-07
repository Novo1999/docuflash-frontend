import { FaApple, FaGithub } from 'react-icons/fa'
import { FcGoogle } from 'react-icons/fc'

const PROVIDERS = [
  { key: 'google', label: 'Continue with Google', Icon: FcGoogle },
  { key: 'github', label: 'Continue with GitHub', Icon: FaGithub },
  { key: 'apple', label: 'Continue with Apple', Icon: FaApple },
] as const

interface SocialButtonsProps {
  onSelect?: (provider: 'google' | 'github' | 'apple') => void
}

export function SocialButtons({ onSelect }: SocialButtonsProps) {
  return (
    <div className="flex flex-col gap-2">
      {PROVIDERS.map(({ key, label, Icon }) => (
        <button
          key={key}
          type="button"
          onClick={() => onSelect?.(key)}
          className="w-full h-11 rounded-xl border border-[var(--border-soft)] bg-[var(--surface)] hover:bg-black/[0.02] dark:hover:bg-white/[0.04] transition-colors flex items-center justify-center gap-2.5 text-sm font-medium text-[var(--ink-900)] font-sans"
        >
          <Icon className="w-4 h-4" />
          {label}
        </button>
      ))}
    </div>
  )
}
