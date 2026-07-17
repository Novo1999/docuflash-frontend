'use client'

import UploadItemCard from '@/components/me/UploadItemCard'
import { useDraggable } from '@dnd-kit/core'
import { cn } from '@heroui/react'
import type { ComponentProps } from 'react'
import { LuGripVertical } from 'react-icons/lu'

type DraggableUploadCardProps = ComponentProps<typeof UploadItemCard>

const DraggableUploadCard = (props: DraggableUploadCardProps) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `file-${props.entry.id}`,
    data: { entry: props.entry },
  })

  return (
    <div ref={setNodeRef} className={cn(isDragging && 'opacity-40')}>
      <UploadItemCard
        {...props}
        dragHandle={
          <button
            type="button"
            aria-label="Drag to move into a folder"
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing touch-none shrink-0 -ml-1 p-1 rounded-md text-ink-500 hover:text-ink-900 hover:bg-ink-900/[0.06] outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
          >
            <LuGripVertical className="w-4 h-4" />
          </button>
        }
      />
    </div>
  )
}

export default DraggableUploadCard
