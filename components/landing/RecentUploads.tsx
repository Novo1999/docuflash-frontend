'use client'

import { isEmailShareConfigured } from '@/app/constants/email'
import useFileUploadQR from '@/app/hooks/useFileUploadQR'
import { deleteFileByShareToken, getMyFiles } from '@/app/lib/api/files'
import { deleteFolderByShareToken, getMyFolders } from '@/app/lib/api/folder'
import { groupUploadsByFolder } from '@/app/utils/groupUploads'
import { RECENT_UPLOADS_UPDATED_EVENT, getRecentUploads, markAsCopied, removeRecentUpload } from '@/app/utils/sessionStorage'
import { fileCountLabel, fileToEntry, folderToEntry, formatBytes } from '@/app/utils/uploadEntries'
import { getFolderShareLink, getShareLink } from '@/app/utils/upload'
import { useAuth } from '@/components/auth/useAuth'
import { type UploadEntry } from '@/components/me/UploadItemCard'
import UploadTree, { type UploadTreeGroup } from '@/components/me/UploadTree'
import ShareToEmailModal, { type ShareEmailTarget } from '@/components/share/ShareToEmailModal'
import { FileAccessType, type StoredItem } from '@/types/file'
import { Button, Modal, useOverlayState } from '@heroui/react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import QRCode from 'react-qr-code'
import { FiAlertTriangle } from 'react-icons/fi'
import { LuDownload } from 'react-icons/lu'

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

const SkeletonCard = () => (
  <div className="bg-surface border border-line rounded-2xl p-4 font-sans" aria-hidden>
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-ink-900/10 animate-pulse shrink-0" />
      <div className="flex flex-col gap-2 flex-1 min-w-0">
        <div className="h-3.5 w-2/5 rounded bg-ink-900/10 animate-pulse" />
        <div className="h-3 w-1/4 rounded bg-ink-900/10 animate-pulse" />
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-ink-900/10 animate-pulse" />
        <div className="w-8 h-8 rounded-lg bg-ink-900/10 animate-pulse" />
        <div className="w-8 h-8 rounded-lg bg-ink-900/10 animate-pulse" />
      </div>
    </div>
  </div>
)

const RecentUploads = () => {
  const { status, isAuthenticated } = useAuth()
  const [groups, setGroups] = useState<UploadTreeGroup[]>([])
  const [ungrouped, setUngrouped] = useState<UploadEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [copiedToken, setCopiedToken] = useState<string | null>(null)
  const [itemToDelete, setItemToDelete] = useState<UploadEntry | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [qrEntry, setQrEntry] = useState<UploadEntry | null>(null)
  const [emailEntry, setEmailEntry] = useState<UploadEntry | null>(null)
  const deleteModal = useOverlayState()
  const qrModal = useOverlayState()
  const emailModal = useOverlayState()
  const { handleQrDownload } = useFileUploadQR({ fileName: qrEntry?.name })
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    if (status === 'authenticated') {
      // Signed-in users get their persisted uploads from the backend, grouped folder → files.
      // The upload flow still dispatches the event, so refetch when a new upload lands.
      let isInitialLoad = true
      const load = async () => {
        // Only show the skeleton on first load; event-driven refetches update in place.
        if (isInitialLoad) setIsLoading(true)
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
        } finally {
          setIsLoading(false)
          isInitialLoad = false
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
      setIsLoading(false)
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

  const handleShowQr = useCallback(
    (entry: UploadEntry) => {
      setQrEntry(entry)
      qrModal.open()
    },
    [qrModal],
  )

  const handleShareEmail = useCallback(
    (entry: UploadEntry) => {
      setEmailEntry(entry)
      emailModal.open()
    },
    [emailModal],
  )

  const emailTarget: ShareEmailTarget | null = emailEntry
    ? { name: emailEntry.name, link: emailEntry.link, resourceType: emailEntry.kind, isProtected: emailEntry.accessType === FileAccessType.PROTECTED }
    : null

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

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 mt-8 w-full">
        <h2 className="text-xl font-serif text-foreground text-left px-1">Currently uploaded</h2>
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      </div>
    )
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
        onShowQr={handleShowQr}
        onShareEmail={isEmailShareConfigured ? handleShareEmail : undefined}
        onOpen={handleOpen}
        onDelete={handleDeleteClick}
      />

      <ShareToEmailModal isOpen={emailModal.isOpen} onOpenChange={emailModal.setOpen} target={emailTarget} />

      <Modal.Backdrop isOpen={qrModal.isOpen} onOpenChange={qrModal.setOpen}>
        <Modal.Container>
          <Modal.Dialog className="sm:max-w-[360px]">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>Share QR code</Modal.Heading>
            </Modal.Header>
            <Modal.Body className="flex flex-col items-center gap-4">
              <p className="text-sm text-ink-600 truncate max-w-full">{qrEntry?.name}</p>
              <div className="p-4 bg-white rounded-2xl border border-black/[0.06] shadow-[0_2px_12px_rgba(15,28,46,0.06)]">
                <QRCode id="share-qr-code" value={qrEntry?.link ?? ''} size={240} level="M" bgColor="#ffffff" fgColor="#0f1c2e" />
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button
                fullWidth
                onPress={handleQrDownload}
                className="bg-[var(--ink-900)] text-[var(--brand-50)] rounded-xl text-base font-medium h-12 hover:bg-[var(--ink-800)] flex items-center justify-center gap-2"
              >
                <LuDownload className="w-4 h-4" />
                Download QR
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>

      <Modal.Backdrop isOpen={deleteModal.isOpen} onOpenChange={deleteModal.setOpen}>
        <Modal.Container>
          <Modal.Dialog className="sm:max-w-[360px]">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Icon className="bg-red-500/15 text-red-500">
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
