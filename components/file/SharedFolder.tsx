'use client'

import { useCopyLink } from '@/app/hooks/useCopyLink'
import { useFileDelete } from '@/app/hooks/useFileDelete'
import { useFileDownload } from '@/app/hooks/useFileDownload'
import { useFolderDelete } from '@/app/hooks/useFolderDelete'
import { formatDate, formatFileSize, getFileTypeInfo } from '@/app/utils/shareFileUtil'
import { getShareLink } from '@/app/utils/upload'
import { FileRecord } from '@/types/file'
import { FolderRecord } from '@/types/folder'
import { Button, Card, CardContent, Chip, Modal, useOverlayState } from '@heroui/react'
import Link from 'next/link'
import { useState } from 'react'
import { FiAlertTriangle } from 'react-icons/fi'
import { LuCalendar, LuCheck, LuCopy, LuDownload, LuExternalLink, LuFile, LuFolder, LuTrash2 } from 'react-icons/lu'

interface SharedFolderProps {
  folder: FolderRecord
}

const SharedFolder = ({ folder }: SharedFolderProps) => {
  console.log("🚀 ~ SharedFolder ~ folder:", folder)
  const [files, setFiles] = useState(folder.files)
  const [itemToDelete, setItemToDelete] = useState<{ kind: 'file' | 'folder'; data: FileRecord | FolderRecord } | null>(null)
  
  const { downloadFile, isDownloading } = useFileDownload()
  const { copyToClipboard, copiedId } = useCopyLink()
  const { removeFile, isDeleting } = useFileDelete()
  const { removeFolder, isDeletingFolder } = useFolderDelete()
  const deleteModal = useOverlayState()

  const handleDeleteFileClick = (file: FileRecord) => {
    setItemToDelete({ kind: 'file', data: file })
    deleteModal.open()
  }

  const handleDeleteFolderClick = () => {
    setItemToDelete({ kind: 'folder', data: folder })
    deleteModal.open()
  }

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return

    if (itemToDelete.kind === 'file') {
      const success = await removeFile(itemToDelete.data.id)
      if (success) {
        setFiles(files.filter(f => f.id !== itemToDelete.data.id))
        deleteModal.close()
        setItemToDelete(null)
      }
    } else {
      const success = await removeFolder(folder.shareToken)
      if (success) {
        deleteModal.close()
      }
    }
  }

  const isAnyActionPending = !!isDeleting || isDeletingFolder

  return (
    <div className="min-h-screen bg-[var(--brand-50)]">
      <div className="max-w-[720px] mx-auto pt-[72px] pb-10 px-4">
        <div className="flex flex-col gap-6">
          {/* Header Section */}
          <div className="flex flex-row gap-4 items-start">
            <div className="w-16 h-16 bg-primary-50 rounded-xl flex items-center justify-center shrink-0">
              <LuFolder className="text-primary-500 w-8 h-8" />
            </div>
            <div className="flex flex-col gap-1 flex-1 min-w-0">
              <div className="flex flex-row items-start justify-between gap-4">
                <h2 className="text-xl font-serif text-[var(--ink-900)] break-words leading-tight">{folder.folderName}</h2>
                <Button
                  isIconOnly
                  variant="ghost"
                  size="sm"
                  onPress={handleDeleteFolderClick}
                  className="text-red-400 hover:text-red-600 hover:bg-red-50 shrink-0"
                  aria-label="Delete folder"
                >
                  <LuTrash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-row gap-2 flex-wrap items-center mt-1">
                <Chip size="sm" variant="secondary" className="font-medium px-2">
                  {files.length} Files
                </Chip>
                <div className="flex flex-row items-center gap-1">
                  <LuCalendar className="w-3 h-3 text-[var(--ink-600)]" />
                  <span className="text-xs text-[var(--ink-600)] font-medium">
                    {formatDate(folder.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Files List Section */}
          <Card className="w-full border-none shadow-[0_4px_40px_rgba(15,28,46,0.07)]">
            <CardContent className="p-8 flex flex-col gap-5">
              <h2 className="text-xl font-serif text-[var(--ink-900)]">Files in this folder</h2>
              <div className="flex flex-col gap-3">
                {files.length === 0 ? (
                  <p className="text-center py-8 text-[var(--ink-500)] font-sans">This folder is empty.</p>
                ) : (
                  files.map((file) => {
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
                            {!isDownloading || isDownloading !== file.shareToken ? (
                              <LuDownload className="w-4 h-4 text-[var(--ink-600)]" />
                            ) : null}
                          </Button>
                          <Button
                            isIconOnly
                            variant="ghost"
                            onPress={() => copyToClipboard(getShareLink(file.shareToken), file.id)}
                            className="w-8 h-8 rounded-lg min-w-0 hover:bg-black/[0.05] transition-colors"
                            aria-label="Copy share link"
                          >
                            {copiedId === file.id ? (
                              <LuCheck className="w-4 h-4 text-green-600" />
                            ) : (
                              <LuCopy className="w-4 h-4 text-[var(--ink-600)]" />
                            )}
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
            </CardContent>
          </Card>
        </div>
      </div>

      <Modal.Backdrop isOpen={deleteModal.isOpen} onOpenChange={deleteModal.setOpen}>
        <Modal.Container>
          <Modal.Dialog className="sm:max-w-[360px]">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Icon className="bg-red-50 text-red-500">
                <FiAlertTriangle className="size-5" />
              </Modal.Icon>
              <Modal.Heading>Delete {itemToDelete?.kind}</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <p className="text-sm text-[var(--ink-600)] font-sans">
                Are you sure you want to delete <span className="font-semibold text-[var(--ink-900)]">
                  {itemToDelete?.kind === 'file' ? (itemToDelete.data as FileRecord).fileName : (itemToDelete?.data as FolderRecord)?.folderName}
                </span>? This action cannot be undone.
              </p>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="ghost"
                onPress={deleteModal.close}
                className="flex-1 text-[var(--ink-600)] font-sans"
                isDisabled={isAnyActionPending}
              >
                Cancel
              </Button>
              <Button
                onPress={handleConfirmDelete}
                className="flex-1 bg-red-500 text-white hover:bg-red-600 font-sans font-medium"
                isPending={isAnyActionPending}
              >
                Delete
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </div>
  )
}

export default SharedFolder
