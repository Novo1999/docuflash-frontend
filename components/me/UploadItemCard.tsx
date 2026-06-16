'use client'

import { FileAccessType } from '@/types/file'
import { Button, Card, cn } from '@heroui/react'
import { LuChevronRight, LuClock, LuCopy, LuExternalLink, LuFile, LuFolder, LuLock, LuQrCode, LuTrash2 } from 'react-icons/lu'

export type UploadEntry = {
  kind: 'file' | 'folder'
  id: string
  name: string
  shareToken: string
  link: string
  accessType: FileAccessType
  expireAt: string
  meta: string
  downloadCount: number | null
}

type UploadItemCardProps = {
  entry: UploadEntry
  isCopied: boolean
  onCopy: (entry: UploadEntry) => void
  onOpen: (entry: UploadEntry) => void
  onDelete: (entry: UploadEntry) => void
  onShowQr?: (entry: UploadEntry) => void
  isExpanded?: boolean
  onToggle?: (entry: UploadEntry) => void
}

const formatExpiry = (value: string) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString()
}

const UploadItemCard = ({ entry, isCopied, onCopy, onShowQr, onOpen, onDelete, isExpanded, onToggle }: UploadItemCardProps) => {
  const isFolder = entry.kind === 'folder'
  const isProtected = entry.accessType === FileAccessType.PROTECTED

  return (
    <Card className="bg-surface border border-line rounded-2xl p-4 shadow-[0_2px_20px_rgba(15,28,46,0.04)] font-sans">
      <div className="flex items-center gap-4">
        {onToggle ? (
          <Button
            isIconOnly
            size="sm"
            variant="ghost"
            aria-label={isExpanded ? 'Collapse folder' : 'Expand folder'}
            onPress={() => onToggle(entry)}
            className="text-ink-600 -ml-1 shrink-0"
          >
            <LuChevronRight className={cn('w-4 h-4 transition-transform', isExpanded && 'rotate-90')} />
          </Button>
        ) : null}
        <div className="w-10 h-10 rounded-xl bg-primary/[0.08] flex items-center justify-center shrink-0">
          {isFolder ? <LuFolder className="w-5 h-5 text-primary-400" /> : <LuFile className="w-5 h-5 text-primary-400" />}
        </div>

        <div className="flex flex-col min-w-0 flex-1 text-left">
          <span className="text-sm font-medium text-ink-900 truncate">{entry.name}</span>
          <div className="flex items-center gap-3 text-xs text-ink-500 flex-wrap">
            <span className="uppercase tracking-wide">{entry.meta}</span>
            <span className="flex items-center gap-1">
              <LuClock className="w-3 h-3" />
              {formatExpiry(entry.expireAt)}
            </span>
            {entry.downloadCount !== null ? <span>{entry.downloadCount} downloads</span> : null}
            {isProtected ? (
              <span className="flex items-center gap-1 text-ink-600">
                <LuLock className="w-3 h-3" />
                Protected
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Button isIconOnly size="sm" variant="ghost" aria-label="Copy share link" onPress={() => onCopy(entry)} className={cn(isCopied ? 'text-primary-400' : 'text-ink-600')}>
            <LuCopy className="w-4 h-4" />
          </Button>
          {onShowQr ? (
            <Button isIconOnly size="sm" variant="ghost" aria-label="Show QR code" onPress={() => onShowQr(entry)} className="text-ink-600">
              <LuQrCode className="w-4 h-4" />
            </Button>
          ) : null}
          <Button isIconOnly size="sm" variant="ghost" aria-label="Open share link" onPress={() => onOpen(entry)} className="text-ink-600">
            <LuExternalLink className="w-4 h-4" />
          </Button>
          <Button isIconOnly size="sm" variant="ghost" aria-label="Delete" onPress={() => onDelete(entry)} className="text-red-400 hover:text-red-600 hover:bg-red-500/10">
            <LuTrash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}

export default UploadItemCard
