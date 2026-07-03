'use client'

import UploadItemCard, { type UploadEntry } from '@/components/me/UploadItemCard'
import { cn } from '@heroui/react'
import { useState } from 'react'

export type UploadTreeGroup = {
  folder: UploadEntry
  files: UploadEntry[]
}

type UploadTreeProps = {
  groups: UploadTreeGroup[]
  ungrouped: UploadEntry[]
  copiedToken: string | null
  onCopy: (entry: UploadEntry) => void
  onOpen: (entry: UploadEntry) => void
  onDelete: (entry: UploadEntry) => void
  onShowQr?: (entry: UploadEntry) => void
  onShareEmail?: (entry: UploadEntry) => void
}

const UploadTree = ({ groups, ungrouped, copiedToken, onCopy, onOpen, onDelete, onShowQr, onShareEmail }: UploadTreeProps) => {
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set(groups.map((group) => group.folder.shareToken)))

  const toggle = (entry: UploadEntry) => {
    setCollapsed((current) => {
      const next = new Set(current)
      if (next.has(entry.shareToken)) next.delete(entry.shareToken)
      else next.add(entry.shareToken)
      return next
    })
  }

  const cardProps = (entry: UploadEntry) => ({
    entry,
    isCopied: copiedToken === entry.shareToken,
    onCopy,
    onOpen,
    onDelete,
    onShowQr,
    onShareEmail,
  })

  return (
    <div className="flex flex-col gap-3">
      {groups.map((group) => {
        const isExpanded = !collapsed.has(group.folder.shareToken)
        return (
          <div key={group.folder.shareToken} className="flex flex-col gap-2">
            <UploadItemCard {...cardProps(group.folder)} isExpanded={isExpanded} onToggle={toggle} />
            {isExpanded ? (
              group.files.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {group.files.map((file, index) => {
                    const isLast = index === group.files.length - 1
                    return (
                      <div key={file.shareToken} className="relative pl-4 sm:pl-7">
                        {/* tree connectors: vertical spine + elbow into the card */}
                        <span className={cn('absolute left-2 sm:left-3.5 top-0 w-px bg-ink-900/15', isLast ? 'h-1/2' : 'h-full')} aria-hidden />
                        <span className="absolute left-2 sm:left-3.5 top-1/2 h-px w-2 sm:w-3.5 bg-ink-900/15" aria-hidden />
                        <UploadItemCard {...cardProps(file)} />
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="ml-4 sm:ml-7 rounded-lg border border-dashed border-line bg-[var(--brand-alpha-4)] px-3 py-3 text-sm  text-center text-[var(--ink-600)] font-sans">
                  No files in this folder
                </div>
              )
            ) : null}
          </div>
        )
      })}

      {ungrouped.map((entry) => (
        <UploadItemCard key={entry.shareToken} {...cardProps(entry)} />
      ))}
    </div>
  )
}

export default UploadTree
