'use client'

import { useCopyLink } from '@/app/hooks/useCopyLink'
import { useFileDownload } from '@/app/hooks/useFileDownload'
import { formatFileSize, getFileTypeInfo } from '@/app/utils/shareFileUtil'
import { getShareLink } from '@/app/utils/upload'
import { deleteModalOpenAtom, itemToDeleteAtom } from '@/components/folder/atoms/folderAtom'
import { FileRecord } from '@/types/file'
import { FolderRecord } from '@/types/folder'
import { Button } from '@heroui/react'
import { useSetAtom } from 'jotai'
import Link from 'next/link'
import { LuCheck, LuCopy, LuDownload, LuExternalLink, LuFile, LuTrash2 } from 'react-icons/lu'

interface SharedFolderProps {
  folder: FolderRecord
}

const SharedFolder = ({ folder }: SharedFolderProps) => {
  const setItemToDelete = useSetAtom(itemToDeleteAtom)

  const { downloadFile, isDownloading } = useFileDownload()
  const { copyToClipboard, copiedId } = useCopyLink()
  const setDeleteModalOpen = useSetAtom(deleteModalOpenAtom)

  const handleDeleteFileClick = (file: FileRecord) => {
    setItemToDelete({ kind: 'file', data: file })
    setDeleteModalOpen(true)
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        {folder.files.length === 0 ? (
          <p className="text-center py-8 text-[var(--ink-500)] font-sans">This folder is empty.</p>
        ) : (
          folder.files.map((file) => {
            const fileTypeInfo = getFileTypeInfo(file.fileType)
            return (
              <div key={file.id} className="flex items-center gap-4 p-4 rounded-xl hover:bg-black/[0.02] transition-colors border border-black/[0.04]">
                <div className={`w-10 h-10 ${fileTypeInfo.bg} rounded-lg flex items-center justify-center shrink-0`}>
                  <LuFile className={`${fileTypeInfo.color} w-5 h-5`} />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-sm font-medium text-[var(--ink-900)] truncate">{file.fileName}</span>
                  <span className="text-xs text-[var(--ink-500)] font-sans">{formatFileSize(file.fileSize)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    isIconOnly
                    variant="ghost"
                    onPress={() => downloadFile(file.shareToken, file.fileName)}
                    isPending={isDownloading === file.shareToken}
                    className="w-8 h-8 rounded-lg min-w-0 hover:bg-black/[0.05] transition-colors"
                    aria-label="Download file"
                  >
                    {!isDownloading || isDownloading !== file.shareToken ? <LuDownload className="w-4 h-4 text-[var(--ink-600)]" /> : null}
                  </Button>
                  <Button
                    isIconOnly
                    variant="ghost"
                    onPress={() => copyToClipboard(getShareLink(file.shareToken), file.id)}
                    className="w-8 h-8 rounded-lg min-w-0 hover:bg-black/[0.05] transition-colors"
                    aria-label="Copy share link"
                  >
                    {copiedId === file.id ? <LuCheck className="w-4 h-4 text-green-600" /> : <LuCopy className="w-4 h-4 text-[var(--ink-600)]" />}
                  </Button>
                  <Button
                    isIconOnly
                    variant="ghost"
                    onPress={() => handleDeleteFileClick(file)}
                    className="w-8 h-8 rounded-lg min-w-0 text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    aria-label="Delete file"
                  >
                    <LuTrash2 className="w-4 h-4" />
                  </Button>
                  <Link
                    href={`/share/${file.shareToken}`}
                    className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-black/[0.05] transition-colors text-[var(--ink-600)]"
                    aria-label="View file"
                  >
                    <LuExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )
          })
        )}
      </div>
    </>
  )
}

export default SharedFolder
