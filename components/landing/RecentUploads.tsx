'use client'

import { deleteFileByShareToken } from '@/app/lib/api/files'
import { getRecentUploads, markAsCopied, removeRecentUpload } from '@/app/utils/sessionStorage'
import { getShareLink } from '@/app/utils/upload'
import { StoredUpload } from '@/types/file'
import { Button, Card, Modal, useOverlayState } from '@heroui/react'
import { useEffect, useState } from 'react'
import { FiAlertTriangle } from 'react-icons/fi'
import { LuClock, LuCopy, LuExternalLink, LuFile, LuTrash2 } from 'react-icons/lu'

export function RecentUploads() {
  const [uploads, setUploads] = useState<StoredUpload[]>(() => getRecentUploads())
  const [copiedToken, setCopiedToken] = useState<string | null>(null)
  const [fileToDelete, setFileToDelete] = useState<StoredUpload | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const deleteModal = useOverlayState()

  const loadUploads = () => {
    setUploads(getRecentUploads())
  }

  useEffect(() => {
    window.addEventListener('recent-uploads-updated', loadUploads)
    
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const currentUploads = getRecentUploads()
      const hasUncopied = currentUploads.some(u => !u.copied)
      if (hasUncopied) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('recent-uploads-updated', loadUploads)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [])

  const handleCopy = (token: string) => {
    const link = getShareLink(token)
    navigator.clipboard.writeText(link)
    markAsCopied(token)
    setCopiedToken(token)
    setTimeout(() => setCopiedToken(null), 2000)
  }

  const handleDeleteClick = (upload: StoredUpload) => {
    setFileToDelete(upload)
    deleteModal.open()
  }

  const handleConfirmDelete = async () => {
    if (!fileToDelete) return
    
    setIsDeleting(true)
    try {
      await deleteFileByShareToken(fileToDelete.shareToken)
      removeRecentUpload(fileToDelete.storageKey)
      deleteModal.close()
      setFileToDelete(null)
    } catch (error) {
      console.error('Failed to delete file:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  if (uploads.length === 0) return null

  return (
    <div className="flex flex-col gap-4 mt-8 w-full">
      <h2 className="text-xl font-serif text-foreground text-left px-1">Currently uploaded</h2>
      <div className="flex flex-col gap-3">
        {uploads.map((upload) => (
          <Card key={upload.storageKey} className="bg-white border border-black/[0.06] rounded-2xl p-4 shadow-[0_2px_20px_rgba(15,28,46,0.04)] font-sans">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/[0.08] flex items-center justify-center shrink-0">
                <LuFile className="w-5 h-5 text-primary-400" />
              </div>
              
              <div className="flex flex-col min-w-0 flex-1 text-left">
                <span className="text-sm font-medium text-ink-900 truncate">{upload.fileName}</span>
                <div className="flex items-center gap-3 text-xs text-ink-500">
                  <span>{(upload.fileSize / (1024 * 1024)).toFixed(2)} MB</span>
                  <span className="flex items-center gap-1">
                    <LuClock className="w-3 h-3" />
                    {new Date(upload.expireAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  isIconOnly
                  size="sm"
                  variant="ghost"
                  onPress={() => handleCopy(upload.shareToken)}
                  className={copiedToken === upload.shareToken ? 'text-primary-400' : 'text-ink-600'}
                >
                  <LuCopy className="w-4 h-4" />
                </Button>
                
                <Button
                  isIconOnly
                  size="sm"
                  variant="ghost"
                  onPress={() => window.open(getShareLink(upload.shareToken), '_blank')}
                  className="text-ink-600"
                >
                  <LuExternalLink className="w-4 h-4" />
                </Button>

                <Button
                  isIconOnly
                  size="sm"
                  variant="ghost"
                  onPress={() => handleDeleteClick(upload)}
                  className="text-red-400 hover:text-red-600 hover:bg-red-50"
                >
                  <LuTrash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal.Backdrop isOpen={deleteModal.isOpen} onOpenChange={deleteModal.setOpen}>
        <Modal.Container>
          <Modal.Dialog className="sm:max-w-[360px]">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Icon className="bg-red-50 text-red-500">
                <FiAlertTriangle className="size-5" />
              </Modal.Icon>
              <Modal.Heading>Delete file</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <p className="text-sm text-ink-600">
                Are you sure you want to delete <span className="font-semibold text-ink-900">{fileToDelete?.fileName}</span>? This action cannot be undone.
              </p>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="ghost"
                onPress={deleteModal.close}
                className="flex-1 text-ink-600"
                isDisabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                onPress={handleConfirmDelete}
                className="flex-1 bg-red-500 text-white hover:bg-red-600"
                isPending={isDeleting}
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
