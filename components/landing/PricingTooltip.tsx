'use client'

import { Popover } from '@heroui/react'

interface PricingTooltipProps {
  className?: string
}

export function PricingTooltip({ className }: PricingTooltipProps) {
  return (
    <Popover>
      <Popover.Trigger>
        <span 
          className={className || "text-sm text-[var(--ink-600)] cursor-pointer hover:text-[var(--ink-900)] select-none"}
        >
          Pricing
        </span>
      </Popover.Trigger>
      <Popover.Content 
        placement="bottom" 
        offset={10} 
        className="max-w-xs bg-white border border-black/10 rounded-xl shadow-xl z-50"
      >
        <Popover.Arrow className="fill-white" />
        <Popover.Dialog className="px-4 py-3 text-xs text-[var(--ink-900)] font-sans whitespace-normal break-words text-center">
          Docuflash is completely free to use, make sure you don't fill up my free storage please :)
        </Popover.Dialog>
      </Popover.Content>
    </Popover>
  )
}


