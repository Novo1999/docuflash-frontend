'use client'

import { deleteFileByShareToken } from '@/app/lib/api/files'
import { deleteFolderByShareToken } from '@/app/lib/api/folder'
import { RECENT_UPLOADS_UPDATED_EVENT, getRecentUploads, markAsCopied, removeRecentUpload } from '@/app/utils/sessionStorage'
import { getFolderShareLink, getShareLink } from '@/app/utils/upload'
import { StoredItem } from '@/types/file'
import { Button, Card, Modal, useOverlayState } from '@heroui/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { FiAlertTriangle } from 'react-icons/fi'
import { LuClock, LuCopy, LuExternalLink, LuFile, LuFolder, LuTrash2 } from 'react-icons/lu'

const RecentUploads = () => {
  const [uploads, setUploads] = useState<StoredItem[]>(() => getRecentUploads())
  const [copiedToken, setCopiedToken] = useState<string | null>(null)
  const [itemToDelete, setItemToDelete] = useState<StoredItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const deleteModal = useOverlayState()
  const router = useRouter()

  useEffect(() => {
    const syncUploads = () => setUploads(getRecentUploads())

    window.addEventListener(RECENT_UPLOADS_UPDATED_EVENT, syncUploads)

    return () => {
      window.removeEventListener(RECENT_UPLOADS_UPDATED_EVENT, syncUploads)
    }
  }, [])

  const getItemLink = (item: StoredItem) => {
    return item.kind === 'folder' ? getFolderShareLink(item.shareToken) : getShareLink(item.shareToken)
  }

  const handleCopy = (item: StoredItem) => {
    const link = getItemLink(item)
    navigator.clipboard.writeText(link)
    markAsCopied(item.shareToken)
    setCopiedToken(item.shareToken)
    setTimeout(() => setCopiedToken(null), 2000)
  }

  const handleDeleteClick = (item: StoredItem) => {
    setItemToDelete(item)
    deleteModal.open()
  }

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return
    
    setIsDeleting(true)
    try {
      if (itemToDelete.kind === 'folder') {
        await deleteFolderByShareToken(itemToDelete.shareToken)
      } else {
        await deleteFileByShareToken(itemToDelete.shareToken)
      }
      removeRecentUpload(itemToDelete.shareToken)
      setUploads((currentUploads) => currentUploads.filter((u) => u.shareToken !== itemToDelete.shareToken))
      deleteModal.close()
      setItemToDelete(null)
    } catch (error) {
      console.error('Failed to delete item:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  if (uploads.length === 0) return null

  return (
    <div className="flex flex-col gap-4 mt-8 w-full">
      <h2 className="text-xl font-serif text-foreground text-left px-1">Currently uploaded</h2>
      <div className="flex flex-col gap-3">
        {uploads.map((item) => (
          <Card key={item.shareToken} className="bg-white border border-black/[0.06] rounded-2xl p-4 shadow-[0_2px_20px_rgba(15,28,46,0.04)] font-sans">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/[0.08] flex items-center justify-center shrink-0">
                {item.kind === 'folder' ? (
                  <LuFolder className="w-5 h-5 text-primary-400" />
                ) : (
                  <LuFile className="w-5 h-5 text-primary-400" />
                )}
              </div>
              
              <div className="flex flex-col min-w-0 flex-1 text-left">
                <span className="text-sm font-medium text-ink-900 truncate">
                  {item.kind === 'folder' ? item.folderName : item.fileName}
                </span>
                <div className="flex items-center gap-3 text-xs text-ink-500">
                  <span>
                    {item.kind === 'folder' 
                      ? `${item.fileCount} files` 
                      : `${(item.fileSize / (1024 * 1024)).toFixed(2)} MB`}
                  </span>
                  <span className="flex items-center gap-1">
                    <LuClock className="w-3 h-3" />
                    {new Date(item.expireAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  isIconOnly
                  size="sm"
                  variant="ghost"
                  onPress={() => handleCopy(item)}
                  className={copiedToken === item.shareToken ? 'text-primary-400' : 'text-ink-600'}
                >
                  <LuCopy className="w-4 h-4" />
                </Button>
                
                <Button
                  isIconOnly
                  size="sm"
                  variant="ghost"
                  onPress={() => router.push(getItemLink(item))}
                  className="text-ink-600"
                >
                  <LuExternalLink className="w-4 h-4" />
                </Button>

                <Button
                  isIconOnly
                  size="sm"
                  variant="ghost"
                  onPress={() => handleDeleteClick(item)}
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
              <Modal.Heading>Delete {itemToDelete?.kind === 'folder' ? 'folder' : 'file'}</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <p className="text-sm text-ink-600">
                Are you sure you want to delete <span className="font-semibold text-ink-900">
                  {itemToDelete?.kind === 'folder' ? itemToDelete.folderName : itemToDelete?.fileName}
                </span>? This action cannot be undone.
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

export default RecentUploads
