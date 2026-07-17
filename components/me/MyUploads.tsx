'use client'

import { isEmailShareConfigured } from '@/app/constants/email'
import useFileUploadQR from '@/app/hooks/useFileUploadQR'
import { useDebouncedValue } from '@/app/hooks/useDebouncedValue'
import { deleteFileByShareToken, getMyFiles } from '@/app/lib/api/files'
import { deleteFolderByShareToken, getMyFolders, moveFileToFolder } from '@/app/lib/api/folder'
import { groupUploadsByFolder } from '@/app/utils/groupUploads'
import { fileCountLabel, fileToEntry, folderToEntry } from '@/app/utils/uploadEntries'
import { useAuth } from '@/components/auth/useAuth'
import { type UploadEntry } from '@/components/me/UploadItemCard'
import UploadsSearchBar from '@/components/me/UploadsSearchBar'
import UploadTree, { type UploadTreeGroup } from '@/components/me/UploadTree'
import ShareToEmailModal, { type ShareEmailTarget } from '@/components/share/ShareToEmailModal'
import { FileAccessType, type MyFileRecord } from '@/types/file'
import type { MyFolderRecord } from '@/types/folder'
import { Button, Modal, Spinner, useOverlayState } from '@heroui/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { FiAlertTriangle } from 'react-icons/fi'
import { LuDownload } from 'react-icons/lu'
import QRCode from 'react-qr-code'

type LoadState = 'loading' | 'error' | 'ready'

