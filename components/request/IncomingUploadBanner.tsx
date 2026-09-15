'use client'

import type { UploadingPayload } from '@/app/hooks/useRequestRealtime'
import { ProgressBar } from '@heroui/react'
import { LuLoaderCircle } from 'react-icons/lu'

/**
 * Shown to whoever is watching the link while someone else uploads to it. The
 * sender broadcasts progress as it goes, but an older client (or the first tick
 * before any progress arrives) sends none — hence the indeterminate spinner.
 */
const IncomingUploadBanner = ({ incoming }: { incoming: UploadingPayload }) => {
  const hasProgress = typeof incoming.progress === 'number'

  return (
    <div className="flex flex-col gap-2.5 px-4 py-3 rounded-xl bg-[var(--brand-alpha-4)] border border-[var(--brand-alpha-30)]">
      <div className="flex items-center gap-3">
        <LuLoaderCircle className="w-4 h-4 text-[var(--brand-400)] animate-spin shrink-0" />
        <span className="text-sm text-[var(--ink-900)] font-sans flex-1 min-w-0">
          {incoming.uploaderName ?? 'A user'} is uploading <span className="font-medium">{incoming.fileName}</span>
        </span>
        {hasProgress && <span className="text-sm font-medium text-[var(--brand-400)] font-sans tabular-nums shrink-0">{Math.round(incoming.progress!)}%</span>}
      </div>
      {hasProgress && (
        <ProgressBar value={incoming.progress} aria-label="Incoming upload progress">
          <ProgressBar.Track className="h-1.5">
            <ProgressBar.Fill />
          </ProgressBar.Track>
        </ProgressBar>
      )}
    </div>
  )
}

export default IncomingUploadBanner
