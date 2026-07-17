'use client'

import DraggableUploadCard from '@/components/me/DraggableUploadCard'
import DroppableFolderArea from '@/components/me/DroppableFolderArea'
import DroppableFolderCard from '@/components/me/DroppableFolderCard'
import UploadItemCard, { type UploadEntry } from '@/components/me/UploadItemCard'
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { cn } from '@heroui/react'
import { useState, type ReactNode } from 'react'
import { LuFile } from 'react-icons/lu'

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
  onMoveFile?: (file: UploadEntry, folder: UploadEntry) => void
}

const PlainFolderArea = ({ children }: { folder: UploadEntry; children: ReactNode }) => <>{children}</>

const UploadTree = ({ groups, ungrouped, copiedToken, onCopy, onOpen, onDelete, onShowQr, onShareEmail, onMoveFile }: UploadTreeProps) => {
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set(groups.map((group) => group.folder.shareToken)))
  const [activeEntry, setActiveEntry] = useState<UploadEntry | null>(null)

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 6 } }),
  )

  const toggle = (entry: UploadEntry) => {
    setCollapsed((current) => {
      const next = new Set(current)
      if (next.has(entry.shareToken)) next.delete(entry.shareToken)
      else next.add(entry.shareToken)
      return next
    })
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveEntry((event.active.data.current?.entry as UploadEntry) ?? null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveEntry(null)
    const file = event.active.data.current?.entry as UploadEntry | undefined
    const folder = event.over?.data.current?.entry as UploadEntry | undefined
    if (file && folder && onMoveFile) onMoveFile(file, folder)
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

  const FileCard = onMoveFile ? DraggableUploadCard : UploadItemCard
  const FolderCard = onMoveFile ? DroppableFolderCard : UploadItemCard
  const FolderArea = onMoveFile ? DroppableFolderArea : PlainFolderArea

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragCancel={() => setActiveEntry(null)}>
      <div className="flex flex-col gap-3">
        {groups.map((group) => {
          const isExpanded = !collapsed.has(group.folder.shareToken)
          return (
            <div key={group.folder.shareToken} className="flex flex-col gap-2">
              <FolderCard {...cardProps(group.folder)} isExpanded={isExpanded} onToggle={toggle} />
              {isExpanded ? (
                <FolderArea folder={group.folder}>
                  {group.files.length > 0 ? (
                    <div className="flex flex-col gap-2">
                      {group.files.map((file, index) => {
                        const isLast = index === group.files.length - 1
                        return (
                          <div key={file.shareToken} className="relative pl-4 sm:pl-7">
                            {/* tree connectors: vertical spine + elbow into the card */}
                            <span className={cn('absolute left-2 sm:left-3.5 top-0 w-px bg-ink-900/15', isLast ? 'h-1/2' : 'h-full')} aria-hidden />
                            <span className="absolute left-2 sm:left-3.5 top-1/2 h-px w-2 sm:w-3.5 bg-ink-900/15" aria-hidden />
                            <FileCard {...cardProps(file)} />
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="ml-4 sm:ml-7 rounded-lg border border-dashed border-line bg-[var(--brand-alpha-4)] px-3 py-3 text-sm  text-center text-[var(--ink-600)] font-sans">
                      No files in this folder
                    </div>
                  )}
                </FolderArea>
              ) : null}
            </div>
          )
        })}

        {ungrouped.map((entry) => (
          <FileCard key={entry.shareToken} {...cardProps(entry)} />
        ))}
      </div>

      <DragOverlay dropAnimation={null}>
        {activeEntry ? (
          <div className="flex items-center gap-2 rounded-xl bg-surface border border-line px-3 py-2 shadow-[0_8px_30px_rgba(15,28,46,0.18)] font-sans max-w-[260px]">
            <LuFile className="w-4 h-4 text-primary-400 shrink-0" />
            <span className="text-sm font-medium text-ink-900 truncate">{activeEntry.name}</span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

export default UploadTree
