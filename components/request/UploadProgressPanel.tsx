'use client'

import { formatFileSize } from '@/app/utils/shareFileUtil'
import { ProgressBar } from '@heroui/react'
import { LuFile } from 'react-icons/lu'

interface UploadProgressPanelProps {
  files: File[]
  /** Per-file progress (0-100), keyed by the file's index in `files`. */
  progressByIndex: Record<number, number>
  totalProgress: number
}

/**
 * Replaces the dropzone while an upload is in flight. Each file gets its own bar
 * so the sender can tell which one is still moving — UploadThing uploads them in
 * parallel, so a single combined bar hides that.
 */
const UploadProgressPanel = ({ files, progressByIndex, totalProgress }: UploadProgressPanelProps) => (
  <div className="flex flex-col gap-4">
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-[var(--ink-900)] font-sans">
          Uploading {files.length} {files.length === 1 ? 'file' : 'files'}
        </span>
        <span className="text-sm font-medium text-[var(--brand-400)] font-sans tabular-nums">{Math.round(totalProgress)}%</span>
      </div>
      <ProgressBar value={totalProgress} aria-label="Total upload progress">
        <ProgressBar.Track className="h-2">
          <ProgressBar.Fill />
        </ProgressBar.Track>
      </ProgressBar>
    </div>

    <div className="flex flex-col gap-3">
      {files.map((file, index) => {
        const progress = progressByIndex[index] ?? 0
        const isDone = progress >= 100
        return (
          <div key={`${file.name}-${index}`} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-surface">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <LuFile className="w-4 h-4 text-primary" />
            </div>

            <div className="flex flex-col min-w-0 flex-1 gap-1.5">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-sm font-medium text-foreground truncate">{file.name}</span>
                <span className="text-xs text-muted shrink-0 tabular-nums">{isDone ? 'Finishing up…' : `${progress}% of ${formatFileSize(file.size)}`}</span>
              </div>
              <ProgressBar value={progress} aria-label={`Upload progress for ${file.name}`}>
                <ProgressBar.Track className="h-1.5">
                  <ProgressBar.Fill />
                </ProgressBar.Track>
              </ProgressBar>
            </div>
          </div>
        )
      })}
    </div>
  </div>
)

export default UploadProgressPanel
