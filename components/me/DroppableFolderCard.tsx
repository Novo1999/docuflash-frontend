'use client'

import UploadItemCard from '@/components/me/UploadItemCard'
import { useDroppable } from '@dnd-kit/core'
import { cn } from '@heroui/react'
import type { ComponentProps } from 'react'

type DroppableFolderCardProps = ComponentProps<typeof UploadItemCard>

const DroppableFolderCard = (props: DroppableFolderCardProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `folder-${props.entry.id}`,
    data: { entry: props.entry },
  })

  return (
    <div ref={setNodeRef} className={cn('rounded-2xl transition-shadow', isOver && 'ring-2 ring-primary-400 shadow-[0_4px_24px_rgba(15,28,46,0.12)]')}>
      <UploadItemCard {...props} />
    </div>
  )
}

export default DroppableFolderCard
