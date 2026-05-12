'use client'

import { useFileUpload } from '@/components/file/FileUploadContext'
import { cn } from '@heroui/react'
import { LuFile, LuX } from 'react-icons/lu'

export interface FileUploadListProps {
  className?: string
}

const FileUploadList = ({ className }: FileUploadListProps) => {
  const { files, removeFile, errorMessage, isDisabled } = useFileUpload()

  if (files.length === 0 && !errorMessage) return null

  return (
    <div className={cn('flex flex-col gap-2 mt-3', className)}>
      {files.map((file) => {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(2)
        return (
          <div key={file.name} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-surface">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <LuFile className="w-4 h-4 text-primary" />
            </div>

            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-sm font-medium text-foreground truncate">{file.name}</span>
              <span className="text-xs text-muted">{sizeMB} MB</span>
            </div>

            <button
              disabled={isDisabled}
              type="button"
              aria-label={`Remove ${file.name}`}
              onClick={() => removeFile(file.name)}
              className="w-7 h-7 rounded-md flex items-center justify-center text-muted hover:text-foreground hover:bg-surface-secondary transition-colors shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LuX className="w-4 h-4" />
            </button>
          </div>
        )
      })}

      {errorMessage && <p className="text-sm text-danger px-1">{errorMessage}</p>}
    </div>
  )
}

export default FileUploadList
