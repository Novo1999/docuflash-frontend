'use client'

import { deleteFileByShareToken, getMyFiles } from '@/app/lib/api/files'
import { deleteFolderByShareToken, getMyFolders } from '@/app/lib/api/folder'
import { groupUploadsByFolder } from '@/app/utils/groupUploads'
import { RECENT_UPLOADS_UPDATED_EVENT, getRecentUploads, markAsCopied, removeRecentUpload } from '@/app/utils/sessionStorage'
import { fileCountLabel, fileToEntry, folderToEntry, formatBytes } from '@/app/utils/uploadEntries'
import { getFolderShareLink, getShareLink } from '@/app/utils/upload'
import { useAuth } from '@/components/auth/useAuth'
import { type UploadEntry } from '@/components/me/UploadItemCard'
import UploadTree, { type UploadTreeGroup } from '@/components/me/UploadTree'
import { FileAccessType, type StoredItem } from '@/types/file'
import { Button, Modal, useOverlayState } from '@heroui/react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { FiAlertTriangle } from 'react-icons/fi'

const storedToEntry = (item: StoredItem): UploadEntry =>
  item.kind === 'folder'
    ? {
        kind: 'folder',
        id: item.shareToken,
        name: item.folderName,
        shareToken: item.shareToken,
        link: getFolderShareLink(item.shareToken),
        accessType: item.accessType as FileAccessType,
        expireAt: item.expireAt,
        meta: fileCountLabel(item.fileCount),
        downloadCount: null,
      }
    : {
        kind: 'file',
        id: item.shareToken,
        name: item.fileName,
        shareToken: item.shareToken,
        link: getShareLink(item.shareToken),
        accessType: item.accessType,
        expireAt: item.expireAt,
        meta: formatBytes(item.fileSize),
        downloadCount: null,
      }

const RecentUploads = () => {
  const { status, isAuthenticated } = useAuth()
  const [groups, setGroups] = useState<UploadTreeGroup[]>([])
  const [ungrouped, setUngrouped] = useState<UploadEntry[]>([])
  const [copiedToken, setCopiedToken] = useState<string | null>(null)
  const [itemToDelete, setItemToDelete] = useState<UploadEntry | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const deleteModal = useOverlayState()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    if (status === 'authenticated') {
      // Signed-in users get their persisted uploads from the backend, grouped folder → files.
      // The upload flow still dispatches the event, so refetch when a new upload lands.
      const load = async () => {
        try {
          const [myFiles, myFolders] = await Promise.all([getMyFiles(), getMyFolders()])
          const { groups: rawGroups, ungrouped: rawUngrouped } = groupUploadsByFolder(myFiles, myFolders)
          setGroups(
            rawGroups.map((group) => ({
              folder: { ...folderToEntry(group.folder), meta: fileCountLabel(group.files.length) },
              files: group.files.map(fileToEntry),
            })),
          )
          setUngrouped(rawUngrouped.map(fileToEntry))
        } catch {
          setGroups([])
          setUngrouped([])
        }
      }

      load()
      window.addEventListener(RECENT_UPLOADS_UPDATED_EVENT, load)

      return () => {
        window.removeEventListener(RECENT_UPLOADS_UPDATED_EVENT, load)
      }
    }

    // Anonymous users fall back to the sessionStorage list (no folder → file relationship).
    const syncSession = () => {
      setGroups([])
      setUngrouped(getRecentUploads().map(storedToEntry))
    }

    syncSession()
    window.addEventListener(RECENT_UPLOADS_UPDATED_EVENT, syncSession)

    return () => {
      window.removeEventListener(RECENT_UPLOADS_UPDATED_EVENT, syncSession)
    }
  }, [status])

  const handleCopy = useCallback(
    (entry: UploadEntry) => {
      navigator.clipboard.writeText(entry.link)
      if (!isAuthenticated) markAsCopied(entry.shareToken)
      setCopiedToken(entry.shareToken)
      setTimeout(() => setCopiedToken((current) => (current === entry.shareToken ? null : current)), 2000)
    },
    [isAuthenticated],
  )

  const handleOpen = useCallback((entry: UploadEntry) => router.push(entry.link), [router])

  const handleDeleteClick = useCallback(
    (entry: UploadEntry) => {
      setItemToDelete(entry)
      deleteModal.open()
    },
    [deleteModal],
  )

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return

    setIsDeleting(true)
    try {
      if (itemToDelete.kind === 'folder') {
        await deleteFolderByShareToken(itemToDelete.shareToken)
      } else {
        await deleteFileByShareToken(itemToDelete.shareToken)
      }

      if (isAuthenticated) {
        const token = itemToDelete.shareToken
        setGroups((current) =>
          current
            .filter((group) => group.folder.shareToken !== token)
            .map((group) => ({ ...group, files: group.files.filter((file) => file.shareToken !== token) })),
        )
        setUngrouped((current) => current.filter((entry) => entry.shareToken !== token))
      } else {
        removeRecentUpload(itemToDelete.shareToken)
      }
      deleteModal.close()
      setItemToDelete(null)
    } catch (error) {
      console.error('Failed to delete item:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  if (groups.length === 0 && ungrouped.length === 0) return null

  return (
    <div className="flex flex-col gap-4 mt-8 w-full">
      <h2 className="text-xl font-serif text-foreground text-left px-1">Currently uploaded</h2>

      <UploadTree
        groups={groups}
        ungrouped={ungrouped}
        copiedToken={copiedToken}
        onCopy={handleCopy}
        onOpen={handleOpen}
        onDelete={handleDeleteClick}
      />

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
                Are you sure you want to delete <span className="font-semibold text-ink-900">{itemToDelete?.name}</span>? This action cannot be undone.
              </p>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="ghost" onPress={deleteModal.close} className="flex-1 text-ink-600" isDisabled={isDeleting}>
                Cancel
              </Button>
              <Button onPress={handleConfirmDelete} className="flex-1 bg-red-500 text-white hover:bg-red-600" isPending={isDeleting}>
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
