'use client'

import { FileAccessType } from '@/types/file'
import type { ActiveRequestRecord } from '@/types/folder'
import { Button } from '@heroui/react'
import { useState } from 'react'
import { LuArrowRight, LuClock, LuFile, LuGlobe, LuLock, LuTrash2 } from 'react-icons/lu'

const formatTimeLeft = (expireAt: string) => {
  const diffMs = new Date(expireAt).getTime() - Date.now()
  if (Number.isNaN(diffMs) || diffMs <= 0) return 'Expired'
  const totalMinutes = Math.floor(diffMs / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours >= 1) return `${hours}h ${minutes}m left`
  return `${Math.max(1, minutes)}m left`
}

interface ActiveRequestCardProps {
  request: ActiveRequestRecord
  onResume: () => void
  onEnd: () => void
  isEnding: boolean
}

const ActiveRequestCard = ({ request, onResume, onEnd, isEnding }: ActiveRequestCardProps) => {
  const [confirmingEnd, setConfirmingEnd] = useState(false)
  const isProtected = request.accessType === FileAccessType.PROTECTED

  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl bg-[var(--brand-alpha-4)] border border-line">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-[var(--brand-alpha-12)] flex items-center justify-center shrink-0">
          {isProtected ? <LuLock className="w-5 h-5 text-[var(--brand-400)]" /> : <LuGlobe className="w-5 h-5 text-[var(--brand-400)]" />}
        </div>
        <div className="flex flex-col min-w-0 flex-1 gap-1">
          <span className="text-sm font-medium text-[var(--ink-900)] truncate">{request.folderName}</span>
          <div className="flex flex-row items-center gap-3 flex-wrap text-xs text-[var(--ink-600)] font-sans">
            <span className="flex items-center gap-1">
              {isProtected ? <LuLock className="w-3 h-3" /> : <LuGlobe className="w-3 h-3" />}
              {isProtected ? 'Protected' : 'Public'}
            </span>
            <span className="flex items-center gap-1">
              <LuFile className="w-3 h-3" />
              {request.fileCount} {request.fileCount === 1 ? 'file' : 'files'}
            </span>
            <span className="flex items-center gap-1">
              <LuClock className="w-3 h-3" />
              {formatTimeLeft(request.expireAt)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          onPress={onResume}
          className="flex-1 bg-[var(--ink-900)] text-[var(--brand-50)] rounded-lg text-sm font-medium h-10 hover:bg-[var(--ink-800)] font-sans flex items-center justify-center gap-2"
        >
          Resume session
          <LuArrowRight className="w-4 h-4" />
        </Button>
        {confirmingEnd ? (
          <div className="flex flex-1 gap-2">
            <Button
              onPress={onEnd}
              isPending={isEnding}
              isDisabled={isEnding}
              className="flex-1 bg-red-500 text-white rounded-lg text-sm font-medium h-10 hover:bg-red-600 font-sans"
            >
              Confirm end
            </Button>
            <Button
              onPress={() => setConfirmingEnd(false)}
              isDisabled={isEnding}
              variant="ghost"
              className="flex-1 text-[var(--ink-700)] border border-line rounded-lg text-sm font-medium h-10 hover:bg-ink-900/[0.06] font-sans"
            >
              Cancel
            </Button>
          </div>
        ) : (
          <Button
            onPress={() => setConfirmingEnd(true)}
            variant="ghost"
            className="flex-1 text-red-600 border border-red-500/30 rounded-lg text-sm font-medium h-10 hover:bg-red-500/[0.06] font-sans flex items-center justify-center gap-2"
          >
            <LuTrash2 className="w-4 h-4" />
            End session
          </Button>
        )}
      </div>
    </div>
  )
}

export default ActiveRequestCard
