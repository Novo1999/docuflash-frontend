'use client'

import { Input, Spinner, cn } from '@heroui/react'
import { LuSearch, LuX } from 'react-icons/lu'

interface UploadsSearchBarProps {
  value: string
  onChange: (value: string) => void
  isSearching?: boolean
}

const UploadsSearchBar = ({ value, onChange, isSearching = false }: UploadsSearchBarProps) => {
  const hasValue = value.length > 0

  return (
    <div className="relative">
      <LuSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 size-4 text-[var(--ink-400)]" aria-hidden />
      <Input
        aria-label="Search files and folders"
        placeholder="Search files & folders"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'bg-[var(--brand-50)]',
          'border-1 border-line',
          'rounded-xl',
          'pl-11 pr-11',
          'h-12',
          'group-data-[focus=true]:border-[var(--brand-400)]',
          'group-data-[focus=true]:ring-3',
          'group-data-[focus=true]:ring-[var(--brand-400)]/10',
          'text-md text-[var(--ink-900)] placeholder:text-[var(--ink-400)]',
        )}
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
        {isSearching ? (
          <Spinner className="size-4 text-[var(--ink-400)]" />
        ) : hasValue ? (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => onChange('')}
            className="flex items-center justify-center size-6 rounded-full text-[var(--ink-500)] hover:bg-[var(--ink-900)]/[0.06] hover:text-[var(--ink-900)] transition-colors"
          >
            <LuX className="size-4" />
          </button>
        ) : null}
      </div>
    </div>
  )
}

export default UploadsSearchBar
