'use client'

import { Button } from '@heroui/react'
import { useTheme } from 'next-themes'
import { LuMoon, LuSun } from 'react-icons/lu'

const ThemeToggle = () => {
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <Button
      isIconOnly
      size="sm"
      variant="ghost"
      aria-label="Toggle dark mode"
      onPress={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      className="text-ink-900 rounded-full"
    >
      {/* next-themes sets the `dark` class before paint, so CSS picks the right icon with no hydration flicker */}
      <LuMoon className="w-[18px] h-[18px] dark:hidden" />
      <LuSun className="w-[18px] h-[18px] hidden dark:block" />
    </Button>
  )
}

export default ThemeToggle
