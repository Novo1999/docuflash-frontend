'use client'

import { useFileUpload } from '@/components/file/FileUploadContext'
import { Button, cn } from '@heroui/react'
import { DropZone } from 'react-aria-components'
import { FiUploadCloud } from 'react-icons/fi'

export interface FileUploadDropzoneProps {
  label?: string
  description?: string
  className?: string
}

const FileUploadDropzone = ({ label = 'Drop your file here', description, className }: FileUploadDropzoneProps) => {
  const { addFiles, openFilePicker, isDragOver, setIsDragOver, isInvalid, isDisabled } = useFileUpload()

  return (
    <DropZone
      onDropEnter={() => !isDisabled && setIsDragOver(true)}
      onDropExit={() => setIsDragOver(false)}
      onDrop={async (e) => {
        if (isDisabled) return
        setIsDragOver(false)
        const dropped: File[] = []
        for (const item of e.items) {
          if (item.kind === 'file') {
            const file = await item.getFile()
            dropped.push(file)
          }
        }
        addFiles(dropped)
      }}
      className={cn(
        'w-full flex flex-col items-center justify-center gap-3 px-6 py-10',
        'border-[1.5px] border-dashed rounded-xl cursor-pointer transition-all duration-200 outline-none',
        isDragOver ? 'border-primary bg-primary/[0.08] scale-[1.01]' : isInvalid ? 'border-red-400 bg-red-50/50' : 'border-border bg-surface-secondary hover:border-primary/60 hover:bg-primary/[0.04]',
        'focus-visible:ring-2 focus-visible:ring-primary/30',
        isDisabled && 'opacity-50 cursor-not-allowed pointer-events-none',
        className,
      )}
      onClick={openFilePicker}
    >
      <div className={cn('w-12 h-12 rounded-full flex items-center justify-center transition-colors', isDragOver ? 'bg-primary/20' : 'bg-surface')}>
        <FiUploadCloud className={cn('w-6 h-6 transition-colors', isDragOver ? 'text-primary' : 'text-muted')} />
      </div>

      <div className="flex flex-col items-center gap-1 text-center">
        <span className="text-sm font-medium text-foreground">{label}</span>
        {description && <span className="text-xs text-muted">{description}</span>}
      </div>

      <Button size="sm" variant="outline" type="button" onPress={openFilePicker} className="mt-1">
        Browse files
      </Button>
    </DropZone>
  )
}

export default FileUploadDropzone