const MyUploads = () => {
  const { status, isAuthenticated, openAuthModal } = useAuth()
  const router = useRouter()

  const [loadState, setLoadState] = useState<LoadState>('loading')
  const [files, setFiles] = useState<MyFileRecord[]>([])
  const [folders, setFolders] = useState<MyFolderRecord[]>([])

  const [query, setQuery] = useState('')
  const debouncedQuery = useDebouncedValue(query, 300)
  const [isSearching, setIsSearching] = useState(false)
  const [hasEverHadUploads, setHasEverHadUploads] = useState(false)
  const hasLoadedOnceRef = useRef(false)

  const [copiedToken, setCopiedToken] = useState<string | null>(null)
  const [qrEntry, setQrEntry] = useState<UploadEntry | null>(null)
  const [emailEntry, setEmailEntry] = useState<UploadEntry | null>(null)
  const [entryToDelete, setEntryToDelete] = useState<UploadEntry | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const qrModal = useOverlayState()
  const emailModal = useOverlayState()
  const deleteModal = useOverlayState()
  const { handleQrDownload } = useFileUploadQR({ fileName: qrEntry?.name })

  useEffect(() => {
    if (status !== 'authenticated') return

    let active = true
    const isFirstLoad = !hasLoadedOnceRef.current
    if (isFirstLoad) setLoadState('loading')
    else setIsSearching(true)

    Promise.all([getMyFiles(debouncedQuery), getMyFolders(debouncedQuery)])
      .then(([myFiles, myFolders]) => {
        if (!active) return
        setFiles(myFiles)
        setFolders(myFolders)
        setLoadState('ready')
        hasLoadedOnceRef.current = true
        if (!debouncedQuery.trim() && (myFiles.length > 0 || myFolders.length > 0)) {
          setHasEverHadUploads(true)
        }
      })
      .catch(() => {
        if (active) setLoadState('error')
      })
      .finally(() => {
        if (active) setIsSearching(false)
      })

    return () => {
      active = false
    }
  }, [status, debouncedQuery])

  const handleCopy = useCallback((entry: UploadEntry) => {
    navigator.clipboard.writeText(entry.link)
    setCopiedToken(entry.shareToken)
    setTimeout(() => setCopiedToken((current) => (current === entry.shareToken ? null : current)), 2000)
  }, [])

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

  const handleOpen = useCallback((entry: UploadEntry) => router.push(entry.link), [router])

  const handleDeleteClick = useCallback(
    (entry: UploadEntry) => {
      setEntryToDelete(entry)
      deleteModal.open()
    },
    [deleteModal],
  )

  const handleMoveFile = useCallback(
    async (fileEntry: UploadEntry, folderEntry: UploadEntry) => {
      const file = files.find((current) => current.id === fileEntry.id)
      if (!file || file.folders.some((ref) => ref.id === folderEntry.id)) return

      const previousFiles = files
      setFiles((current) =>
        current.map((item) => (item.id === fileEntry.id ? { ...item, folders: [{ id: folderEntry.id, folderName: folderEntry.name }] } : item)),
      )
      try {
        await moveFileToFolder(folderEntry.id, fileEntry.id)
      } catch (error) {
        console.error('Failed to move file:', error)
        setFiles(previousFiles)
      }
    },
    [files],
  )

  const handleConfirmDelete = async () => {
    if (!entryToDelete) return

    setIsDeleting(true)
    try {
      if (entryToDelete.kind === 'folder') {
        await deleteFolderByShareToken(entryToDelete.shareToken)
        setFolders((current) => current.filter((folder) => folder.shareToken !== entryToDelete.shareToken))
      } else {
        await deleteFileByShareToken(entryToDelete.shareToken)
        setFiles((current) => current.filter((file) => file.shareToken !== entryToDelete.shareToken))
      }
      deleteModal.close()
      setEntryToDelete(null)
    } catch (error) {
      console.error('Failed to delete item:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  if (status === 'loading') {
    return (
      <main className="flex-1 flex items-center justify-center px-6 py-20">
        <Spinner className="text-[var(--ink-900)]" />
      </main>
    )
  }

  if (!isAuthenticated) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center gap-4 px-6 py-20 text-center font-sans">
        <p className="text-xl font-serif text-[var(--ink-900)]">You&apos;re not signed in</p>
        <p className="text-sm text-[var(--ink-600)] max-w-sm">Sign in to view the files and folders you&apos;ve uploaded.</p>
        <div className="flex items-center gap-3">
          <Button onPress={openAuthModal} className="bg-[var(--ink-900)] text-[var(--brand-50)] rounded-full font-medium h-10 px-6 text-sm hover:bg-[var(--ink-800)]">
            Sign in
          </Button>
          <Link href="/" className="text-sm text-[var(--ink-600)] no-underline hover:text-[var(--ink-900)]">
            Back to home
          </Link>
        </div>
      </main>
    )
  }

  const { groups, ungrouped } = groupUploadsByFolder(files, folders)
  const treeGroups: UploadTreeGroup[] = groups.map((group) => ({
    folder: { ...folderToEntry(group.folder), meta: fileCountLabel(group.files.length) },
    files: group.files.map(fileToEntry),
  }))
  const ungroupedEntries = ungrouped.map(fileToEntry)
  const isEmpty = loadState === 'ready' && treeGroups.length === 0 && ungroupedEntries.length === 0
  const hasActiveQuery = debouncedQuery.trim().length > 0
  const showSearchBar = hasEverHadUploads || query.length > 0
  const emailTarget: ShareEmailTarget | null = emailEntry
    ? { name: emailEntry.name, link: emailEntry.link, resourceType: emailEntry.kind, isProtected: emailEntry.accessType === FileAccessType.PROTECTED }
    : null

  return (
    <>
      {loadState === 'loading' ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-[74px] rounded-2xl bg-ink-900/10 animate-pulse" aria-hidden />
          ))}
        </div>
      ) : loadState === 'error' ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <p className="text-sm text-[var(--ink-600)]">We couldn&apos;t load your uploads. Please try again.</p>
          <Button onPress={() => router.refresh()} variant="ghost" className="rounded-xl text-[var(--ink-700)]">
            Retry
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {showSearchBar ? <UploadsSearchBar value={query} onChange={setQuery} isSearching={isSearching} /> : null}

          {isEmpty ? (
            hasActiveQuery ? (
              <div className="flex flex-col items-center gap-3 py-16 text-center">
                <p className="text-base text-[var(--ink-900)]">No matches found</p>
                <p className="text-sm text-[var(--ink-600)] max-w-sm">
                  No files or folders match &ldquo;{debouncedQuery.trim()}&rdquo;. Try a different search.
                </p>
                <button type="button" onClick={() => setQuery('')} className="text-sm text-[var(--brand-500)] hover:underline">
                  Clear search
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 py-16 text-center">
                <p className="text-base text-[var(--ink-900)]">No uploads yet</p>
                <p className="text-sm text-[var(--ink-600)] max-w-sm">Anything you upload while signed in will show up here so you can share or manage it later.</p>
                <Link href="/" className="text-sm text-[var(--brand-500)] no-underline hover:underline">
                  Upload a file
                </Link>
              </div>
            )
          ) : (
            <UploadTree
              groups={treeGroups}
              ungrouped={ungroupedEntries}
              copiedToken={copiedToken}
              onCopy={handleCopy}
              onShowQr={handleShowQr}
              onShareEmail={isEmailShareConfigured ? handleShareEmail : undefined}
              onOpen={handleOpen}
              onDelete={handleDeleteClick}
              onMoveFile={handleMoveFile}
            />
          )}
        </div>
      )}

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
              <Modal.Heading>Delete {entryToDelete?.kind === 'folder' ? 'folder' : 'file'}</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <p className="text-sm text-ink-600">
                Are you sure you want to delete <span className="font-semibold text-ink-900">{entryToDelete?.name}</span>? This action cannot be undone.
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
    </>
  )
}

export default MyUploads
