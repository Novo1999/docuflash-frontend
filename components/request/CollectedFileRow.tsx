'use client'

import { formatFileSize, getFileTypeInfo } from '@/app/utils/shareFileUtil'
import { isPreviewableFileType, type FileRecord } from '@/types/file'
import { Button } from '@heroui/react'
import { LuDownload, LuEye, LuFile, LuTrash2 } from 'react-icons/lu'

interface CollectedFileRowProps {
  file: FileRecord
  isPreviewActive: boolean
  isPreviewLoading: boolean
  isDownloading: boolean
  isDeleting: boolean
  onPreview: () => void
  onDownload: () => void
  onDelete: () => void
}

const CollectedFileRow = ({ file, isPreviewActive, isPreviewLoading, isDownloading, isDeleting, onPreview, onDownload, onDelete }: CollectedFileRowProps) => {
  const fileTypeInfo = getFileTypeInfo(file.fileType)
  const canPreview = isPreviewableFileType(file.fileType)

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-ink-900/[0.04] transition-colors border border-line">
      <div className={`w-10 h-10 ${fileTypeInfo.bg} rounded-lg flex items-center justify-center shrink-0`}>
        <LuFile className={`${fileTypeInfo.color} w-5 h-5`} />
      </div>
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-sm font-medium text-[var(--ink-900)] truncate">{file.fileName}</span>
        <span className="text-xs text-[var(--ink-500)] font-sans">{formatFileSize(file.fileSize)}</span>
      </div>
      <div className="flex items-center gap-1">
        {canPreview && (
          <Button
            isIconOnly
            variant="ghost"
            onPress={onPreview}
            isPending={isPreviewLoading}
            isDisabled={isPreviewActive || isDeleting}
            className="w-8 h-8 rounded-lg min-w-0 hover:bg-ink-900/[0.06] transition-colors"
            aria-label="Preview file"
          >
            {!isPreviewLoading ? <LuEye className={`w-4 h-4 ${isPreviewActive ? 'text-[var(--brand-400)]' : 'text-[var(--ink-600)]'}`} /> : null}
          </Button>
        )}
        <Button
          isIconOnly
          variant="ghost"
          onPress={onDownload}
          isPending={isDownloading}
          isDisabled={isDeleting}
          className="w-8 h-8 rounded-lg min-w-0 hover:bg-ink-900/[0.06] transition-colors"
          aria-label="Download file"
        >
          {!isDownloading ? <LuDownload className="w-4 h-4 text-[var(--ink-600)]" /> : null}
        </Button>
        <Button
          isIconOnly
          variant="ghost"
          onPress={onDelete}
          isPending={isDeleting}
          className="w-8 h-8 rounded-lg min-w-0 text-red-400 hover:text-red-600 hover:bg-red-500/10 transition-colors"
          aria-label="Delete file"
        >
          {!isDeleting ? <LuTrash2 className="w-4 h-4" /> : null}
        </Button>
      </div>
    </div>
  )
}

export default CollectedFileRow
