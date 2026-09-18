'use client'

import ReportContentDialog from '@/components/moderation/ReportContentDialog'
import type { ReportTargetType } from '@/types/moderation'
import { useState } from 'react'
import { LuFlag } from 'react-icons/lu'

type ReportContentButtonProps = {
  targetType: ReportTargetType
  shareToken: string
  targetName?: string
}

const ReportContentButton = ({ targetType, shareToken, targetName }: ReportContentButtonProps) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-[var(--ink-600)] font-sans transition-colors hover:text-red-500 hover:bg-red-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/30"
      >
        <LuFlag className="w-3.5 h-3.5" />
        Report this {targetType}
      </button>

      <ReportContentDialog isOpen={isOpen} onOpenChange={setIsOpen} targetType={targetType} shareToken={shareToken} targetName={targetName} />
    </>
  )
}

export default ReportContentButton
