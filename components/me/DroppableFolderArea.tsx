'use client'

import { type UploadEntry } from '@/components/me/UploadItemCard'
import { useDroppable } from '@dnd-kit/core'
import { cn } from '@heroui/react'
import type { ReactNode } from 'react'

type DroppableFolderAreaProps = {
  folder: UploadEntry
  children: ReactNode
}

const DroppableFolderArea = ({ folder, children }: DroppableFolderAreaProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `folder-area-${folder.id}`,
    data: { entry: folder },
  })

  return (
    <div ref={setNodeRef} className={cn('rounded-2xl transition-colors', isOver && 'ring-2 ring-primary-400 bg-primary/[0.05]')}>
      {children}
    </div>
  )
}

export default DroppableFolderArea
